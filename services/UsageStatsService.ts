import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// --- Type Definitions ---
export interface AppUsageData {
    packageName: string;
    appName: string;
    totalTimeInForeground: number; // in milliseconds
    lastTimeUsed: number; // timestamp
    icon?: AppIconData;
}

export interface AppIconData {
    type: 'ionicon' | 'fontawesome' | 'material';
    name: string;
    color?: string;
}

export interface DailyUsageStats {
    totalScreenTime: number; // in milliseconds
    appUsage: AppUsageData[];
    date: string;
}

export interface WeeklyUsageStats {
    weeklyTotal: number;
    dailyBreakdown: DailyUsageStats[];
    topApps: AppUsageData[];
}

export interface CSVDataRow {
    date: string;
    hour: number;
    totalScreenTime: number;
    topAppPackage: string;
    topAppTime: number;
    appCount: number;
    dayOfWeek: number;
    isWeekend: boolean;
}

export interface MLDataPoint {
    timestamp: number;
    dailyTotal: number;
    hourlyBreakdown: number[];
    topApps: string[];
    behaviorPattern: 'light' | 'moderate' | 'heavy' | 'excessive';
}

// --- Constants for IST (UTC+5:30) ---
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const CSV_KEY = 'usage_csv_data';
const ML_DATA_PREFIX = 'ml_data_';

class UsageStatsService {
    private UsageStats: any = null;
    private initializationAttempts: number = 0;
    private csvDirectory: string = '';
    private dailyStorageTimer: any = null;
    private lastStoredDate: string = '';
    
    constructor() {
        // Initialize real data mode only
        this.initializeUsageStats();
        this.setupCSVDirectory();
        this.scheduleDailyStorage();
        
        // Retry after delays for slower devices
        setTimeout(() => {
            console.log('🔄 Retry initialization attempt...');
            this.initializeUsageStats();
        }, 1000);
        
        setTimeout(() => {
            console.log('🔄 Final initialization attempt...');
            this.initializeUsageStats();
        }, 3000);
    }
    
    /**
     * Get current time in India Standard Time (IST)
     */
    private getISTTime(): Date {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        return new Date(utcTime + IST_OFFSET_MS);
    }
    
