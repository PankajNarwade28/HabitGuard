# 🚀 ML Features Quick Start Guide

## Installation (5 minutes)

### Step 1: Install Python Dependencies
```bash
cd c:\Projects\HabitGuard\ml_analysis
pip install -r requirements.txt
```

**This installs:**
- TensorFlow (Neural Network)
- ReportLab (PDF Generation)
- pandas, numpy, scikit-learn (Data processing)

### Step 2: Train the Neural Network
```bash
python usage_predictor.py --train-nn
```

**Output:**
```
🤖 HabitGuard ML Usage Predictor
========================================
🧠 Neural Network Mode
📚 Training neural network with sample data...
✅ Neural network model built successfully
🤖 Training neural network on 1000 samples...
✅ Training complete! Final accuracy: 95.32%
💾 Model saved to models/usage_nn_model.h5
```

## Usage Examples

### Example 1: Get Behavior Prediction 🧠

```bash
python usage_predictor.py --predict
```

**What you get:**
- Prediction class (No Change / Reduce Usage / Take Breaks)
- Confidence percentage
- Personalized tips and recommendations
- Category-wise usage breakdown

### Example 2: Check Student Restrictions 🎓

```bash
python usage_predictor.py --predict --student-mode
```

**What you get:**
- Violation detection (which limits exceeded)
- Severity level (low/medium/high)
- Apps to block suggestions
- Study schedule recommendations
- Productivity score

### Example 3: Generate Reports 📄

```bash
# PDF Report
python usage_predictor.py --pdf

# Text Report
python usage_predictor.py --txt

# Both formats
python usage_predictor.py --pdf --txt

# Custom filename
python usage_predictor.py --pdf --output weekly_report.pdf
```

**What you get:**
- Professional PDF with tables and styling
- Plain text version for sharing
- Complete usage analysis
- 7-day predictions
- Personalized recommendations

## Python API Usage

### Quick Prediction
```python
from ml_analysis.usage_predictor import NeuralUsagePredictor

# Initialize
predictor = NeuralUsagePredictor()

# Your usage data (hours per category)
usage = {
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

# Get prediction
result = predictor.predict(usage)

print(f"Prediction: {result['class_name']}")
print(f"Confidence: {result['confidence']:.1%}")
print(f"Suggestion: {result['suggestion']['message']}")
```

### Student Mode Check
```python
# Check restrictions
restrictions = predictor.check_student_restrictions(usage, is_student=True)

if restrictions['restricted']:
    print(f"⚠️ {restrictions['message']}")
    print(f"Violations: {len(restrictions['violations'])}")
    
    for v in restrictions['violations']:
        print(f"  {v['category']}: {v['actual']}h (limit: {v['limit']}h)")
    
    # Get apps to block
    blocked_apps = restrictions['blocked_apps']
    print(f"Apps to limit: {blocked_apps}")
else:
    print(f"✅ {restrictions['message']}")
    print(f"Productivity Score: {restrictions['productivity_score']}%")
```

### Generate Reports
```python
from ml_analysis.usage_predictor import HabitGuardMLAnalyzer

# Initialize analyzer
analyzer = HabitGuardMLAnalyzer()

# Load your data
analyzer.load_csv_data(csv_file='usage_data.csv')

# Analyze patterns
analysis = analyzer.analyze_patterns()

# Generate reports
pdf_path = analyzer.generate_pdf_report(analysis, 'my_report.pdf')
txt_path = analyzer.generate_txt_report(analysis, 'my_report.txt')

print(f"Reports generated:")
print(f"  PDF: {pdf_path}")
print(f"  TXT: {txt_path}")
```

## Integration with React Native

### Option 1: Direct Python Execution (Development)

```typescript
// services/MLService.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class MLService {
  async getPrediction(usageData: any) {
    const data = JSON.stringify(usageData);
    const { stdout } = await execAsync(
      `python ml_analysis/usage_predictor.py --predict --data '${data}'`
    );
    return JSON.parse(stdout);
  }
  
  async generateReport(format: 'pdf' | 'txt') {
    const flag = format === 'pdf' ? '--pdf' : '--txt';
    const { stdout } = await execAsync(
      `python ml_analysis/usage_predictor.py ${flag}`
    );
    return stdout.trim(); // Returns file path
  }
}
```

### Option 2: Backend API (Production)

```javascript
// backend/routes/ml.js
const express = require('express');
const { PythonShell } = require('python-shell');
const router = express.Router();

// Prediction endpoint
router.post('/predict', async (req, res) => {
  try {
    const { usageData } = req.body;
    
    const options = {
      mode: 'json',
      pythonPath: 'python',
      scriptPath: './ml_analysis',
      args: ['--predict', '--data', JSON.stringify(usageData)]
    };
    
    const results = await PythonShell.run('usage_predictor.py', options);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student check endpoint
router.post('/student-check', async (req, res) => {
  try {
    const { usageData } = req.body;
    
    const options = {
      mode: 'json',
      args: ['--predict', '--student-mode', '--data', JSON.stringify(usageData)]
    };
    
    const results = await PythonShell.run('usage_predictor.py', options);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report generation endpoint
router.post('/generate-report', async (req, res) => {
  try {
    const { format, csvFile } = req.body;
    
    const options = {
      args: ['--csv', csvFile, `--${format}`]
    };
    
    const results = await PythonShell.run('usage_predictor.py', options);
    const filePath = results[results.length - 1];
    
    // Send file
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

```javascript
// backend/index.js
const mlRoutes = require('./routes/ml');
app.use('/api/ml', mlRoutes);
```

### React Native Service

```typescript
// services/MLService.ts
import { API_URL } from '@/config';

