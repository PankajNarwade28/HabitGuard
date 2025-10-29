#!/usr/bin/env python3
"""
HabitGuard ML Usage Predictor with Neural Network
==================================================

Advanced ML system using TensorFlow for behavior prediction and student monitoring.

Features:
- Neural network-based behavior prediction
- Student mode with social media restrictions
- PDF/TXT report generation
- Personalized recommendations
- Usage pattern analysis

Usage:
    python usage_predictor.py [csv_file_path]
"""

import pandas as pd
import numpy as np
import json
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

# Try to import ML libraries
try:
    import tensorflow as tf
    from tensorflow.keras import layers, models
    TF_AVAILABLE = True
except ImportError:
    print("⚠️  TensorFlow not installed. Install with: pip install tensorflow")
    TF_AVAILABLE = False

try:
    from sklearn.linear_model import LinearRegression
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score
    SKLEARN_AVAILABLE = True
except ImportError:
    print("⚠️  scikit-learn not installed. Install with: pip install scikit-learn pandas numpy")
    SKLEARN_AVAILABLE = False

# Try to import PDF generation libraries
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
    from reportlab.lib.units import inch
    PDF_AVAILABLE = True
except ImportError:
    print("⚠️  reportlab not installed. Install with: pip install reportlab")
    PDF_AVAILABLE = False


