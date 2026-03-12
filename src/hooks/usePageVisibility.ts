import { useState, useEffect } from 'react';

/**
 * Hook to detect when the page is visible/hidden
 * Used to pause polling when user is not actively viewing the page
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

/**
 * Hook to detect user activity and pause polling when inactive
 * Pauses after 2 minutes of inactivity
 */
export function useUserActivity(timeout: number = 120000) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let timeoutId: number;

    const resetTimer = () => {
      setIsActive(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsActive(false), timeout);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Set initial timer
    timeoutId = setTimeout(() => setIsActive(false), timeout);

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [timeout]);

  return isActive;
}

/**
 * Combined hook for intelligent polling control
 * Only allows polling when page is visible AND user is active
 */
export function useIntelligentPolling() {
  const isVisible = usePageVisibility();
  const isActive = useUserActivity();
  
  return isVisible && isActive;
}