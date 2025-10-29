# 🤖 HabitGuard ML Usage Predictor# HabitGuard ML Integration



Advanced machine learning analysis system for HabitGuard that uses **Neural Networks** (TensorFlow) to predict user behavior and provide intelligent recommendations.This directory contains the Machine Learning components for analyzing mobile usage patterns and providing personalized recommendations.



## 🌟 Features## Features



### 1. **Neural Network Predictions** 🧠### 🤖 ML Analysis Engine

- Deep learning model with 64→32→16→3 architecture- **Pattern Recognition**: Identifies usage trends and behavioral patterns

- Predicts 3 classes:- **Predictive Modeling**: Forecasts future usage based on historical data

  - ✅ **No Change** - Healthy usage patterns- **Behavior Classification**: Categorizes users as light, moderate, heavy, or excessive users

  - ⚠️ **Reduce Usage** - Screen time too high- **Personalized Recommendations**: Provides tailored digital wellness advice

  - 🌟 **Take More Breaks** - Need more breaks

- 10-feature input: social media, entertainment, productivity, communication, gaming, browsing, education, shopping, news, other### 📊 Data Processing

- **CSV Data Storage**: Daily usage data stored in CSV format at 11:59 PM

### 2. **Student Mode** 🎓- **AsyncStorage Integration**: ML data points stored locally for analysis

- Specialized restrictions for students- **Data Validation**: Ensures data quality and handles missing values

- Daily limits:- **Feature Engineering**: Creates relevant features for ML models

  - Social Media: ≤ 2 hours

  - Entertainment: ≤ 3 hours## Setup

  - Gaming: ≤ 1.5 hours

  - Browsing: ≤ 2 hours### 1. Install Python Dependencies

- Violation detection and severity levels```bash

- Automatic app blocking suggestionscd ml_analysis

- Productivity score calculationpip install -r requirements.txt

```

### 3. **Report Generation** 📄

- **PDF Reports**: Professional formatted reports with tables and styling### 2. Run Analysis

- **Text Reports**: Plain text for easy sharing```bash

- Includes:# Analyze existing CSV file

  - Usage summary and statisticspython usage_predictor.py usage_data.csv

  - Behavior classification

  - 7-day predictions# Run with sample data for testing

  - Personalized recommendationspython usage_predictor.py

  - Visual styling and charts```



### 4. **Traditional ML Analysis** 📊## Integration with React Native App

- Time series analysis

- Pattern recognition### Automatic Data Collection

- Behavior classificationThe React Native app automatically:

- Trend analysis- Collects usage data throughout the day

- Weekend vs weekday comparison- Stores daily summaries at 11:59 PM

- Maintains CSV format for ML analysis

## 🚀 Installation- Keeps 30 days of historical data



### 1. Install Python Dependencies### Data Export from App

```typescript

```bash// Export CSV data for ML analysis

cd ml_analysisconst csvData = await usageStatsService.exportCSVForML();

pip install -r requirements.txt

```// Get ML data points

const mlData = await usageStatsService.getMLDataForAnalysis(30);

### 2. For GPU Support (Optional)```



If you have an NVIDIA GPU:## Analysis Output

```bash

pip install tensorflow-gpu>=2.15.0### Summary Statistics

```- Total days analyzed

- Average daily screen time

For CPU-only (smaller download):- App usage patterns

```bash- Behavior classification

pip install tensorflow-cpu>=2.15.0

```### Predictions

- Next 7 days screen time forecast

## 📖 Usage Examples- Weekly usage predictions

- Model performance metrics

### 1. Neural Network Prediction

### Recommendations

```bash- Personalized digital wellness tips

# Basic prediction with sample data- Usage reduction strategies

python usage_predictor.py --predict- Behavioral insights



# Train the neural network model## Files

python usage_predictor.py --train-nn

- `usage_predictor.py` - Main ML analysis script

# Prediction with student mode check- `requirements.txt` - Python dependencies

python usage_predictor.py --predict --student-mode- `README.md` - This documentation

```

## Example Output

### 2. Traditional ML Analysis with Reports