class NeuralUsagePredictor:
    """Neural Network-based usage predictor using TensorFlow"""
    
    def __init__(self, model_path='models/usage_nn_model.h5'):
        self.model_path = model_path
        self.model = None
        self.feature_names = [
            'social_media_hours',
            'entertainment_hours', 
            'productivity_hours',
            'communication_hours',
            'gaming_hours',
            'browsing_hours',
            'education_hours',
            'shopping_hours',
            'news_hours',
            'other_hours'
        ]
        self.class_names = ['No Change ✅', 'Reduce Usage ⚠️', 'Take More Breaks 🌟']
        
    def build_model(self, input_shape=10):
        """Build the neural network model"""
        if not TF_AVAILABLE:
            print("❌ TensorFlow not available. Install with: pip install tensorflow")
            return None
            
        model = models.Sequential([
            layers.Dense(64, activation='relu', input_shape=(input_shape,)),
            layers.Dropout(0.3),
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(16, activation='relu'),
            layers.Dense(3, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        print("✅ Neural network model built successfully")
        return model
    
    def train_model(self, X_train, y_train, epochs=40, batch_size=32):
        """Train the model with usage data"""
        if not TF_AVAILABLE:
            return None
            
        if self.model is None:
            self.build_model(input_shape=X_train.shape[1])
        
        # Convert to one-hot encoding if needed
        if len(y_train.shape) == 1:
            y_train = tf.keras.utils.to_categorical(y_train, num_classes=3)
        
        print(f"🤖 Training neural network on {len(X_train)} samples...")
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.1,
            verbose=0
        )
        
        print(f"✅ Training complete! Final accuracy: {history.history['accuracy'][-1]:.2%}")
        return history
    
    def save_model(self):
        """Save trained model to disk"""
        if not TF_AVAILABLE or self.model is None:
            return
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        self.model.save(self.model_path)
        print(f"💾 Model saved to {self.model_path}")
    
    def load_model(self):
        """Load trained model from disk"""
        if not TF_AVAILABLE:
            return False
        if os.path.exists(self.model_path):
            self.model = tf.keras.models.load_model(self.model_path)
            print(f"✅ Model loaded from {self.model_path}")
            return True
        return False
    
    def predict(self, usage_data):
        """
        Predict suggestion for user based on usage data
        
        Args:
            usage_data: dict with app categories and hours, or numpy array
        
        Returns:
            dict with prediction details
        """
        if not TF_AVAILABLE:
            return {"error": "TensorFlow not available"}
            
        if self.model is None:
            if not self.load_model():
                # Try to create and train a basic model
                print("⚠️ No trained model found. Using baseline predictions.")
                return self._baseline_prediction(usage_data)
        
        # Convert dict to array if needed
        if isinstance(usage_data, dict):
            features = []
            for feature in self.feature_names:
                features.append(usage_data.get(feature, 0))
            usage_array = np.array([features])
        else:
            usage_array = np.array([usage_data])
        
        # Make prediction
        predictions = self.model.predict(usage_array, verbose=0)
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        
        # Generate detailed suggestion
        suggestion = self._generate_suggestion(
            usage_data if isinstance(usage_data, dict) else dict(zip(self.feature_names, usage_data)),
            predicted_class,
            confidence
        )
        
        return {
            'prediction_class': int(predicted_class),
            'class_name': self.class_names[predicted_class],
            'confidence': confidence,
            'probabilities': {
                self.class_names[i]: float(predictions[0][i])
                for i in range(3)
            },
            'suggestion': suggestion,
            'timestamp': datetime.now().isoformat()
        }
    
    def _baseline_prediction(self, usage_data):
        """Fallback prediction without ML model"""
        if isinstance(usage_data, dict):
            total_hours = sum(usage_data.values())
        else:
            total_hours = sum(usage_data)
        
        # Simple rule-based prediction
        if total_hours < 4:
            predicted_class = 0  # No change
        elif total_hours < 8:
            predicted_class = 2  # Take breaks
        else:
            predicted_class = 1  # Reduce usage
        
        confidence = 0.7
        suggestion = self._generate_suggestion(usage_data, predicted_class, confidence)
        
        return {
            'prediction_class': predicted_class,
            'class_name': self.class_names[predicted_class],
            'confidence': confidence,
            'probabilities': {self.class_names[predicted_class]: confidence},
            'suggestion': suggestion,
            'timestamp': datetime.now().isoformat(),
            'note': 'Using baseline prediction (ML model not available)'
        }
    
    def _generate_suggestion(self, usage_data, predicted_class, confidence):
        """Generate detailed suggestion based on prediction"""
        if isinstance(usage_data, dict):
            total_hours = sum(usage_data.values())
            # Find top usage categories
            sorted_usage = sorted(usage_data.items(), key=lambda x: x[1], reverse=True)
            top_category = sorted_usage[0][0] if sorted_usage else "unknown"
            top_hours = sorted_usage[0][1] if sorted_usage else 0
        else:
            total_hours = sum(usage_data)
            top_category = "apps"
            top_hours = max(usage_data) if len(usage_data) > 0 else 0
        
        suggestions = {
            0: {  # No Change
                'title': '✅ Great Digital Balance!',
                'message': f'Your screen time of {total_hours:.1f}h is well balanced. Keep it up!',
                'tips': [
                    'Maintain your current healthy habits',
                    'Continue taking regular breaks',
                    'Stay mindful of your usage patterns',
                    'Share your success with others'
                ]
            },
            1: {  # Reduce Usage
                'title': '⚠️ Time to Cut Back',
                'message': f'Your {top_category.replace("_", " ")} usage ({top_hours:.1f}h) is high. Consider reducing screen time.',
                'tips': [
                    f'Set a daily limit of {max(top_hours * 0.7, 1):.1f}h for {top_category.replace("_", " ")}',
                    'Use app timers to enforce limits',
                    'Replace screen time with physical activities',
                    'Schedule device-free hours during the day',
                    'Try the "one hour before bed" rule'
                ]
            },
            2: {  # Increase Breaks
                'title': '🌟 Add More Breaks',
                'message': f'With {total_hours:.1f}h of screen time, you need more frequent breaks.',
                'tips': [
                    'Follow the 20-20-20 rule: Every 20 min, look 20 feet away for 20 seconds',
                    'Take a 5-minute break every hour',
                    'Use break reminder apps',
                    'Stand up and stretch regularly',
                    'Practice eye exercises'
                ]
            }
        }
        
        return suggestions[predicted_class]
    
    def check_student_restrictions(self, usage_data, is_student=True):
        """
        Check if student is overusing social media and provide restrictions
        
        Args:
            usage_data: dict with usage hours by category
            is_student: boolean indicating if user is a student
        
        Returns:
            dict with restriction recommendations
        """
        if not is_student:
            return {'restricted': False, 'message': 'Not in student mode'}
        
        # Student-specific thresholds (hours per day)
        thresholds = {
            'social_media_hours': 2.0,  # Max 2 hours
            'entertainment_hours': 3.0,  # Max 3 hours
            'gaming_hours': 1.5,         # Max 1.5 hours
            'browsing_hours': 2.0        # Max 2 hours
        }
        
        violations = []
        recommendations = []
        
        for category, limit in thresholds.items():
            actual = usage_data.get(category, 0)
            if actual > limit:
                excess = actual - limit
                violations.append({
                    'category': category.replace('_', ' ').title(),
                    'actual': round(actual, 2),
                    'limit': limit,
                    'excess': round(excess, 2),
                    'severity': 'high' if excess > 2 else 'medium' if excess > 1 else 'low'
                })
                recommendations.append(
                    f"Reduce {category.replace('_hours', '').replace('_', ' ')} by {excess:.1f}h (currently {actual:.1f}h, limit {limit:.1f}h)"
                )
        
        if violations:
            return {
                'restricted': True,
                'violations': violations,
                'recommendations': recommendations,
                'severity': 'high' if len(violations) >= 3 else 'medium' if len(violations) == 2 else 'low',
                'message': f'⚠️ Student Mode: {len(violations)} usage limit(s) exceeded',
                'suggested_actions': [
                    'Enable app timers for restricted apps',
                    'Use focus mode during study hours (9 AM - 5 PM)',
                    'Set up bedtime restrictions (10 PM - 7 AM)',
                    'Request parent/guardian monitoring if under 18'
                ],
                'blocked_apps': self._get_student_blocked_apps(violations)
            }
        else:
            return {
                'restricted': False,
                'message': '✅ All usage within student limits',
                'encouragement': 'Great job maintaining healthy digital habits!',
                'productivity_score': self._calculate_productivity_score(usage_data)
            }
    
    def _get_student_blocked_apps(self, violations):
        """Get list of apps that should be blocked for students"""
        blocked = []
        social_media_apps = [
            'Instagram', 'TikTok', 'Snapchat', 'Facebook', 
            'Twitter/X', 'BeReal', 'Discord (non-educational)'
        ]
        gaming_apps = [
            'Mobile Games', 'PUBG', 'Free Fire', 'Candy Crush',
            'Roblox', 'Minecraft (except educational)'
        ]
        
        for v in violations:
            if 'social media' in v['category'].lower():
                blocked.extend(social_media_apps)
            elif 'gaming' in v['category'].lower():
                blocked.extend(gaming_apps)
        
        return list(set(blocked))[:10]  # Return unique, max 10
    
    def _calculate_productivity_score(self, usage_data):
        """Calculate productivity score for students"""
        productive_hours = usage_data.get('education_hours', 0) + usage_data.get('productivity_hours', 0)
        total_hours = sum(usage_data.values())
        
        if total_hours == 0:
            return 0
        
        score = (productive_hours / total_hours) * 100
        return round(score, 1)


class HabitGuardMLAnalyzer:
    """ML Analyzer for mobile usage patterns"""
    
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.model = RandomForestRegressor(n_estimators=100, random_state=42) if SKLEARN_AVAILABLE else None
        
    def load_csv_data(self, csv_content: str = None, csv_file: str = None) -> bool:
        """Load usage data from CSV content or file"""
        try:
            if csv_content:
                # Load from string content (from React Native app)
                from io import StringIO
                self.df = pd.read_csv(StringIO(csv_content))
                print("✅ Loaded data from CSV content")
            elif csv_file and os.path.exists(csv_file):
                # Load from file
                self.df = pd.read_csv(csv_file)
                print(f"✅ Loaded data from {csv_file}")
            else:
                print("❌ No valid CSV data provided")
                return False
                
            # Validate required columns
            required_cols = ['date', 'totalScreenTime', 'appCount', 'dayOfWeek', 'isWeekend']
            missing_cols = [col for col in required_cols if col not in self.df.columns]
            
            if missing_cols:
                print(f"❌ Missing required columns: {missing_cols}")
                return False
                
            # Convert data types
            self.df['date'] = pd.to_datetime(self.df['date'])
            self.df['totalScreenTime'] = pd.to_numeric(self.df['totalScreenTime'], errors='coerce')
            self.df['appCount'] = pd.to_numeric(self.df['appCount'], errors='coerce')
            self.df['isWeekend'] = self.df['isWeekend'].astype(bool)
            
            # Remove rows with invalid data
            self.df = self.df.dropna(subset=['totalScreenTime', 'appCount'])
            
            print(f"📊 Dataset loaded: {len(self.df)} records from {self.df['date'].min()} to {self.df['date'].max()}")
            return True
            
        except Exception as e:
            print(f"❌ Error loading CSV data: {e}")
            return False
    
    def analyze_patterns(self) -> Dict:
        """Analyze usage patterns and generate insights"""
        if self.df is None or len(self.df) == 0:
            return {"error": "No data available for analysis"}
            
        try:
            # Convert screen time from milliseconds to hours
            self.df['screenTimeHours'] = self.df['totalScreenTime'] / (1000 * 60 * 60)
            
            analysis = {
                "summary": {
                    "totalDays": len(self.df),
                    "avgDailyScreenTime": float(self.df['screenTimeHours'].mean()),
                    "maxDailyScreenTime": float(self.df['screenTimeHours'].max()),
                    "minDailyScreenTime": float(self.df['screenTimeHours'].min()),
                    "avgAppsPerDay": float(self.df['appCount'].mean()),
                    "totalScreenTimeHours": float(self.df['screenTimeHours'].sum())
                },
                "patterns": {
                    "weekdayVsWeekend": {
                        "weekday": float(self.df[~self.df['isWeekend']]['screenTimeHours'].mean()),
                        "weekend": float(self.df[self.df['isWeekend']]['screenTimeHours'].mean())
                    },
                    "dailyAverages": {},
                    "trends": self._calculate_trends(),
                    "behaviorClassification": self._classify_behavior()
                },
                "predictions": {},
                "recommendations": []
            }
            
            # Daily averages by day of week
            day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            for day in range(7):
                day_data = self.df[self.df['dayOfWeek'] == day]['screenTimeHours']
                if len(day_data) > 0:
                    analysis["patterns"]["dailyAverages"][day_names[day]] = float(day_data.mean())
            
            # Generate ML predictions if possible
            if SKLEARN_AVAILABLE and len(self.df) >= 7:
                analysis["predictions"] = self._generate_predictions()
            
            # Generate recommendations
            analysis["recommendations"] = self._generate_recommendations(analysis)
            
            return analysis
            
        except Exception as e:
            return {"error": f"Analysis failed: {e}"}
    
    def _calculate_trends(self) -> Dict:
        """Calculate usage trends over time"""
        try:
            if len(self.df) < 3:
                return {"trend": "insufficient_data"}
                
            # Sort by date and calculate rolling average
            df_sorted = self.df.sort_values('date').copy()
            df_sorted['rolling_avg'] = df_sorted['screenTimeHours'].rolling(window=3, min_periods=1).mean()
            
            # Calculate trend (simple linear regression on time)
            x = np.arange(len(df_sorted)).reshape(-1, 1)
            y = df_sorted['screenTimeHours'].values
            
            if SKLEARN_AVAILABLE:
                trend_model = LinearRegression().fit(x, y)
                slope = trend_model.coef_[0]
                
                if slope > 0.1:
                    trend = "increasing"
                elif slope < -0.1:
                    trend = "decreasing"
                else:
                    trend = "stable"
            else:
                # Simple trend calculation without sklearn
                first_half = df_sorted['screenTimeHours'].iloc[:len(df_sorted)//2].mean()
                second_half = df_sorted['screenTimeHours'].iloc[len(df_sorted)//2:].mean()
                
                if second_half > first_half * 1.1:
                    trend = "increasing"
                elif second_half < first_half * 0.9:
                    trend = "decreasing"
                else:
                    trend = "stable"
            
            return {
                "trend": trend,
                "recent_avg": float(df_sorted['screenTimeHours'].tail(7).mean()) if len(df_sorted) >= 7 else float(df_sorted['screenTimeHours'].mean()),
                "overall_avg": float(df_sorted['screenTimeHours'].mean())
            }
            
        except Exception as e:
            return {"trend": "error", "message": str(e)}
    
    def _classify_behavior(self) -> str:
        """Classify user behavior pattern"""
        if self.df is None or len(self.df) == 0:
            return "unknown"
            
        avg_hours = self.df['screenTimeHours'].mean()
        
        if avg_hours < 2:
            return "light_user"
        elif avg_hours < 4:
            return "moderate_user"
        elif avg_hours < 6:
            return "heavy_user"
        else:
            return "excessive_user"
    
    def _generate_predictions(self) -> Dict:
        """Generate ML-based predictions"""
        if not SKLEARN_AVAILABLE or self.df is None or len(self.df) < 7:
            return {"error": "Insufficient data or ML libraries not available"}
            
        try:
            # Prepare features
            features = ['dayOfWeek', 'appCount']
            X = self.df[features].copy()
            
            # Add engineered features
            X['isWeekend'] = self.df['isWeekend'].astype(int)
            X['daysSinceStart'] = (self.df['date'] - self.df['date'].min()).dt.days
            
            y = self.df['screenTimeHours']
            
            # Split data
            if len(X) >= 10:
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
            else:
                X_train, X_test, y_train, y_test = X, X, y, y
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test_scaled)
            
            # Calculate metrics
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Predict next 7 days
            future_predictions = []
            today = datetime.now()
            
            for i in range(7):
                future_date = today + timedelta(days=i)
                day_of_week = future_date.weekday() + 1  # Convert to 1-7 format
                if day_of_week == 7:
                    day_of_week = 0  # Sunday = 0
                    
                is_weekend = day_of_week in [0, 6]  # Sunday or Saturday
                avg_app_count = self.df['appCount'].mean()
                days_since_start = (future_date.date() - self.df['date'].min().date()).days
                
                future_X = np.array([[day_of_week, avg_app_count, int(is_weekend), days_since_start]])
                future_X_scaled = self.scaler.transform(future_X)
                
                prediction = self.model.predict(future_X_scaled)[0]
                
                future_predictions.append({
                    "date": future_date.strftime("%Y-%m-%d"),
                    "dayOfWeek": day_of_week,
                    "predictedScreenTimeHours": float(max(0, prediction)),
                    "isWeekend": is_weekend
                })
            
            return {
                "model_performance": {
                    "mean_absolute_error_hours": float(mae),
                    "r2_score": float(r2),
                    "accuracy": "good" if r2 > 0.5 else "fair" if r2 > 0.2 else "poor"
                },
                "next_7_days": future_predictions,
                "weekly_prediction": float(sum(p["predictedScreenTimeHours"] for p in future_predictions))
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {e}"}
    
    def _generate_recommendations(self, analysis: Dict) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        try:
            if "summary" not in analysis:
                return ["Unable to generate recommendations due to insufficient data"]
                
            avg_hours = analysis["summary"]["avgDailyScreenTime"]
            behavior = analysis["patterns"]["behaviorClassification"]
            
            # General recommendations based on usage level
            if behavior == "excessive_user":
                recommendations.extend([
                    "🚨 Your screen time is very high. Consider setting app time limits.",
                    "📱 Try the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.",
                    "🛌 Establish a phone-free bedtime routine to improve sleep quality.",
                    "🎯 Set a daily screen time goal and track your progress."
                ])
            elif behavior == "heavy_user":
                recommendations.extend([
                    "⚠️ Your screen time is above average. Consider reducing by 30 minutes daily.",
                    "📵 Try implementing 'phone-free' periods during meals and family time.",
                    "🔔 Review your notification settings to reduce unnecessary interruptions."
                ])
            elif behavior == "moderate_user":
                recommendations.extend([
                    "✅ Your usage is moderate. Focus on mindful usage quality over quantity.",
                    "🎯 Try batching similar activities to reduce context switching.",
                    "⏰ Use focus modes during work or study periods."
                ])
            else:  # light_user
                recommendations.extend([
                    "🌟 Great job maintaining low screen time!",
                    "📚 Consider using your extra time for offline activities you enjoy.",
                    "👥 Share your digital wellness tips with friends and family."
                ])
            
            # Weekend vs weekday recommendations
            if "weekdayVsWeekend" in analysis["patterns"]:
                weekend_avg = analysis["patterns"]["weekdayVsWeekend"]["weekend"]
                weekday_avg = analysis["patterns"]["weekdayVsWeekend"]["weekday"]
                
                if weekend_avg > weekday_avg * 1.5:
                    recommendations.append(
                        "📅 Your weekend usage is significantly higher. Plan offline weekend activities."
                    )
                elif weekday_avg > weekend_avg * 1.5:
                    recommendations.append(
                        "💼 High weekday usage detected. Consider work-life balance and productivity apps."
                    )
            
            # Trend-based recommendations
            if "trends" in analysis["patterns"]:
                trend = analysis["patterns"]["trends"]["trend"]
                if trend == "increasing":
                    recommendations.append(
                        "📈 Your usage is trending upward. Now might be a good time to set boundaries."
                    )
                elif trend == "decreasing":
                    recommendations.append(
                        "📉 Great progress! Your usage is decreasing. Keep up the good habits."
                    )
            
            return recommendations[:6]  # Limit to 6 recommendations
            
        except Exception as e:
            return [f"Error generating recommendations: {e}"]
    
    def generate_pdf_report(self, analysis: Dict, output_file: str = None) -> str:
        """
        Generate a comprehensive PDF report of usage analysis
        
        Args:
            analysis: Analysis dict from analyze_patterns()
            output_file: Output PDF filename (default: habitguard_report_YYYYMMDD.pdf)
        
        Returns:
            str: Path to generated PDF file or error message
        """
        if not PDF_AVAILABLE:
            return "❌ Error: reportlab not installed. Install with: pip install reportlab"
        
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image as RLImage
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.lib import colors
            from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
            
            # Generate filename if not provided
            if output_file is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_file = f"habitguard_report_{timestamp}.pdf"
            
            # Ensure .pdf extension
            if not output_file.endswith('.pdf'):
                output_file += '.pdf'
            
            # Create PDF document
            doc = SimpleDocTemplate(output_file, pagesize=letter)
            story = []
            styles = getSampleStyleSheet()
            
            # Custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#2563eb'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=16,
                textColor=colors.HexColor('#1e40af'),
                spaceAfter=12,
                spaceBefore=12
            )
            
            # Title
            story.append(Paragraph("📊 HabitGuard Usage Report", title_style))
            story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", styles['Normal']))
            story.append(Spacer(1, 0.3 * inch))
            
            # Summary Section
            if "summary" in analysis:
                story.append(Paragraph("📋 Usage Summary", heading_style))
                summary = analysis["summary"]
                
                summary_data = [
                    ['Metric', 'Value'],
                    ['Total Days Analyzed', str(summary.get('totalDays', 0))],
                    ['Average Daily Screen Time', f"{summary.get('avgDailyScreenTime', 0):.1f} hours"],
                    ['Total Screen Time', f"{summary.get('totalScreenTime', 0):.1f} hours"],
                    ['Average Apps Per Day', f"{summary.get('avgAppsPerDay', 0):.0f}"],
                    ['Peak Usage Day', summary.get('peakDay', 'N/A')]
                ]
                
                summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
                summary_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 12),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
                ]))
                
                story.append(summary_table)
                story.append(Spacer(1, 0.2 * inch))
            
            # Behavior Classification
            if "patterns" in analysis:
                story.append(Paragraph("🏷️ Behavior Classification", heading_style))
                behavior = analysis["patterns"].get("behaviorClassification", "unknown").replace('_', ' ').title()
                story.append(Paragraph(f"<b>Classification:</b> {behavior}", styles['Normal']))
                story.append(Spacer(1, 0.2 * inch))
                
                # Trends
                if "trends" in analysis["patterns"]:
                    trend_info = analysis["patterns"]["trends"]
                    story.append(Paragraph(f"<b>Usage Trend:</b> {trend_info.get('trend', 'stable').title()}", styles['Normal']))
                    story.append(Spacer(1, 0.1 * inch))
                
                # Weekend vs Weekday
                if "weekdayVsWeekend" in analysis["patterns"]:
                    wvw = analysis["patterns"]["weekdayVsWeekend"]
                    story.append(Paragraph(
                        f"<b>Weekday Average:</b> {wvw.get('weekday', 0):.1f}h | "
                        f"<b>Weekend Average:</b> {wvw.get('weekend', 0):.1f}h", 
                        styles['Normal']
                    ))
                
                story.append(Spacer(1, 0.2 * inch))
            
            # Predictions
            if "predictions" in analysis and "next_7_days" in analysis["predictions"]:
                story.append(Paragraph("🔮 7-Day Predictions", heading_style))
                
                pred_data = [['Date', 'Day Type', 'Predicted Screen Time']]
                for pred in analysis["predictions"]["next_7_days"]:
                    day_type = "🏖️ Weekend" if pred.get("isWeekend") else "💼 Weekday"
                    pred_data.append([
                        pred.get('date', 'N/A'),
                        day_type,
                        f"{pred.get('predictedScreenTimeHours', 0):.1f} hours"
                    ])
                
                weekly_total = analysis["predictions"].get("weekly_prediction", 0)
                pred_data.append(['', 'Weekly Total:', f"{weekly_total:.1f} hours"])
                
                pred_table = Table(pred_data, colWidths=[2*inch, 2*inch, 2*inch])
                pred_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -2), 1, colors.black),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.lightgrey]),
                    ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fef3c7')),
                    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                    ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black)
                ]))
                
                story.append(pred_table)
                story.append(Spacer(1, 0.2 * inch))
            
            # Recommendations
            story.append(Paragraph("💡 Personalized Recommendations", heading_style))
            for i, rec in enumerate(analysis.get("recommendations", []), 1):
                story.append(Paragraph(f"{i}. {rec}", styles['Normal']))
                story.append(Spacer(1, 0.1 * inch))
            
            story.append(Spacer(1, 0.3 * inch))
            story.append(Paragraph(
                "<i>This report was generated by HabitGuard ML Analyzer. "
                "Use these insights to improve your digital wellness.</i>",
                styles['Italic']
            ))
            
            # Build PDF
            doc.build(story)
            
            print(f"✅ PDF report generated: {output_file}")
            return output_file
            
        except Exception as e:
            error_msg = f"❌ Error generating PDF report: {e}"
            print(error_msg)
            return error_msg
    
    def generate_txt_report(self, analysis: Dict, output_file: str = None) -> str:
        """
        Generate a plain text report of usage analysis
        
        Args:
            analysis: Analysis dict from analyze_patterns()
            output_file: Output TXT filename (default: habitguard_report_YYYYMMDD.txt)
        
        Returns:
            str: Path to generated TXT file or error message
        """
        try:
            # Generate filename if not provided
            if output_file is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_file = f"habitguard_report_{timestamp}.txt"
            
            # Ensure .txt extension
            if not output_file.endswith('.txt'):
                output_file += '.txt'
            
            with open(output_file, 'w', encoding='utf-8') as f:
                # Header
                f.write("=" * 60 + "\n")
                f.write("📊 HABITGUARD USAGE REPORT\n")
                f.write("=" * 60 + "\n")
                f.write(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}\n")
                f.write("=" * 60 + "\n\n")
                
                # Summary
                if "summary" in analysis:
                    f.write("📋 USAGE SUMMARY\n")
                    f.write("-" * 60 + "\n")
                    summary = analysis["summary"]
                    f.write(f"Total Days Analyzed:        {summary.get('totalDays', 0)}\n")
                    f.write(f"Average Daily Screen Time:  {summary.get('avgDailyScreenTime', 0):.1f} hours\n")
                    f.write(f"Total Screen Time:          {summary.get('totalScreenTime', 0):.1f} hours\n")
                    f.write(f"Average Apps Per Day:       {summary.get('avgAppsPerDay', 0):.0f}\n")
                    f.write(f"Peak Usage Day:             {summary.get('peakDay', 'N/A')}\n")
                    f.write("\n")
                
                # Patterns
                if "patterns" in analysis:
                    f.write("🏷️ BEHAVIOR ANALYSIS\n")
                    f.write("-" * 60 + "\n")
                    behavior = analysis["patterns"].get("behaviorClassification", "unknown")
                    f.write(f"Classification: {behavior.replace('_', ' ').title()}\n")
                    
                    if "trends" in analysis["patterns"]:
                        trend = analysis["patterns"]["trends"].get("trend", "stable")
                        f.write(f"Usage Trend:    {trend.title()}\n")
                    
                    if "weekdayVsWeekend" in analysis["patterns"]:
                        wvw = analysis["patterns"]["weekdayVsWeekend"]
                        f.write(f"Weekday Avg:    {wvw.get('weekday', 0):.1f} hours\n")
                        f.write(f"Weekend Avg:    {wvw.get('weekend', 0):.1f} hours\n")
                    
                    f.write("\n")
                
                # Predictions
                if "predictions" in analysis and "next_7_days" in analysis["predictions"]:
                    f.write("🔮 7-DAY PREDICTIONS\n")
                    f.write("-" * 60 + "\n")
                    for pred in analysis["predictions"]["next_7_days"]:
                        day_emoji = "🏖️" if pred.get("isWeekend") else "💼"
                        f.write(f"{day_emoji} {pred.get('date', 'N/A'):12} | "
                               f"{pred.get('predictedScreenTimeHours', 0):5.1f} hours\n")
                    
                    weekly_total = analysis["predictions"].get("weekly_prediction", 0)
                    f.write("-" * 60 + "\n")
                    f.write(f"Predicted Weekly Total: {weekly_total:.1f} hours\n")
                    f.write("\n")
                
                # Recommendations
                f.write("💡 PERSONALIZED RECOMMENDATIONS\n")
                f.write("-" * 60 + "\n")
                for i, rec in enumerate(analysis.get("recommendations", []), 1):
                    f.write(f"{i}. {rec}\n")
                
                f.write("\n" + "=" * 60 + "\n")
                f.write("This report was generated by HabitGuard ML Analyzer.\n")
                f.write("Use these insights to improve your digital wellness.\n")
                f.write("=" * 60 + "\n")
            
            print(f"✅ Text report generated: {output_file}")
            return output_file
            
        except Exception as e:
            error_msg = f"❌ Error generating text report: {e}"
            print(error_msg)
            return error_msg


