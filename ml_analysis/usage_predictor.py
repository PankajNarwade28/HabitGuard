#!/usr/bin/env python3
"""
HabitGuard ML Usage Predictor
=============================

This Python script analyzes mobile usage patterns and provides predictions
and recommendations for digital wellness.

Features:
- Analyzes CSV usage data from the React Native app
- Predicts daily usage patterns
- Provides personalized recommendations
- Generates insights for better digital wellness

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

# Try to import ML libraries (install with: pip install scikit-learn pandas numpy matplotlib)
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

def main():
    """Main function for command line usage"""
    print("🤖 HabitGuard ML Usage Predictor")
    print("=" * 40)
    
    analyzer = HabitGuardMLAnalyzer()
    
    # Check for command line arguments
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
        if analyzer.load_csv_data(csv_file=csv_file):
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
    
    # Export results
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