```json

```bash{

# Analyze CSV data and generate PDF report  "summary": {

python usage_predictor.py --csv usage_data.csv --pdf    "totalDays": 30,

    "avgDailyScreenTime": 4.2,

# Generate both PDF and TXT reports    "behaviorClassification": "moderate_user"

python usage_predictor.py --csv usage_data.csv --pdf --txt  },

  "predictions": {

# Specify custom output filename    "next_7_days": [

python usage_predictor.py --csv usage_data.csv --pdf --output my_report.pdf      {

        "date": "2025-10-03",

# Use sample data (no CSV file)        "predictedScreenTimeHours": 3.8,

python usage_predictor.py --pdf --txt        "isWeekend": false

```      }

    ],

### 3. Python API Usage    "weekly_prediction": 26.4

  },

```python  "recommendations": [

from usage_predictor import NeuralUsagePredictor, HabitGuardMLAnalyzer    "⚠️ Your screen time is above average. Consider reducing by 30 minutes daily.",

    "📵 Try implementing 'phone-free' periods during meals and family time."

# === Neural Network Predictor ===  ]

predictor = NeuralUsagePredictor()}

```

# Make a prediction

usage_data = {## Behavior Classifications

    'social_media_hours': 3.5,

    'entertainment_hours': 2.0,| Classification | Daily Screen Time | Recommendations Focus |

    'productivity_hours': 1.5,|---------------|------------------|----------------------|

    'communication_hours': 1.0,| **Light User** | < 2 hours | Maintain good habits |

    'gaming_hours': 2.5,| **Moderate User** | 2-4 hours | Quality over quantity |

    'browsing_hours': 1.5,| **Heavy User** | 4-6 hours | Reduction strategies |

    'education_hours': 0.5,| **Excessive User** | > 6 hours | Strict boundaries needed |

    'shopping_hours': 0.3,

    'news_hours': 0.5,## ML Models Used

    'other_hours': 0.7

}1. **Random Forest Regressor** - For usage time predictions

2. **Linear Regression** - For trend analysis

prediction = predictor.predict(usage_data)3. **Classification Logic** - For behavior categorization

print(f"Prediction: {prediction['class_name']}")

print(f"Confidence: {prediction['confidence']:.1%}")## Future Enhancements



# Check student restrictions- Real-time predictions

restrictions = predictor.check_student_restrictions(usage_data, is_student=True)- Anomaly detection

if restrictions['restricted']:- Social comparison features

    print(f"Violations: {len(restrictions['violations'])}")- Intervention timing optimization

- Advanced recommendation engine

# === Traditional ML Analyzer ===

analyzer = HabitGuardMLAnalyzer()## Troubleshooting

analyzer.load_csv_data(csv_file='usage_data.csv')

analysis = analyzer.analyze_patterns()### Common Issues



# Generate reports1. **Missing Dependencies**

pdf_file = analyzer.generate_pdf_report(analysis)   ```bash

txt_file = analyzer.generate_txt_report(analysis)   pip install pandas numpy scikit-learn

```   ```



## 📁 CSV Data Format2. **No CSV Data**

   - Ensure app has been collecting data for at least 7 days

```csv   - Check AsyncStorage for stored data

date,hour,totalScreenTime,topAppPackage,topAppTime,appCount,dayOfWeek,isWeekend

2024-01-15,14,25200000,com.instagram.android,10800000,12,1,false3. **Poor Model Performance**

2024-01-16,16,32400000,com.whatsapp,14400000,15,2,false   - Collect more data (minimum 14 days recommended)

```   - Ensure data quality and consistency



## 🔧 Command Line Options### Data Format Requirements



```CSV must contain these columns:

--csv FILE              Path to CSV data file- `date` - Date in YYYY-MM-DD format

--pdf                   Generate PDF report- `totalScreenTime` - Total screen time in milliseconds

--txt                   Generate TXT report- `appCount` - Number of apps used

--output FILE           Custom output filename- `dayOfWeek` - Day of week (0=Sunday, 1=Monday, etc.)

--student-mode          Check student usage restrictions- `isWeekend` - Boolean indicating weekend

--predict               Use neural network predictor

--train-nn              Train neural network model## Support

```

For issues or questions:

## 📊 Model Architecture1. Check the console logs in the React Native app

2. Verify data collection is working

```3. Ensure Python dependencies are installed

Input Layer (10 features)4. Test with sample data first
    ↓
Dense (64 units, ReLU) + Dropout (0.3)
    ↓
Dense (32 units, ReLU) + Dropout (0.2)
    ↓
Dense (16 units, ReLU)
    ↓
Output (3 classes, Softmax)
```

## 🔗 React Native Integration

Create backend API endpoint:

```javascript
// backend/routes/ml.js
app.post('/api/ml/predict', async (req, res) => {
  const { usageData } = req.body;
  const result = await executePython('ml_analysis/usage_predictor.py', ['--predict']);
  res.json(result);
});
```

## 🐛 Troubleshooting

### TensorFlow Installation
```bash
# Windows/Linux
pip install tensorflow-cpu>=2.15.0

# macOS (M1/M2)
pip install tensorflow-macos>=2.15.0
```

### Model Not Found
```bash
python usage_predictor.py --train-nn
```

---

**Made with ❤️ for digital wellness**