def main():
    """Main function for command line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='🤖 HabitGuard ML Usage Predictor')
    parser.add_argument('--csv', type=str, help='Path to CSV data file')
    parser.add_argument('--pdf', action='store_true', help='Generate PDF report')
    parser.add_argument('--txt', action='store_true', help='Generate TXT report')
    parser.add_argument('--output', type=str, help='Output filename for report')
    parser.add_argument('--student-mode', action='store_true', help='Check student usage restrictions')
    parser.add_argument('--predict', action='store_true', help='Use neural network predictor')
    parser.add_argument('--train-nn', action='store_true', help='Train neural network model')
    
    args = parser.parse_args()
    
    print("🤖 HabitGuard ML Usage Predictor")
    print("=" * 40)
    
    # Initialize traditional analyzer
    analyzer = HabitGuardMLAnalyzer()
    
    # Neural Network Predictor Mode
    if args.predict or args.train_nn:
        print("\n🧠 Neural Network Mode")
        print("-" * 40)
        
        nn_predictor = NeuralUsagePredictor()
        
        if args.train_nn:
            # Train with sample data
            print("📚 Training neural network with sample data...")
            
            # Generate training data (simulated)
            np.random.seed(42)
            n_samples = 1000
            
            # 10 features: hours for each category
            X_train = np.random.rand(n_samples, 10) * 5  # 0-5 hours per category
            
            # 3 classes: 0=No Change, 1=Reduce Usage, 2=Take Breaks
            # Simple rule: sum > 8 -> reduce, 4-8 -> breaks, <4 -> no change
            total_hours = X_train.sum(axis=1)
            y_train = np.where(total_hours > 8, 1, np.where(total_hours > 4, 2, 0))
            
            # Train
            history = nn_predictor.train_model(X_train, y_train, epochs=40)
            nn_predictor.save_model()
            
            print("✅ Training complete! Model saved.")
        
        # Make prediction with sample data
        sample_usage = {
            'social_media_hours': 3.5,
            'entertainment_hours': 2.0,
            'productivity_hours': 1.5,
            'communication_hours': 1.0,
            'gaming_hours': 2.5,
            'browsing_hours': 1.5,
            'education_hours': 0.5,
            'shopping_hours': 0.3,
            'news_hours': 0.5,
            'other_hours': 0.7
        }
        
        print("\n📊 Sample Usage Data:")
        for category, hours in sample_usage.items():
            print(f"  {category.replace('_', ' ').title()}: {hours}h")
        
        print(f"\n  Total: {sum(sample_usage.values()):.1f}h")
        
        prediction = nn_predictor.predict(sample_usage)
        
        print("\n🔮 Neural Network Prediction:")
        print(f"  Class: {prediction['class_name']}")
        print(f"  Confidence: {prediction['confidence']:.1%}")
        
        print("\n  Probabilities:")
        for class_name, prob in prediction['probabilities'].items():
            print(f"    {class_name}: {prob:.1%}")
        
        print(f"\n💡 {prediction['suggestion']['title']}")
        print(f"  {prediction['suggestion']['message']}")
        print("\n  Tips:")
        for tip in prediction['suggestion']['tips']:
            print(f"    • {tip}")
        
        # Student mode check
        if args.student_mode:
            print("\n🎓 Student Mode Restriction Check:")
            print("-" * 40)
            restrictions = nn_predictor.check_student_restrictions(sample_usage, is_student=True)
            
            if restrictions['restricted']:
                print(f"  {restrictions['message']}")
                print(f"  Severity: {restrictions['severity'].upper()}")
                
                print("\n  Violations:")
                for v in restrictions['violations']:
                    print(f"    ⚠️ {v['category']}: {v['actual']}h (limit: {v['limit']}h, excess: {v['excess']}h)")
                
                print("\n  Recommendations:")
                for rec in restrictions['recommendations']:
                    print(f"    • {rec}")
                
                if restrictions.get('blocked_apps'):
                    print("\n  Suggested Apps to Limit:")
                    for app in restrictions['blocked_apps']:
                        print(f"    🚫 {app}")
                
                print("\n  Suggested Actions:")
                for action in restrictions['suggested_actions']:
                    print(f"    ✓ {action}")
            else:
                print(f"  {restrictions['message']}")
                print(f"  {restrictions['encouragement']}")
                print(f"  Productivity Score: {restrictions['productivity_score']:.1f}%")
        
        return
    
    # Traditional ML Analysis Mode
    if args.csv:
        if analyzer.load_csv_data(csv_file=args.csv):
            analysis = analyzer.analyze_patterns()
        else:
            print("❌ Failed to load CSV file")
            return
    else:
        # For testing - generate sample data
        print("📊 No CSV file provided. Generating sample analysis...")
        sample_data = generate_sample_csv_data()
        if analyzer.load_csv_data(csv_content=sample_data):
            analysis = analyzer.analyze_patterns()
        else:
            print("❌ Failed to load sample data")
            return
    
    # Print analysis results
    print("\n📋 ANALYSIS RESULTS")
    print("=" * 40)
    
    if "error" in analysis:
        print(f"❌ {analysis['error']}")
        return
    
    # Summary
    summary = analysis["summary"]
    print(f"📊 Total Days Analyzed: {summary['totalDays']}")
    print(f"⏱️  Average Daily Screen Time: {summary['avgDailyScreenTime']:.1f} hours")
    print(f"📱 Average Apps Per Day: {summary['avgAppsPerDay']:.0f}")
    print(f"🏷️  Behavior Classification: {analysis['patterns']['behaviorClassification'].replace('_', ' ').title()}")
    
    # Trends
    if "trends" in analysis["patterns"]:
        trend_info = analysis["patterns"]["trends"]
        print(f"📈 Usage Trend: {trend_info['trend'].title()}")
    
    # Weekend vs Weekday
    if "weekdayVsWeekend" in analysis["patterns"]:
        wvw = analysis["patterns"]["weekdayVsWeekend"]
        print(f"📅 Weekday Avg: {wvw['weekday']:.1f}h | Weekend Avg: {wvw['weekend']:.1f}h")
    
    # Predictions
    if "predictions" in analysis and "next_7_days" in analysis["predictions"]:
        print(f"\n🔮 PREDICTIONS (Next 7 Days)")
        print("-" * 30)
        for pred in analysis["predictions"]["next_7_days"]:
            emoji = "🏖️" if pred["isWeekend"] else "💼"
            print(f"{emoji} {pred['date']}: {pred['predictedScreenTimeHours']:.1f}h")
        
        weekly_pred = analysis["predictions"]["weekly_prediction"]
        print(f"📊 Predicted Weekly Total: {weekly_pred:.1f} hours")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS")
    print("-" * 30)
    for i, rec in enumerate(analysis["recommendations"], 1):
        print(f"{i}. {rec}")
    
    # Generate Reports
    if args.pdf:
        print("\n📄 Generating PDF Report...")
        output_pdf = args.output if args.output and args.output.endswith('.pdf') else None
        pdf_file = analyzer.generate_pdf_report(analysis, output_pdf)
        if not pdf_file.startswith('❌'):
            print(f"✅ PDF Report: {pdf_file}")
    
    if args.txt:
        print("\n📝 Generating Text Report...")
        output_txt = args.output if args.output and args.output.endswith('.txt') else None
        txt_file = analyzer.generate_txt_report(analysis, output_txt)
        if not txt_file.startswith('❌'):
            print(f"✅ Text Report: {txt_file}")
    
    # Export JSON results
    try:
        output_file = "habitguard_ml_analysis.json"
        with open(output_file, 'w') as f:
            json.dump(analysis, f, indent=2, default=str)
        print(f"\n💾 Analysis saved to: {output_file}")
    except Exception as e:
        print(f"⚠️ Could not save analysis: {e}")

def generate_sample_csv_data() -> str:
    """Generate sample CSV data for testing"""
    import random
    from datetime import date, timedelta
    
    # Generate 30 days of sample data
    headers = "date,hour,totalScreenTime,topAppPackage,topAppTime,appCount,dayOfWeek,isWeekend"
    rows = [headers]
    
    start_date = date.today() - timedelta(days=30)
    
    for i in range(30):
        current_date = start_date + timedelta(days=i)
        day_of_week = current_date.weekday() + 1
        if day_of_week == 7:
            day_of_week = 0  # Sunday = 0
        
        is_weekend = day_of_week in [0, 6]
        
        # Simulate realistic usage patterns
        base_time = random.randint(2, 8) * 60 * 60 * 1000  # 2-8 hours in milliseconds
        if is_weekend:
            base_time *= random.uniform(1.2, 1.8)  # Higher on weekends
        
        total_screen_time = int(base_time)
        app_count = random.randint(5, 20)
        top_app_time = int(total_screen_time * random.uniform(0.2, 0.4))
        
        apps = ["com.instagram.android", "com.whatsapp", "com.google.android.youtube", 
                "com.android.chrome", "com.spotify.music"]
        top_app = random.choice(apps)
        
        row = f"{current_date},{random.randint(9, 23)},{total_screen_time},{top_app},{top_app_time},{app_count},{day_of_week},{is_weekend}"
        rows.append(row)
    
    return "\\n".join(rows)

if __name__ == "__main__":
    main()