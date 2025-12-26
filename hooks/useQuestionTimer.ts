import { useState, useEffect, useRef, useCallback } from 'react';

interface UseQuestionTimerOptions {
    timeLimit: number;
    onExpire?: () => void;
    autoStart?: boolean;
}

/**
 * Hook for per-question countdown timer
 */
export function useQuestionTimer({
    timeLimit,
    onExpire,
    autoStart = true
}: UseQuestionTimerOptions) {
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [isRunning, setIsRunning] = useState(autoStart);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasExpired = useRef(false);

    const start = useCallback(() => {
        setIsRunning(true);
        hasExpired.current = false;
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        setTimeLeft(timeLimit);
        setIsRunning(autoStart);
        hasExpired.current = false;
    }, [timeLimit, autoStart]);

    const stop = useCallback(() => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;
                    if (newTime <= 0 && !hasExpired.current) {
                        hasExpired.current = true;
                        setIsRunning(false);
                        onExpire?.();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, onExpire]);

    return {
        timeLeft,
        isRunning,
        start,
        pause,
        reset,
        stop
    };
}