export class MLService {
  async getPrediction(usageData: UsageData) {
    const response = await fetch(`${API_URL}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usageData })
    });
    return response.json();
  }
  
  async checkStudentRestrictions(usageData: UsageData) {
    const response = await fetch(`${API_URL}/ml/student-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usageData })
    });
    return response.json();
  }
  
  async generateReport(format: 'pdf' | 'txt', csvFile: string) {
    const response = await fetch(`${API_URL}/ml/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, csvFile })
    });
    
    // Download file
    const blob = await response.blob();
    return blob;
  }
}

export const mlService = new MLService();
```

### UI Components

```tsx
// components/PredictionCard.tsx
import { mlService } from '@/services/MLService';

export function PredictionCard() {
  const [prediction, setPrediction] = useState(null);
  
  useEffect(() => {
    async function fetchPrediction() {
      const usageData = await getUsageData(); // Your function
      const result = await mlService.getPrediction(usageData);
      setPrediction(result);
    }
    fetchPrediction();
  }, []);
  
  if (!prediction) return <Loading />;
  
  return (
    <View>
      <Text className="text-2xl">{prediction.class_name}</Text>
      <Text>Confidence: {(prediction.confidence * 100).toFixed(1)}%</Text>
      
      <Text className="text-lg mt-4">{prediction.suggestion.title}</Text>
      <Text>{prediction.suggestion.message}</Text>
      
      <View className="mt-4">
        {prediction.suggestion.tips.map((tip, i) => (
          <Text key={i}>• {tip}</Text>
        ))}
      </View>
    </View>
  );
}
```

```tsx
// components/StudentModeAlert.tsx
export function StudentModeAlert({ usageData }) {
  const [restrictions, setRestrictions] = useState(null);
  
  useEffect(() => {
    async function checkRestrictions() {
      const result = await mlService.checkStudentRestrictions(usageData);
      if (result.restricted) {
        setRestrictions(result);
      }
    }
    checkRestrictions();
  }, [usageData]);
  
  if (!restrictions) return null;
  
  return (
    <View className="bg-red-100 p-4 rounded">
      <Text className="text-xl font-bold">{restrictions.message}</Text>
      <Text>Severity: {restrictions.severity.toUpperCase()}</Text>
      
      <Text className="mt-2 font-semibold">Violations:</Text>
      {restrictions.violations.map((v, i) => (
        <Text key={i}>
          ⚠️ {v.category}: {v.actual}h (limit: {v.limit}h)
        </Text>
      ))}
      
      <Text className="mt-2 font-semibold">Recommendations:</Text>
      {restrictions.recommendations.map((rec, i) => (
        <Text key={i}>• {rec}</Text>
      ))}
    </View>
  );
}
```

## Testing

### 1. Test Neural Network
```bash
python usage_predictor.py --predict
```
✅ Should show prediction with confidence and tips

### 2. Test Student Mode
```bash
python usage_predictor.py --predict --student-mode
```
✅ Should show violations and restrictions

### 3. Test Report Generation
```bash
python usage_predictor.py --pdf --txt
```
✅ Should create two report files

### 4. Test with Real Data
```bash
# If you have CSV data
python usage_predictor.py --csv your_data.csv --pdf
```
✅ Should analyze real data and create PDF

## Troubleshooting

### Issue: TensorFlow not installing
**Solution:**
```bash
# Try CPU-only version
pip install tensorflow-cpu>=2.15.0

# Or for macOS M1/M2
pip install tensorflow-macos>=2.15.0
```

### Issue: reportlab errors
**Solution:**
```bash
pip install --upgrade pip
pip install reportlab --no-cache-dir
```

### Issue: Model not found
**Solution:**
```bash
# Train the model first
python usage_predictor.py --train-nn
```

### Issue: Import errors in Python
**Solution:**
```bash
# Make sure you're in the right directory
cd c:\Projects\HabitGuard\ml_analysis
python usage_predictor.py --help
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Train neural network
3. ✅ Test predictions
4. ✅ Test student mode
5. ✅ Generate sample reports
6. 🔲 Create backend API endpoints
7. 🔲 Build React Native UI components
8. 🔲 Integrate with app navigation
9. 🔲 Add settings for student mode toggle
10. 🔲 Implement report sharing functionality

## Resources

- **Full Documentation**: `ml_analysis/README.md`
- **Implementation Details**: `ML_INTEGRATION_COMPLETE.md`
- **Python Script**: `ml_analysis/usage_predictor.py`
- **Dependencies**: `ml_analysis/requirements.txt`

---

**Need help?** Check the main README or the implementation docs!

**Ready to integrate?** Follow the React Native integration examples above!
