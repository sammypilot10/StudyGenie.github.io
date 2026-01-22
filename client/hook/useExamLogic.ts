// client/hook/useExamLogic.ts
import { useState, useEffect, useRef } from 'react';

export const useExamTimer = (durationInMinutes: number, onComplete: () => void) => {
  // Initialize time in seconds
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);
  
  // Use a ref for the callback to prevent stale closures
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset timer if duration changes (e.g. if you load a different exam)
  useEffect(() => {
    setTimeLeft(durationInMinutes * 60);
  }, [durationInMinutes]);

  // Optimized Timer Logic
  useEffect(() => {
    // Set the interval just once on mount
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        // Check if we are about to hit 0
        if (prev <= 1) {
          clearInterval(timerId);
          // Safely call the complete function
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }
        // Otherwise, tick down
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(timerId);
  }, []); // Empty dependency array = runs once on mount

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return { formatTime, timeLeft };
};