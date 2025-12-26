"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface TimerDisplayProps {
    timeLeft: number
    totalTime: number
}

export function TimerDisplay({ timeLeft, totalTime }: TimerDisplayProps) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])

    const percentage = (timeLeft / totalTime) * 100
    const isUrgent = timeLeft <= 10
    const isWarning = timeLeft <= 20 && timeLeft > 10

    const getColor = () => {
        if (isUrgent) return "text-red-500"
        if (isWarning) return "text-primary"
        return "text-green-500"
    }

    const getStrokeColor = () => {
        if (isUrgent) return "#ef4444"
        if (isWarning) {
            // Use primary color - black in light mode, white in dark mode
            if (!mounted) return "#000000" // Default to black during SSR
            return theme === 'dark' ? '#ffffff' : '#000000'
        }
        return "#22c55e"
    }

    return (
        <div className="flex items-center gap-2">
            <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted-foreground/20"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke={getStrokeColor()}
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `${2 * Math.PI * 20}` }}
                        animate={{
                            strokeDashoffset: `${2 * Math.PI * 20 * (1 - percentage / 100)}`,
                        }}
                        transition={{ duration: 0.5 }}
                        style={{
                            strokeDasharray: `${2 * Math.PI * 20}`,
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className={`w-4 h-4 ${getColor()}`} />
                </div>
            </div>
            <div className="flex flex-col">
                <span className={`text-2xl font-bold tabular-nums ${getColor()}`}>
                    {timeLeft}
                </span>
                <span className="text-xs text-muted-foreground">seconds</span>
            </div>
            {isUrgent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="ml-2"
                >
                    <span className="text-red-500 text-sm font-medium">Hurry!</span>
                </motion.div>
            )}
        </div>
    )
}
