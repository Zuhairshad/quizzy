import { useState, useEffect, useRef } from 'react'

interface UseTimerProps {
    durationMinutes: number
    onTimeout: () => void
    quizId: string
}

/**
 * Custom hook for quiz countdown timer
 * Persists remaining time in localStorage
 */
export function useTimer({ durationMinutes, onTimeout, quizId }: UseTimerProps) {
    const storageKey = `quiz_timer_${quizId}`
    const [timeRemaining, setTimeRemaining] = useState<number>(() => {
        // Try to restore from localStorage
        if (typeof window === 'undefined') return durationMinutes * 60

        try {
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                const { endTime } = JSON.parse(stored)
                const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
                return remaining > 0 ? remaining : durationMinutes * 60
            }
        } catch (error) {
            console.error('Error restoring timer:', error)
        }

        return durationMinutes * 60
    })

    const [isRunning, setIsRunning] = useState(true)
    const hasTimedOut = useRef(false)

    // Initialize end time in localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return

        try {
            const stored = localStorage.getItem(storageKey)
            if (!stored) {
                const endTime = Date.now() + (durationMinutes * 60 * 1000)
                localStorage.setItem(storageKey, JSON.stringify({ endTime }))
            }
        } catch (error) {
            console.error('Error initializing timer:', error)
        }
    }, [durationMinutes, storageKey])

    // Countdown effect
    useEffect(() => {
        if (!isRunning || timeRemaining <= 0) return

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 1

                // Check if time is up
                if (newTime <= 0 && !hasTimedOut.current) {
                    hasTimedOut.current = true
                    clearInterval(interval)
                    // Defer callback to avoid setState during render
                    setTimeout(() => onTimeout(), 0)
                    return 0
                }

                return newTime
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isRunning, onTimeout, timeRemaining])

    const clearTimer = () => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(storageKey)
            }
        } catch (error) {
            console.error('Error clearing timer:', error)
        }
    }

    const pauseTimer = () => setIsRunning(false)
    const resumeTimer = () => setIsRunning(true)

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const isLowTime = timeRemaining <= 300 // 5 minutes
    const isVeryLowTime = timeRemaining <= 60 // 1 minute

    return {
        timeRemaining,
        formattedTime: formatTime(timeRemaining),
        isRunning,
        isLowTime,
        isVeryLowTime,
        pauseTimer,
        resumeTimer,
        clearTimer,
    }
}
