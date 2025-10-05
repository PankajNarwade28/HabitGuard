#!/usr/bin/env python3
"""
Quick test of the HabitGuard ML system
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from usage_predictor import HabitGuardMLAnalyzer

def test_ml_system():
    print("🧪 Testing HabitGuard ML System")
    print("=" * 40)
    
    # Sample CSV data (simulating React Native app data)
    sample_csv = """date,hour,totalScreenTime,topAppPackage,topAppTime,appCount,dayOfWeek,isWeekend
2025-10-01,10,14400000,com.instagram.android,7200000,12,2,false
2025-10-02,11,16200000,com.whatsapp,8100000,15,3,false
2025-10-03,12,10800000,com.google.android.youtube,5400000,8,4,false
2025-10-04,13,19800000,com.android.chrome,9900000,18,5,false
2025-10-05,14,25200000,com.instagram.android,12600000,22,6,true
2025-10-06,15,28800000,com.spotify.music,14400000,25,0,true
2025-10-07,16,12600000,com.whatsapp,6300000,10,1,false"""
    
    # Initialize analyzer
    analyzer = HabitGuardMLAnalyzer()
    
    # Load sample data
    if analyzer.load_csv_data(csv_content=sample_csv):
        print("✅ Sample data loaded successfully")
        
        # Run analysis
        results = analyzer.analyze_patterns()
        
        if "error" in results:
            print(f"❌ Analysis failed: {results['error']}")
            return
        
        # Display results
        print("\n📊 ANALYSIS RESULTS")
        print("-" * 30)
        
        summary = results["summary"]
        print(f"📱 Total Days: {summary['totalDays']}")
        print(f"⏱️  Avg Daily Screen Time: {summary['avgDailyScreenTime']:.1f} hours")
        print(f"📲 Avg Apps Per Day: {summary['avgAppsPerDay']:.0f}")
        
        behavior = results["patterns"]["behaviorClassification"]
        print(f"🏷️  Behavior: {behavior.replace('_', ' ').title()}")
        
        if "weekdayVsWeekend" in results["patterns"]:
            wvw = results["patterns"]["weekdayVsWeekend"]
            print(f"📅 Weekday: {wvw['weekday']:.1f}h | Weekend: {wvw['weekend']:.1f}h")
        
        print("\n💡 RECOMMENDATIONS")
        print("-" * 30)
        for i, rec in enumerate(results["recommendations"][:3], 1):
            print(f"{i}. {rec}")
        
        print("\n✅ ML system test completed successfully!")
        
    else:
        print("❌ Failed to load sample data")

if __name__ == "__main__":
    test_ml_system()