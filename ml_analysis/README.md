# HabitGuard ML Integration


// todo student section and student portal

This directory contains the Machine Learning components for analyzing mobile usage patterns and providing personalized recommendations.

## Features

### 🤖 ML Analysis Engine
- **Pattern Recognition**: Identifies usage trends and behavioral patterns
- **Predictive Modeling**: Forecasts future usage based on historical data
- **Behavior Classification**: Categorizes users as light, moderate, heavy, or excessive users
- **Personalized Recommendations**: Provides tailored digital wellness advice

### 📊 Data Processing
- **CSV Data Storage**: Daily usage data stored in CSV format at 11:59 PM
- **AsyncStorage Integration**: ML data points stored locally for analysis
- **Data Validation**: Ensures data quality and handles missing values
- **Feature Engineering**: Creates relevant features for ML models

## Setup

### 1. Install Python Dependencies
```bash
cd ml_analysis
pip install -r requirements.txt
```

### 2. Run Analysis
```bash
# Analyze existing CSV file
python usage_predictor.py usage_data.csv

# Run with sample data for testing
python usage_predictor.py
```

## Integration with React Native App

### Automatic Data Collection
The React Native app automatically:
- Collects usage data throughout the day
- Stores daily summaries at 11:59 PM
- Maintains CSV format for ML analysis
- Keeps 30 days of historical data

### Data Export from App
```typescript
// Export CSV data for ML analysis
const csvData = await usageStatsService.exportCSVForML();

// Get ML data points
const mlData = await usageStatsService.getMLDataForAnalysis(30);
```

## Analysis Output

### Summary Statistics
- Total days analyzed
- Average daily screen time
- App usage patterns
- Behavior classification

### Predictions
- Next 7 days screen time forecast
- Weekly usage predictions
- Model performance metrics

### Recommendations
- Personalized digital wellness tips
- Usage reduction strategies
- Behavioral insights

## Files

- `usage_predictor.py` - Main ML analysis script
- `requirements.txt` - Python dependencies
- `README.md` - This documentation

## Example Output

```json
{
  "summary": {
    "totalDays": 30,
    "avgDailyScreenTime": 4.2,
    "behaviorClassification": "moderate_user"
  },
  "predictions": {
    "next_7_days": [
      {
        "date": "2025-10-03",
        "predictedScreenTimeHours": 3.8,
        "isWeekend": false
      }
    ],
    "weekly_prediction": 26.4
  },
  "recommendations": [
    "⚠️ Your screen time is above average. Consider reducing by 30 minutes daily.",
    "📵 Try implementing 'phone-free' periods during meals and family time."
  ]
}
```

## Behavior Classifications

| Classification | Daily Screen Time | Recommendations Focus |
|---------------|------------------|----------------------|
| **Light User** | < 2 hours | Maintain good habits |
| **Moderate User** | 2-4 hours | Quality over quantity |
| **Heavy User** | 4-6 hours | Reduction strategies |
| **Excessive User** | > 6 hours | Strict boundaries needed |

## ML Models Used

1. **Random Forest Regressor** - For usage time predictions
2. **Linear Regression** - For trend analysis
3. **Classification Logic** - For behavior categorization

## Future Enhancements

- Real-time predictions
- Anomaly detection
- Social comparison features
- Intervention timing optimization
- Advanced recommendation engine

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   pip install pandas numpy scikit-learn
   ```

2. **No CSV Data**
   - Ensure app has been collecting data for at least 7 days
   - Check AsyncStorage for stored data

3. **Poor Model Performance**
   - Collect more data (minimum 14 days recommended)
   - Ensure data quality and consistency

### Data Format Requirements

CSV must contain these columns:
- `date` - Date in YYYY-MM-DD format
- `totalScreenTime` - Total screen time in milliseconds
- `appCount` - Number of apps used
- `dayOfWeek` - Day of week (0=Sunday, 1=Monday, etc.)
- `isWeekend` - Boolean indicating weekend

## Support

For issues or questions:
1. Check the console logs in the React Native app
2. Verify data collection is working
3. Ensure Python dependencies are installed
4. Test with sample data first
