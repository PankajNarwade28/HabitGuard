# ML Analysis Setup Guide

## Quick Start

The ML analysis system works in **two modes**:

### 1. Basic Mode (No Installation Required) ✅
- Uses simple statistical analysis
- Provides behavioral insights
- Generates recommendations
- Works immediately without any setup

### 2. Advanced Mode (Optional ML Libraries)
- Neural network predictions
- PDF report generation
- Advanced pattern detection

## Installing ML Libraries (Optional)

If you want to enable advanced features, install the Python dependencies:

```bash
cd ml_analysis
pip install -r requirements.txt
```

Or install individually:

```bash
# Core libraries (recommended)
pip install pandas numpy scikit-learn

# Neural networks (optional)
pip install tensorflow

# PDF reports (optional)
pip install reportlab
```

## Python Version

- **Required**: Python 3.8 or higher
- **Recommended**: Python 3.10+

Check your version:
```bash
python --version
```

## Troubleshooting

### Issue: TensorFlow warnings
**Solution**: These are informational only. The system uses fallback analysis if TensorFlow isn't available.

### Issue: reportlab import errors
**Solution**: PDF generation is optional. Text reports are always available as an alternative.

### Issue: Missing libraries
**Solution**: Run basic mode first. Install dependencies only if you need advanced features.

## Testing the Setup

Test if ML analysis works:

```bash
cd ml_analysis
python usage_predictor.py --csv ../test-data.csv
```

Expected output:
- ✅ Basic analysis always works
- ⚠️ Warnings about missing libraries are normal
- 🤖 Neural network features activate if TensorFlow is installed

## Integration with React Native App

The mobile app automatically:
1. Tries ML analysis first
2. Falls back to statistical analysis if ML service unavailable
3. Caches results for 1 hour
4. Provides real-time insights regardless of Python setup

**No Python installation required for the mobile app to work!**

## FAQ

**Q: Do I need to install Python libraries for the app to work?**
A: No! The app has built-in fallback analysis that works without any ML libraries.

**Q: What's the benefit of installing ML libraries?**
A: More accurate predictions, neural network insights, and PDF report generation.

**Q: Can I use this without a backend server?**
A: Yes! All analysis runs locally on device using fallback algorithms.

**Q: How do I enable the ML backend?**
A: Install Python libraries, then run the Flask server (coming soon).

## Next Steps

1. ✅ App works immediately with fallback analysis
2. 📦 Install Python libraries for advanced features (optional)
3. 🚀 Run ML backend server for real-time analysis (optional)
4. 📊 Enjoy personalized insights and notifications!