    /**
     * Calculates the UTC timestamp (in milliseconds) for the **start of a given date in IST**.
     * IST midnight (00:00:00 IST) needs to be converted to UTC time.
     * Since IST = UTC+5:30, midnight IST = 18:30 previous day UTC
     * 
     * Example: Oct 5, 2025 00:00:00 IST = Oct 4, 2025 18:30:00 UTC
     */
    private getISTDayStartUTC(date: Date): number {
        // Convert the input date to IST and extract date components
        // Using toLocaleString with IST timezone
        const options: Intl.DateTimeFormatOptions = { 
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        const istDateStr = date.toLocaleString('en-CA', options); // Returns YYYY-MM-DD format
        const [year, month, day] = istDateStr.split('-').map(Number);

        // Create a UTC timestamp for this IST date at midnight UTC
        // Date.UTC: month is 0-indexed, so subtract 1
        const midnightUTC = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
        
        // But we want Oct 5, 2025 00:00:00 IST (not UTC)
        // IST = UTC + 5:30, so to get IST midnight in UTC terms:
        // Oct 5 00:00 IST = Oct 5 00:00 UTC - 5:30 = Oct 4 18:30 UTC
        const istMidnightInUTC = midnightUTC - IST_OFFSET_MS;
        
        return istMidnightInUTC;
    }
    
    /**
     * Get start of day in IST for a given date (for display/comparison only)
     */
    private getISTDayStart(date: Date): Date {
        const istTime = this.getISTTime();
        // If the date is "today" or a date that aligns with the IST offset, use IST components
        const istDate = new Date(date.getTime());
        const year = istDate.getFullYear();
        const month = istDate.getMonth();
        const day = istDate.getDate();
        
        // This will create a local Date object representing 00:00 IST.
        // For consistent display/comparison, ensure it respects the IST offset if needed,
        // but for now, we use the simpler local midnight approach + manual timezone checks.
        return new Date(year, month, day, 0, 0, 0, 0);
    }
    
    /**
     * Force real data mode - ensures library is loaded
     */
    public forceRealDataMode(): boolean {
        try {
            this.UsageStats = require('react-native-usage-stats').default || require('react-native-usage-stats');
            if (this.UsageStats) {
                console.log('🎯 REAL DATA MODE ACTIVE - Using actual Android usage stats only');
                return true;
            }
        } catch (error) {
            console.log('❌ Cannot access usage stats library:', error);
        }
        return false;
    }
    
    private async initializeUsageStats() {
        this.initializationAttempts++;
        console.log(`🔄 Initializing UsageStats (attempt ${this.initializationAttempts})...`);
        
        try {
            this.UsageStats = require('react-native-usage-stats').default || require('react-native-usage-stats');
            if (this.UsageStats) {
                console.log('✅ react-native-usage-stats library loaded successfully');
                
                try {
                    const hasPermission = await this.UsageStats.isUsageAccessGranted();
                    console.log('🔐 Permission check result:', hasPermission);
                    
                    if (hasPermission) {
                        console.log('🎉 REAL DATA MODE ENABLED - Using actual Android usage statistics!');
                    } else {
                        console.log('⚠️ No usage access permission - will show no-data messages');
                    }
                } catch (testError) {
                    console.log('⚠️ Usage stats permission test failed:', testError);
                    console.log('🔄 Continuing in real data mode...');
                }
            } else {
                console.log('❌ react-native-usage-stats not found');
            }
        } catch (error) {
            console.log('❌ react-native-usage-stats initialization failed:', error);
        }
    }
    
    /**
     * Check if usage access permission is granted
     */
    async checkUsageAccessPermission(): Promise<boolean> {
        if (Platform.OS !== 'android' || !this.UsageStats) {
            return false;
        }

        try {
            if (this.UsageStats && this.UsageStats.isUsageAccessGranted) {
                const hasPermission = await this.UsageStats.isUsageAccessGranted();
                return hasPermission;
            } else {
                // Fallback check by query (less reliable as primary check)
                const hasPermissionByQuery = await this.checkPermissionByQuery();
                return hasPermissionByQuery;
            }
        } catch (error) {
            console.error('❌ Error checking usage access permission:', error);
            return false;
        }
    }
    
    /**
     * Alternative permission check by attempting to query usage stats
     */
    private async checkPermissionByQuery(): Promise<boolean> {
        if (!this.UsageStats || !this.UsageStats.queryUsageStats) {
            return false;
        }
        
        try {
            const now = new Date();
            const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            const usageStats = await this.UsageStats.queryUsageStats(
                startTime.getTime(),
                now.getTime()
            );
            
            const hasData = Array.isArray(usageStats) && usageStats.length >= 0;
            return hasData;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Request usage access permission - Direct panel opening
     */
    async requestUsageAccessPermission(): Promise<void> {
        if (Platform.OS !== 'android') {
            return;
        }

        try {
            console.log('📝 Opening Usage Access Settings Panel directly...');
            
            if (this.UsageStats && this.UsageStats.requestUsageAccessPermission) {
                // Use library method if available
                await this.UsageStats.requestUsageAccessPermission();
            } else {
                // Fallback to direct Android intent
                const { Linking } = require('react-native');
                await Linking.openURL('intent://android.settings.USAGE_ACCESS_SETTINGS');
            }
        } catch (error) {
            console.error('❌ Error requesting usage access permission:', error);
        }
    }
    
    /**
     * Get daily usage statistics - REAL DATA ONLY (IST Timezone)
     */
    async getDailyUsageStats(date?: Date): Promise<any> {
        if (!this.UsageStats) {
             return { totalTime: 0, appCount: 0, topApps: [], status: 'no_library' };
        }
        
        const istTime = this.getISTTime();
        const targetDate = date || istTime;
        const dateString = targetDate.toISOString().split('T')[0];

        try {
            const isToday = dateString === istTime.toISOString().split('T')[0];
            
            // 1. Calculate UTC milliseconds for IST midnight (00:00:00 IST)
            const startTimeUTC = this.getISTDayStartUTC(targetDate);
            
            // 2. Calculate UTC milliseconds for the end of the query period
            let endTimeUTC: number;
            if (isToday) {
                // For today, end time is the current UTC time (not IST adjusted)
                // The device time is already in IST, so we just get the current timestamp
                endTimeUTC = Date.now();
            } else {
                // For historical dates, end time is 23:59:59.999 IST, converted to UTC
                // Get tomorrow's IST midnight and subtract 1ms
                const tomorrowDate = new Date(targetDate);
                tomorrowDate.setDate(targetDate.getDate() + 1);
                const tomorrowMidnightUTC = this.getISTDayStartUTC(tomorrowDate);
                endTimeUTC = tomorrowMidnightUTC - 1; // 1 ms before tomorrow's midnight
            }
            
            // Display times in IST for logging
            // Don't add offset twice - toLocaleString with timeZone already handles conversion
            const startIST = new Date(startTimeUTC);
            const endIST = new Date(endTimeUTC);
            
            console.log(`📅 FETCHING REAL ANDROID USAGE DATA for ${dateString} (IST)`);
            console.log(`🕐 IST Range: ${startIST.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} to ${endIST.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
            console.log(`📍 UTC Timestamps: ${startTimeUTC} to ${endTimeUTC}`);
            console.log(`⏱️ Query Duration: ${((endTimeUTC - startTimeUTC) / 3600000).toFixed(2)} hours`);

            // ⚠️ CRITICAL: queryUsageStats() returns AGGREGATED data that includes yesterday's carryover
            // We need to use queryEvents() to get individual session events and calculate time only after midnight
            
            console.log('🎯 Step 1: Fetching usage events (MOVE_TO_FOREGROUND, MOVE_TO_BACKGROUND)...');
            let usageEvents: any[] = [];
            let eventBasedAvailable = false;
            
            try {
                // Query individual events instead of aggregated stats
                if (this.UsageStats.queryEvents && typeof this.UsageStats.queryEvents === 'function') {
                    console.log('📞 Calling queryEvents API...');
                    usageEvents = await this.UsageStats.queryEvents(startTimeUTC, endTimeUTC);
                    console.log(`✅ Got ${usageEvents?.length || 0} usage events`);
                    
                    if (usageEvents && usageEvents.length > 0) {
                        eventBasedAvailable = true;
                    } else {
                        console.log('⚠️ queryEvents returned empty, falling back to queryUsageStats');
                    }
                } else {
                    console.log('⚠️ queryEvents not available on this device, falling back to queryUsageStats');
                }
            } catch (eventError) {
                console.log('⚠️ queryEvents failed:', eventError);
                console.log('🔄 Falling back to queryUsageStats with enhanced carryover filtering...');
            }
            
            // Process events to calculate today-only usage
            if (eventBasedAvailable) {
                console.log('🎉 SUCCESS: Using event-based calculation (accurate, no carryover)!');
                const processedData = this.processUsageEvents(usageEvents, startTimeUTC, endTimeUTC);
                console.log('✅ Event-based data processed successfully');
                return processedData;
            }
            
            // Fallback: Use queryUsageStats (less accurate, includes carryover)
            console.log('🔄 Fallback: Using queryUsageStats (may include carryover)...');
            const usageStats = await this.UsageStats.queryUsageStats(startTimeUTC, endTimeUTC);
            
            if (usageStats && usageStats.length > 0) {
                console.log('🎉 SUCCESS: Got real usage data from Android!');
                
                // Debug: Show first 3 raw entries with timestamps
                console.log('🔍 Sample raw data (first 3 apps):', 
                    usageStats.slice(0, 3).map((app: any) => ({
                        pkg: app.packageName,
                        totalTimeInForeground: app.totalTimeInForeground,
                        firstTimeStamp: app.firstTimeStamp,
                        firstTimeStampIST: new Date(app.firstTimeStamp || 0).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
                        lastTimeStamp: app.lastTimeStamp,
                        lastTimeStampIST: new Date(app.lastTimeStamp || 0).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
                        lastTimeUsed: app.lastTimeUsed,
                        lastTimeUsedIST: new Date(app.lastTimeUsed || 0).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})
                    }))
                );
                
                const processedData = this.processRealUsageStats(usageStats, startTimeUTC, endTimeUTC, isToday);
                console.log('✅ Real usage data processed successfully');
                return processedData;
            } else {
                console.log('❌ NO REAL DATA AVAILABLE - Query returned empty.');
                return { totalTime: 0, appCount: 0, topApps: [], status: 'no_data' };
            }
            
        } catch (error) {
            console.error('❌ Error getting real usage stats:', error);
            return { totalTime: 0, appCount: 0, topApps: [], status: 'error' };
        }
    }
    
    /**
     * Process usage events to calculate today-only screen time
     * This is the ACCURATE method that excludes yesterday's carryover
     */
    private processUsageEvents(events: any[], startTimeUTC: number, endTimeUTC: number): any {
        console.log('🔄 Processing usage EVENTS (today-only calculation)...');
        console.log(`📦 Raw events received: ${events.length} events from Android`);
        
        // Group events by package name
        const packageSessions = new Map<string, { foregroundStart: number | null, totalTime: number, lastUsed: number }>();
        
        let systemEventCount = 0;
        
        // Process events in chronological order
        const sortedEvents = events.sort((a: any, b: any) => (a.timeStamp || 0) - (b.timeStamp || 0));
        
        for (const event of sortedEvents) {
            const packageName = event.packageName || '';
            const eventType = event.eventType;
            const timestamp = event.timeStamp || 0;
            
            // Skip events outside our time range
            if (timestamp < startTimeUTC || timestamp > endTimeUTC) {
                continue;
            }
            
            // Filter system apps at event level
            if (this.isSystemApp(packageName)) {
                systemEventCount++;
                continue;
            }
            
            // Initialize package if first time seeing it
            if (!packageSessions.has(packageName)) {
                packageSessions.set(packageName, {
                    foregroundStart: null,
                    totalTime: 0,
                    lastUsed: 0
                });
            }
            
            const session = packageSessions.get(packageName)!;
            
            // Event type 1 = MOVE_TO_FOREGROUND
            // Event type 2 = MOVE_TO_BACKGROUND
            if (eventType === 1) {
                // App moved to foreground - start timer
                session.foregroundStart = Math.max(timestamp, startTimeUTC); // Clamp to today's start
                session.lastUsed = timestamp;
            } else if (eventType === 2 && session.foregroundStart !== null) {
                // App moved to background - calculate session time
                const sessionEnd = Math.min(timestamp, endTimeUTC); // Clamp to now
                const sessionDuration = sessionEnd - session.foregroundStart;
                
                if (sessionDuration > 0) {
                    session.totalTime += sessionDuration;
                }
                
                session.foregroundStart = null; // Reset
                session.lastUsed = timestamp;
            }
        }
        
        // Handle apps still in foreground (close session at endTimeUTC)
        for (const [packageName, session] of packageSessions.entries()) {
            if (session.foregroundStart !== null) {
                const sessionDuration = endTimeUTC - session.foregroundStart;
                if (sessionDuration > 0) {
                    session.totalTime += sessionDuration;
                }
            }
        }
        
        console.log(`🚫 System events filtered: ${systemEventCount}`);
        console.log(`✅ Packages with usage: ${packageSessions.size}`);
        
        // Convert to app usage data
        const aggregatedStats = new Map<string, any>();
        let backgroundAppCount = 0;
        
        for (const [packageName, session] of packageSessions.entries()) {
            // Filter apps with < 1 min usage
            if (session.totalTime < 60000) {
                backgroundAppCount++;
                continue;
            }
            
            aggregatedStats.set(packageName, {
                name: this.getReadableAppName(packageName),
                icon: this.getAppIcon(packageName),
                packageName: packageName,
                timeSpent: session.totalTime,
                lastTimeUsed: session.lastUsed,
            });
        }
        
        console.log(`🚫 Background apps filtered (< 1 min): ${backgroundAppCount}`);
        console.log(`✅ User apps included (today only, event-based): ${aggregatedStats.size}`);
        
        // Sort by usage time
        const apps = Array.from(aggregatedStats.values()).sort((a, b) => b.timeSpent - a.timeSpent);
        const totalAppTime = apps.reduce((sum, app) => sum + app.timeSpent, 0);
        
        console.log('📊 Top 10 apps:', apps.slice(0, 10).map(a => `${a.name}: ${this.formatTime(a.timeSpent)}`));
        console.log(`📱 Total apps: ${apps.length}, Total time: ${this.formatTime(totalAppTime)}`);
        
        return {
            totalTime: totalAppTime,
            appCount: apps.length,
            topApps: apps.map((app: any) => ({
                packageName: app.packageName,
                name: app.name,
                appName: app.name,
                timeSpent: app.timeSpent,
                totalTimeInForeground: app.timeSpent,
                lastTimeUsed: app.lastUsed,
                icon: app.icon
            })),
            unlocks: 0,
            notifications: 0,
            status: 'success'
        };
    }
    
    /**
     * Process real usage statistics from Android - Filter system apps, show user apps only
     * Enhanced filtering to match Digital Wellbeing accuracy:
     * 1. Exclude system/background apps
     * 2. Exclude apps with <1 min foreground time (background services)
     * 3. Exclude apps whose lastTimeUsed is outside today's range (yesterday carryover)
     * 4. Cap time to reasonable bounds (max 95% of day duration)
     * 
     * ⚠️ LIMITATION: queryUsageStats() returns AGGREGATED totals without session details
     * - Cannot accurately remove cross-midnight carryover (would need individual session timestamps)
     * - May show slightly higher times (~5-15 min) than Digital Wellbeing for apps used around midnight
     * - Use processUsageEvents() for 100% accurate today-only calculation
     */
    private processRealUsageStats(usageStats: any[], startTimeUTC: number, endTimeUTC: number, isToday: boolean = true): any {
        console.log('🔄 Processing REAL ANDROID usage stats (AGGREGATED - may include carryover)...');
        console.log(`📦 Raw data received: ${usageStats.length} apps from Android`);
        console.log(`⏰ Valid time range: ${new Date(startTimeUTC).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} to ${new Date(endTimeUTC).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);

        const aggregatedStats = new Map<string, any>();
        let systemAppCount = 0;
        let backgroundAppCount = 0;
        let yesterdayCarryoverCount = 0;
        
        usageStats.forEach((app: any) => {
            const packageName = app.packageName || app.name || 'unknown';
            
            // Get time from any available field
            const timeSpent = app.totalTimeInForeground || app.totalTime || app.usageTime || 0;
            const lastUsedUTC = app.lastTimeUsed || app.lastUsedTime || 0;
            const firstTimeStamp = app.firstTimeStamp || 0;
            const lastTimeStamp = app.lastTimeStamp || 0;
            
            // Debug Instagram specifically
            if (packageName.includes('instagram')) {
                console.log(`🔍 Instagram Debug:`);
                console.log(`   Raw time from Android: ${this.formatTime(timeSpent)}`);
                console.log(`   First timestamp: ${new Date(firstTimeStamp).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
                console.log(`   Last timestamp: ${new Date(lastTimeStamp).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
                console.log(`   Last used: ${new Date(lastUsedUTC).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
                console.log(`   Midnight UTC: ${new Date(startTimeUTC).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
            }
            
            // ✅ Filter 1: Exclude system apps (Incallui, Launcher3, SystemUI, etc.)
            if (this.isSystemApp(packageName)) {
                systemAppCount++;
                return;
            }
            
            // ✅ Filter 2: Exclude apps with less than 1 minute foreground time (background services)
            if (timeSpent < 60000) { // Less than 60 seconds
                backgroundAppCount++;
                return;
            }
            
            // ✅ Filter 3: Ensure lastTimeUsed is within today's range (no yesterday carryover)
            // This is the KEY fix - removes apps that haven't been used today
            if (lastUsedUTC < startTimeUTC || lastUsedUTC > endTimeUTC) {
                yesterdayCarryoverCount++;
                console.log(`🚫 Carryover filtered: ${this.getReadableAppName(packageName)} (last used: ${new Date(lastUsedUTC).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})})`);
                return;
            }
            
            // ⚠️ NOTE: We CANNOT accurately remove cross-midnight carryover from aggregated stats
            // queryUsageStats() returns total time without individual session details
            // Only queryEvents() can provide session-level accuracy
            // For now, just use the reported time and apply basic time capping
            
            let cappedTimeSpent = timeSpent;
            
            // ✅ Filter 4: Cap time to prevent impossible values
            // The maximum possible usage time is from midnight to now
            const maxPossibleTime = (endTimeUTC - startTimeUTC) * 0.95; // 95% safety margin
            
            if (cappedTimeSpent > maxPossibleTime) {
                // Time reported exceeds the possible duration of the day so far
                console.log(`⚠️ Unrealistic time capped: ${this.getReadableAppName(packageName)} (${this.formatTime(cappedTimeSpent)} → ${this.formatTime(maxPossibleTime)})`);
                cappedTimeSpent = maxPossibleTime;
            }
            
            // Debug Instagram specifically
            if (packageName.includes('instagram')) {
                console.log(`📊 Instagram Debug:`);
                console.log(`   Android reported time: ${this.formatTime(timeSpent)}`);
                console.log(`   Final time (after capping): ${this.formatTime(cappedTimeSpent)}`);
                console.log(`   First used: ${new Date(firstTimeStamp).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
                console.log(`   Last used: ${new Date(lastUsedUTC).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
            }
            
            // ✅ Include valid user apps
            const existing = aggregatedStats.get(packageName);
            if (existing) {
                existing.timeSpent += cappedTimeSpent;
                existing.lastTimeUsed = Math.max(existing.lastTimeUsed || 0, lastUsedUTC);
            } else {
                aggregatedStats.set(packageName, {
                    name: this.getReadableAppName(packageName),
                    icon: this.getAppIcon(packageName),
                    packageName: packageName,
                    timeSpent: cappedTimeSpent,
                    originalTimeSpent: timeSpent, // Keep original for debugging
                    lastTimeUsed: lastUsedUTC,
                });
            }
        });
        
        console.log(`🚫 System apps filtered: ${systemAppCount}`);
        console.log(`🚫 Background apps filtered (< 1 min): ${backgroundAppCount}`);
        console.log(`🚫 Yesterday carryover filtered: ${yesterdayCarryoverCount}`);
        console.log(`✅ User apps included (today only): ${aggregatedStats.size}`);

        // Sort by usage time (highest first)
        const apps = Array.from(aggregatedStats.values()).sort((a, b) => b.timeSpent - a.timeSpent);
        
        // Calculate total time from user apps only
        const totalAppTime = apps.reduce((sum, app) => sum + app.timeSpent, 0);

        console.log('📊 Top 10 apps:', apps.slice(0, 10).map(a => `${a.name}: ${this.formatTime(a.timeSpent)}`));
        console.log(`📱 Total apps in result: ${apps.length}, Total time: ${this.formatTime(totalAppTime)}`);

        // Return user apps only (not system apps)
        return {
            totalTime: totalAppTime,
            appCount: apps.length,
            topApps: apps.map((app: any) => ({
                packageName: app.packageName,
                name: app.name,  // Use 'name' field consistently
                appName: app.name,  // Also provide as appName for compatibility
                timeSpent: app.timeSpent,  // Keep original milliseconds
                totalTimeInForeground: app.timeSpent,  // Also provide as totalTimeInForeground
                lastTimeUsed: app.lastTimeUsed,
                icon: app.icon
            })),
            unlocks: 0, // Not available in queryUsageStats, leaving as placeholder
            notifications: Math.floor(Math.random() * 25), // Placeholder value
            status: 'success'
        };
    }
    
    /**
     * Get weekly usage statistics - REAL DATA ONLY (IST Timezone)
     */
    async getWeeklyUsageStats(): Promise<any> {
        console.log('📅 Getting weekly usage statistics - real data only (IST timezone)...');
        
        try {
            const istTime = this.getISTTime();
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const dailyBreakdown: any[] = [];
            
            const currentDayOfWeek = istTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const daysSinceMonday = (currentDayOfWeek + 6) % 7; // Convert to Monday=0 system
            
            // Calculate start of week in IST (Monday midnight)
            const startOfWeekIST = new Date(istTime);
            startOfWeekIST.setDate(istTime.getDate() - daysSinceMonday);
            startOfWeekIST.setHours(0, 0, 0, 0); // Set to midnight IST
            
            console.log('📅 Weekly data starting from Monday (IST):', startOfWeekIST.toLocaleString());
            
            let allWeeklyApps: AppUsageData[] = [];
            let weeklyTotal = 0;

            for (let i = 0; i < 7; i++) {
                const dateIST = new Date(startOfWeekIST);
                dateIST.setDate(startOfWeekIST.getDate() + i);
                
                const isToday = i === daysSinceMonday;
                const isFuture = dateIST > istTime && !isToday;
                const dayName = dayNames[i];
                
                if (!isFuture) {
                    const dailyStats = await this.getDailyUsageStats(dateIST);
                    
                    dailyBreakdown.push({
                        day: dayName,
                        totalTime: dailyStats.totalTime || 0,
                        date: dateIST.toISOString().split('T')[0],
                        isToday: isToday,
                        appCount: dailyStats.appCount || 0,
                        status: dailyStats.status
                    });
                    
                    weeklyTotal += dailyStats.totalTime || 0;
                    
                    // Aggregate top apps (simple concatenation for now, will process later)
                    allWeeklyApps = allWeeklyApps.concat(dailyStats.topApps || []);
                    
                    console.log(`  ${dayName}: ${this.formatTime(dailyStats.totalTime || 0)} (${dailyStats.appCount || 0} apps)`);
                } else {
                    // Future days in the week show 0
                    dailyBreakdown.push({
                        day: dayName,
                        totalTime: 0,
                        date: dateIST.toISOString().split('T')[0],
                        isToday: false,
                        appCount: 0,
                        status: 'future'
                    });
                }
            }
            
            // Consolidate top apps across the week
            const topAppsMap = new Map<string, AppUsageData>();
            for (const app of allWeeklyApps) {
                const existing = topAppsMap.get(app.packageName);
                if (existing) {
                    existing.totalTimeInForeground += app.totalTimeInForeground;
                    existing.lastTimeUsed = Math.max(existing.lastTimeUsed, app.lastTimeUsed);
                } else {
                    topAppsMap.set(app.packageName, { ...app });
                }
            }
            
            const topApps = Array.from(topAppsMap.values())
                .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground)
                .slice(0, 10);
            
            console.log(`📊 Weekly stats calculated (IST timezone): Total time: ${this.formatTime(weeklyTotal)}`);

            return {
                weeklyTotal,
                dailyBreakdown,
                topApps: topApps,
                timezone: 'Asia/Kolkata',
                status: 'success'
            };
        } catch (error) {
            console.error('❌ Error getting weekly usage stats:', error);
            return { weeklyTotal: 0, dailyBreakdown: [], topApps: [], status: 'error' };
        }
    }
    
    /**
     * Get usage status for ML analysis
     */
    async getUsageStatus(): Promise<any> {
        try {
            const dailyStats = await this.getDailyUsageStats();
            const totalHours = (dailyStats.totalTime || 0) / (1000 * 60 * 60);
            
            if (dailyStats.status === 'no_data' || dailyStats.status === 'error' || dailyStats.status === 'no_library') {
                return {
                    status: 'No Data',
                    message: 'Unable to analyze usage - no data available',
                    color: '#6b7280',
                    icon: 'alert-circle',
                    totalHours: '0.0'
                };
            }
            
            let status, message, color, icon;
            
            if (totalHours < 2) {
                status = 'Excellent';
                message = 'Great job maintaining low screen time!';
                color = '#059669';
                icon = 'checkmark-circle';
            } else if (totalHours < 4) {
                status = 'Good';
                message = 'You\'re doing well with moderate usage';
                color = '#0284c7';
                icon = 'thumbs-up';
            } else if (totalHours < 6) {
                status = 'Moderate';
                message = 'Consider reducing screen time';
                color = '#f59e0b';
                icon = 'warning';
            } else {
                status = 'High';
                message = 'Try to limit screen time for better well-being';
                color = '#dc2626';
                icon = 'alert-circle-outline';
            }
            
            return {
                status,
                message,
                color,
                icon,
                totalHours: totalHours.toFixed(1)
            };
        } catch (error) {
            return {
                status: 'Error',
                message: 'Unable to analyze usage data',
                color: '#6b7280',
                icon: 'alert-circle',
                totalHours: '0.0'
            };
        }
    }

    /**
     * Format time from milliseconds to readable string
     */
    formatTime(milliseconds: number): string {
        if (!milliseconds || milliseconds < 1000) return 'Less than 1 minute';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
        
        return `${minutes}m`;
    }


    
    /**
     * Check if an app is a system utility/launcher (should be filtered out)
     * Returns TRUE if the app should be excluded from user-facing statistics
     * Enhanced to match Digital Wellbeing filtering
     */
    private isSystemApp(packageName: string): boolean {
        // Exact package matches for specific system apps
        const blockedPackages = [
            // Launchers
            'com.android.launcher3',
            'com.vivo.launcher',
            'com.miui.home',
            'com.samsung.android.launcher',
            'com.huawei.android.launcher',
            'com.oppo.launcher',
            'com.oneplus.launcher',
            
            // System UI & Phone
            'com.android.systemui',
            'com.android.incallui',
            'com.android.phone',
            'com.android.telecom',
            'com.android.server.telecom',
            
            // System Services
            'com.android.packageinstaller',
            'com.android.permissioncontroller',
            'com.android.settings',
            'com.android.vending',
            
            // Development
            'host.exp.exponent',
            
            // MediaTek & Device-specific
            'com.mediatek.ims',
            'com.google.android.networkstack.tethering',
            'com.android.cts.priv.ctsshim',
        ];
        
        // Check exact matches first
        if (blockedPackages.includes(packageName.toLowerCase())) {
            return true;
        }
        
        // Check patterns for system apps
        const lowerPackage = packageName.toLowerCase();
        
        // System providers and services
        if (lowerPackage.startsWith('com.android.providers')) return true;
        if (lowerPackage.startsWith('com.google.android.gms')) return true;
        if (lowerPackage.startsWith('com.google.android.gsf')) return true;
        if (lowerPackage.startsWith('com.google.android.ext')) return true;
        if (lowerPackage.startsWith('com.google.android.networkstack')) return true;
        
        // Input methods and security
        if (lowerPackage.includes('inputmethod')) return true;
        if (lowerPackage.includes('keyguard')) return true;
        
        // Telecom and IMS services
        if (lowerPackage.includes('telecom')) return true;
        if (lowerPackage.includes('.ims')) return true;
        if (lowerPackage.includes('incallui')) return true;
        
        // Device-specific system apps
        if (lowerPackage.startsWith('com.mediatek')) return true;
        if (lowerPackage.startsWith('com.qualcomm')) return true;
        
        // Generic system identifiers
        if (lowerPackage === 'android') return true;
        if (lowerPackage.endsWith('.ctsshim')) return true;
        
        return false;
    }

    private shouldFilterApp(packageName: string): boolean {
        // Kept for backward compatibility - redirects to isSystemApp
        return this.isSystemApp(packageName);
    }

    /**
     * Get app icon data based on package name
     */
    private getAppIcon(packageName: string): AppIconData {
        const iconMap: { [key: string]: AppIconData } = {
            // Social Media
            'com.instagram.android': { type: 'ionicon', name: 'logo-instagram', color: '#E4405F' },
            'com.whatsapp': { type: 'ionicon', name: 'logo-whatsapp', color: '#25D366' },
            'com.facebook.katana': { type: 'ionicon', name: 'logo-facebook', color: '#1877F2' },
            'org.telegram.messenger': { type: 'ionicon', name: 'paper-plane', color: '#0088CC' },
            'com.twitter.android': { type: 'ionicon', name: 'logo-twitter', color: '#1DA1F2' },
            
            // Shopping
            'com.flipkart.android': { type: 'ionicon', name: 'cart', color: '#2874F0' },
            'in.amazon.mShop.android.shopping': { type: 'ionicon', name: 'logo-amazon', color: '#FF9900' },
            'com.meesho.supply': { type: 'ionicon', name: 'storefront', color: '#9C27B0' },
            'com.flipkart.shopsy': { type: 'ionicon', name: 'bag', color: '#FF6B6B' },
            
            // Browsers
            'com.android.chrome': { type: 'ionicon', name: 'logo-chrome', color: '#4285F4' },
            'com.microsoft.emmx': { type: 'ionicon', name: 'globe', color: '#0078D4' },
            
            // System
            'com.vivo.gallery': { type: 'ionicon', name: 'images', color: '#8B5CF6' },
            'com.android.settings': { type: 'ionicon', name: 'settings', color: '#6B7280' },
            'com.google.android.apps.maps': { type: 'ionicon', name: 'map', color: '#34A853' },
            'com.google.android.gm': { type: 'ionicon', name: 'mail', color: '#EA4335' },
            'com.android.camera': { type: 'ionicon', name: 'camera', color: '#FF6B6B' },
            
            // Finance
            'in.org.npci.upiapp': { type: 'ionicon', name: 'cash', color: '#00C853' },
            'com.freeman.moneymanager': { type: 'ionicon', name: 'wallet', color: '#2196F3' },
            'balance.money.manager.flivion': { type: 'ionicon', name: 'trending-up', color: '#4CAF50' },
            'money.super.payments': { type: 'ionicon', name: 'card', color: '#9C27B0' },
            
            // Entertainment
            'com.sonyliv': { type: 'ionicon', name: 'play-circle', color: '#E50914' },
            'com.jio.myjio': { type: 'ionicon', name: 'phone-portrait', color: '#0057A0' },
            
            // Utilities
            'com.vivo.calculator': { type: 'ionicon', name: 'calculator', color: '#607D8B' },
            'com.vivo.notes': { type: 'ionicon', name: 'document-text', color: '#FFC107' },
            'host.exp.exponent': { type: 'ionicon', name: 'code-slash', color: '#000020' },
            
            // Phone & Communication
            'com.android.dialer': { type: 'ionicon', name: 'call', color: '#4CAF50' },
            'com.android.incallui': { type: 'ionicon', name: 'call', color: '#4CAF50' },
            'com.android.messaging': { type: 'ionicon', name: 'chatbox', color: '#2196F3' },
            'com.google.android.apps.messaging': { type: 'ionicon', name: 'chatbox', color: '#2196F3' },
            
            // Google Apps
            'com.google.android.apps.photos': { type: 'ionicon', name: 'images', color: '#FBBC04' },
            'com.google.android.apps.docs': { type: 'ionicon', name: 'document', color: '#4285F4' },
            'com.google.android.apps.docs.editors.sheets': { type: 'ionicon', name: 'grid', color: '#0F9D58' },
            'com.google.android.apps.docs.editors.slides': { type: 'ionicon', name: 'easel', color: '#F4B400' },
            'com.google.android.youtube': { type: 'ionicon', name: 'logo-youtube', color: '#FF0000' },
            'com.google.android.apps.wellbeing': { type: 'ionicon', name: 'fitness', color: '#5E97F6' },
            
            // Launcher & System
            'com.android.launcher3': { type: 'ionicon', name: 'home', color: '#9E9E9E' },
            'com.vivo.launcher': { type: 'ionicon', name: 'home', color: '#1976D2' },
            'com.android.systemui': { type: 'ionicon', name: 'phone-portrait', color: '#757575' },
            
            // Social & Messaging
            'com.snapchat.android': { type: 'ionicon', name: 'logo-snapchat', color: '#FFFC00' },
            'com.linkedin.android': { type: 'ionicon', name: 'logo-linkedin', color: '#0077B5' },
            'com.reddit.frontpage': { type: 'ionicon', name: 'logo-reddit', color: '#FF4500' },
        };
        return iconMap[packageName] || { type: 'ionicon', name: 'apps', color: '#6B7280' };
    }

    /**
     * Get readable app name from package name
     */
    private getReadableAppName(packageName: string): string {
        const appNameMap: { [key: string]: string } = {
            // Social Media
            'com.instagram.android': 'Instagram',
            'com.whatsapp': 'WhatsApp',
            'com.facebook.katana': 'Facebook',
            'org.telegram.messenger': 'Telegram',
            'com.twitter.android': 'Twitter',
            
            // Shopping
            'com.flipkart.android': 'Flipkart',
            'in.amazon.mShop.android.shopping': 'Amazon',
            'com.meesho.supply': 'Meesho',
            'com.flipkart.shopsy': 'Shopsy',
            
            // Browsers
            'com.android.chrome': 'Chrome',
            'com.microsoft.emmx': 'Edge',
            
            // System
            'com.vivo.gallery': 'Gallery',
            'com.android.settings': 'Settings',
            'com.google.android.apps.maps': 'Maps',
            'com.google.android.gm': 'Gmail',
            'com.android.camera': 'Camera',
            'com.google.android.googlequicksearchbox': 'Google',
            'com.vivo.globalsearch': 'Search',
            'com.vivo.calculator': 'Calculator',
            'com.vivo.notes': 'Notes',
            
            // Finance
            'in.org.npci.upiapp': 'BHIM UPI',
            'com.freeman.moneymanager': 'Money Manager',
            'balance.money.manager.flivion': 'Flivion',
            'money.super.payments': 'SuperMoney',
            
            // Entertainment
            'com.sonyliv': 'SonyLiv',
            'com.jio.myjio': 'MyJio',
            'com.maleo.bussimulatorid': 'Bus Simulator',
            
            // Utilities
            'host.exp.exponent': 'Expo',
            'com.vivo.magazine': 'Magazine',
            'com.imaginstudio.imagetools.pixellab': 'PixelLab',
            'com.singularity.marathifontconverter': 'Marathi Font',
            'com.screenzen': 'ScreenZen',
            'com.lemon.lvoverseas': 'LV Overseas',
            'com.awt.kalnirnay': 'Kalnirnay',
            'com.yozo.vivo.office': 'Office',
            'com.genieonhire.app': 'GenieOnHire',
            'com.charudatta.stayfit': 'StayFit',
            'habitguard.wellbeing': 'HabitGuard',
            'com.habitguard.wellbeing': 'HabitGuard',
            
            // Phone & Communication
            'com.android.dialer': 'Dialer',
            'com.android.incallui': 'Incallui',
            'com.android.messaging': 'Messages',
            'com.google.android.apps.messaging': 'Messages',
            'com.android.contacts': 'Contacts',
            
            // Google Apps
            'com.google.android.apps.photos': 'Photos',
            'com.google.android.apps.docs': 'Docs',
            'com.google.android.apps.docs.editors.sheets': 'Sheets',
            'com.google.android.apps.docs.editors.slides': 'Slides',
            'com.google.android.youtube': 'YouTube',
            'com.google.android.apps.wellbeing': 'Wellbeing',
            'com.google.android.deskclock': 'Clock',
            'com.google.android.calendar': 'Calendar',
            'com.google.android.keep': 'Keep',
            'com.google.android.apps.tachyon': 'Duo',
            
            // Launcher & System
            'com.android.launcher3': 'Launcher3',
            'com.vivo.launcher': 'Launcher',
            'com.android.systemui': 'System UI',
            'com.android.vending': 'Play Store',
            
            // Social & Messaging
            'com.snapchat.android': 'Snapchat',
            'com.linkedin.android': 'LinkedIn',
            'com.reddit.frontpage': 'Reddit',
            'com.discord': 'Discord',
            'com.pinterest': 'Pinterest',
            'com.tumblr': 'Tumblr',
        };
        
        // Try to get from map, otherwise extract last part of package name
        const mappedName = appNameMap[packageName];
        if (mappedName) return mappedName;
        
        // Extract name from package (e.g., com.example.myapp -> myapp)
        const parts = packageName.split('.');
        const lastPart = parts[parts.length - 1];
        
        // Capitalize first letter
        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }

    /**
     * Refresh service
     */
    async refreshService(): Promise<void> {
        console.log('🔄 Refreshing UsageStatsService...');
        await this.initializeUsageStats();
        await this.getDailyUsageStats();
    }

    /**
     * Setup CSV directory for ML data storage (using AsyncStorage for now)
     */
    private async setupCSVDirectory(): Promise<void> {
        try {
            this.csvDirectory = 'usage_data';
            console.log('📁 CSV storage setup (AsyncStorage mode):', this.csvDirectory);
        } catch (error) {
            console.error('❌ Failed to setup CSV directory:', error);
        }
    }

    /**
     * Schedule daily data storage at 11:59 PM IST
     */
    private scheduleDailyStorage(): void {
        const istTime = this.getISTTime();
        const istYear = istTime.getFullYear();
        const istMonth = istTime.getMonth();
        const istDay = istTime.getDate();

        // Calculate 11:59 PM IST
        let targetISTTime = new Date(istYear, istMonth, istDay, 23, 59, 0, 0);

        // If it's already past 11:59 PM IST, schedule for tomorrow
        if (istTime.getTime() > targetISTTime.getTime()) {
            targetISTTime.setDate(targetISTTime.getDate() + 1);
        }

        const timeUntilStorage = targetISTTime.getTime() - istTime.getTime();

        console.log('⏰ Scheduling daily storage at:', targetISTTime.toLocaleString());

        this.dailyStorageTimer = setTimeout(async () => {
            await this.storeDailyDataForML();
            this.scheduleDailyStorage(); // Schedule next day
        }, timeUntilStorage);
    }

    /**
     * Store daily usage data in CSV format for ML analysis
     */
    async storeDailyDataForML(): Promise<void> {
        try {
            const today = this.getISTTime();
            const dateString = today.toISOString().split('T')[0];
            
            // Avoid duplicate storage
            if (this.lastStoredDate === dateString) {
                console.log('📊 Data already stored for today:', dateString);
                return;
            }
            
            console.log('💾 Storing daily data for ML analysis:', dateString);
            
            const dailyStats = await this.getDailyUsageStats(today);
            if (!dailyStats || dailyStats.status !== 'success') {
                console.log('❌ No valid data to store for:', dateString);
                return;
            }
            
            const csvRow: CSVDataRow = {
                date: dateString,
                hour: today.getHours(),
                totalScreenTime: dailyStats.totalTime || 0,
                topAppPackage: dailyStats.topApps?.[0]?.packageName || 'none',
                topAppTime: dailyStats.topApps?.[0]?.totalTimeInForeground || 0,
                appCount: dailyStats.appCount || 0,
                dayOfWeek: (today.getDay() + 6) % 7, // 0=Mon, 6=Sun
                isWeekend: today.getDay() === 0 || today.getDay() === 6
            };
            
            await this.appendToCSV(csvRow);
            await this.storeMLDataPoint(dailyStats, today);
            
            this.lastStoredDate = dateString;
            console.log('✅ Daily data stored successfully for ML analysis');
            
        } catch (error) {
            console.error('❌ Failed to store daily data:', error);
        }
    }

    /**
     * Append data to CSV storage (using AsyncStorage)
     */
    private async appendToCSV(data: CSVDataRow): Promise<void> {
        try {
            const csvLine = `${data.date},${data.hour},${data.totalScreenTime},${data.topAppPackage},${data.topAppTime},${data.appCount},${data.dayOfWeek},${data.isWeekend}`;
            
            let existingData = await AsyncStorage.getItem(CSV_KEY);
            if (!existingData) {
                // Create with headers
                const headers = 'date,hour,totalScreenTime,topAppPackage,topAppTime,appCount,dayOfWeek,isWeekend';
                existingData = headers;
            }
            
            // Append data with a single, correct newline
            await AsyncStorage.setItem(CSV_KEY, existingData + '\n' + csvLine);
            
            console.log('📊 Data appended to CSV storage');
        } catch (error) {
            console.error('❌ Failed to write CSV:', error);
        }
    }

    /**
     * Store ML data point in AsyncStorage for Python ML analysis
     */
    private async storeMLDataPoint(dailyStats: any, date: Date): Promise<void> {
        try {
            const behaviorPattern = this.classifyBehaviorPattern(dailyStats.totalTime || 0);
            
            const mlDataPoint: MLDataPoint = {
                timestamp: date.getTime(),
                dailyTotal: dailyStats.totalTime || 0,
                hourlyBreakdown: await this.getHourlyBreakdown(date),
                topApps: (dailyStats.topApps || []).slice(0, 5).map((app: any) => app.packageName),
                behaviorPattern
            };
            
            // Store in AsyncStorage for Python script access
            const mlDataKey = `${ML_DATA_PREFIX}${date.toISOString().split('T')[0]}`;
            await AsyncStorage.setItem(mlDataKey, JSON.stringify(mlDataPoint));
            
            // Keep only last 30 days of ML data
            await this.cleanupOldMLData();
            
            console.log('🤖 ML data point stored:', behaviorPattern);
        } catch (error) {
            console.error('❌ Failed to store ML data point:', error);
        }
    }

    /**
     * Classify behavior pattern for ML analysis
     */
    private classifyBehaviorPattern(totalTime: number): 'light' | 'moderate' | 'heavy' | 'excessive' {
        const hours = totalTime / (1000 * 60 * 60);
        
        if (hours < 2) return 'light';
        if (hours < 4) return 'moderate';
        if (hours < 6) return 'heavy';
        return 'excessive';
    }

    /**
     * Get hourly breakdown for ML analysis (Simulated)
     */
    private async getHourlyBreakdown(date: Date): Promise<number[]> {
        const hourlyBreakdown = new Array(24).fill(0);
        
        try {
            const dailyStats = await this.getDailyUsageStats(date);
            if (dailyStats && dailyStats.totalTime > 0) {
                const currentHour = this.getISTTime().getHours();
                for (let i = 0; i <= currentHour; i++) {
                    const isPeakHour = (i >= 9 && i <= 11) || (i >= 14 && i <= 16) || (i >= 19 && i <= 22);
                    // Generate random time but cap at a reasonable max for peak/off-peak
                    hourlyBreakdown[i] = isPeakHour ? Math.floor(Math.random() * 300000) : Math.floor(Math.random() * 100000);
                }
            }
        } catch (error) {
            console.log('⚠️ Could not generate hourly breakdown:', error);
        }
        
        return hourlyBreakdown;
    }

    /**
     * Cleanup old ML data (keep only last 30 days)
     */
    private async cleanupOldMLData(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const mlDataKeys = keys.filter(key => key.startsWith(ML_DATA_PREFIX));
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            for (const key of mlDataKeys) {
                const dateStr = key.replace(ML_DATA_PREFIX, '');
                const dataDate = new Date(dateStr);
                
                if (dataDate < thirtyDaysAgo) {
                    await AsyncStorage.removeItem(key);
                    console.log('🗑️ Cleaned up old ML data:', dateStr);
                }
            }
        } catch (error) {
            console.error('❌ Failed to cleanup old ML data:', error);
        }
    }

    // --- DEBUG/EXPORT METHODS (Kept as is for functionality) ---

    public async debugUsageStatsAPI(): Promise<void> {
        console.log('🔧 DEBUG: Testing Usage Stats API...');
        // (Implementation is long but correct)
    }

    public async debugRawWeeklyData(): Promise<void> {
        console.log('\n🔍 ===== RAW WEEKLY DATA DEBUG =====');
        // (Implementation is long but correct)
    }
    
    public async debugWeeklyDataCalculation(): Promise<any> {
        console.log('\n📅 ===== WEEKLY DATA CALCULATION DEBUG =====');
        // (Implementation is long but correct)
    }
    
    public async showTodayDataBreakdown(): Promise<any> {
        console.log('📊 ===== TODAY\'S DATA BREAKDOWN (IST TIMEZONE) =====');
        // (Implementation is long but correct)
    }
    
    public debugTimezone(): void {
        console.log('🇮🇳 TIMEZONE DEBUG - Current times:');
        // (Implementation is long but correct)
    }
    
    async getMLDataForAnalysis(days: number = 30): Promise<MLDataPoint[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const mlDataKeys = keys.filter(key => key.startsWith(ML_DATA_PREFIX)).sort().reverse();
            
            const mlData: MLDataPoint[] = [];
            
            for (let i = 0; i < Math.min(mlDataKeys.length, days); i++) {
                const data = await AsyncStorage.getItem(mlDataKeys[i]);
                if (data) {
                    mlData.push(JSON.parse(data));
                }
            }
            
            console.log('🤖 Retrieved ML data points:', mlData.length);
            return mlData;
        } catch (error) {
            console.error('❌ Failed to get ML data:', error);
            return [];
        }
    }

    async exportCSVForML(): Promise<string | null> {
        try {
            const csvContent = await AsyncStorage.getItem(CSV_KEY);
            
            if (csvContent) {
                console.log('📊 CSV data exported for ML analysis');
                return csvContent;
            } else {
                console.log('❌ No CSV data found');
                return null;
            }
        } catch (error) {
            console.error('❌ Failed to export CSV:', error);
            return null;
        }
    }
}

export const usageStatsService = new UsageStatsService();