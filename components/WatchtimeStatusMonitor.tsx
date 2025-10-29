import { useWatchtimeStatusMonitor } from '@/hooks/useWatchtimeStatusMonitor';
import { useEffect } from 'react';

/**
 * WatchtimeStatusMonitor Component
 * 
 * This component monitors screen time status changes and sends notifications
 * when the user moves from one status level to another (e.g., Good → Moderate).
 * 
 * It runs in the background and checks every minute.
 * 
 * Usage: Add this component to your main layout to enable status monitoring.
 */
export function WatchtimeStatusMonitor() {
  const { currentStatus, isMonitoring, startMonitoring } = useWatchtimeStatusMonitor();

  useEffect(() => {
    // Ensure monitoring starts when component mounts
    if (!isMonitoring) {
      startMonitoring();
    }
  }, [isMonitoring]);

  useEffect(() => {
    if (currentStatus) {
      console.log(`📊 Current watchtime status: ${currentStatus}`);
    }
  }, [currentStatus]);

  // This component doesn't render anything - it just monitors in the background
  return null;
}
