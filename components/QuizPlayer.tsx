'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { submitQuiz } from '@/lib/submission-actions'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useTimer } from '@/hooks/useTimer'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Send, Loader2, Clock, AlertTriangle } from 'lucide-react'

interface Question {
    id: string
    question_text: string
    options: string[]
    order_index: number
}

interface QuizPlayerProps {
    quizId: string
    quizTitle: string
    questions: Question[]
    durationMinutes?: number
}

export default function QuizPlayer({ quizId, quizTitle, questions, durationMinutes }: QuizPlayerProps) {
    const router = useRouter()

    // localStorage persistence for quiz state
    const [selectedAnswers, setSelectedAnswers, clearAnswers] = useLocalStorage<Record<string, number>>(
        `quiz_answers_${quizId}`,
        {}
    )
    const [currentQuestionIndex, setCurrentQuestionIndex, clearIndex] = useLocalStorage<number>(
        `quiz_index_${quizId}`,
        0
    )

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100
    const isLastQuestion = currentQuestionIndex === questions.length - 1
    const isFirstQuestion = currentQuestionIndex === 0

    // Timer (only if duration is set)
    const timer = useTimer({
        durationMinutes: durationMinutes || 60,
        onTimeout: () => {
            toast.warning('Time\'s Up!', {
                description: 'Your quiz will be auto-submitted',
            })
            handleSubmit()
        },
        quizId,
    })

    const handleAnswerSelect = (optionIndex: number) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionIndex,
        }))
    }

    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex((prev) => prev + 1)
        } else {
            setShowConfirmDialog(true)
        }
    }

    const handlePrevious = () => {
        if (!isFirstQuestion) {
            setCurrentQuestionIndex((prev) => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setShowConfirmDialog(false)
        setIsSubmitting(true)

        try {
            const result = await submitQuiz(quizId, selectedAnswers)

            if (result.error) {
                toast.error('Error', {
                    description: result.error,
                })
                setIsSubmitting(false)
            } else if (result.success) {
                // Clear localStorage on successful submission
                clearAnswers()
                clearIndex()
                if (durationMinutes) {
                    timer.clearTimer()
                }

                toast.success('Quiz Submitted!', {
                    description: `You scored ${result.score}/${result.totalQuestions}`,
                })
                router.push(`/quiz/${quizId}/results`)
            }
        } catch (error) {
            toast.error('Error', {
                description: 'Failed to submit quiz',
            })
            setIsSubmitting(false)
        }
    }

    const answeredCount = Object.keys(selectedAnswers).length
    const canNavigateNext = selectedAnswers[currentQuestion.id] !== undefined

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Timer (if enabled) */}
                {durationMinutes && (
                    <div className="mb-4">
                        <Card className={`border-slate-700 ${timer.isVeryLowTime
                                ? 'bg-red-950/30 border-red-700'
                                : timer.isLowTime
                                    ? 'bg-primary/20 border-primary/50'
                                    : 'bg-slate-800/30'
                            } backdrop-blur`}>
                            <CardContent className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className={`w-5 h-5 ${timer.isVeryLowTime ? 'text-red-400' : timer.isLowTime ? 'text-primary' : 'text-slate-400'
                                        }`} />
                                    <span className="text-sm text-slate-300">Time Remaining:</span>
                                </div>
                                <Badge className={`text-lg font-mono ${timer.isVeryLowTime
                                        ? 'bg-red-900 text-red-200 border-red-700'
                                        : timer.isLowTime
                                            ? 'bg-primary/30 text-primary border-primary/50'
                                            : 'bg-slate-700 text-white border-slate-600'
                                    }`}>
                                    {timer.formattedTime}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Progress Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-medium text-slate-300">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </h2>
                        <span className="text-sm text-slate-400">
                            {answeredCount} / {questions.length} answered
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Quiz Title */}
                <h1 className="text-2xl font-bold text-white mb-6">{quizTitle}</h1>

                {/* Question Card */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl shadow-2xl mb-6">
                    <CardHeader>
                        <CardTitle className="text-white text-xl">
                            {currentQuestion.question_text}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Select one answer
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={selectedAnswers[currentQuestion.id]?.toString()}
                            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                        >
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedAnswers[currentQuestion.id] === index
                                                ? 'border-purple-500 bg-purple-950/30'
                                                : 'border-slate-600 bg-slate-700/20 hover:border-slate-500'
                                            }`}
                                        onClick={() => handleAnswerSelect(index)}
                                    >
                                        <RadioGroupItem
                                            value={index.toString()}
                                            id={`option-${index}`}
                                            className="border-slate-400"
                                        />
                                        <Label
                                            htmlFor={`option-${index}`}
                                            className="flex-1 text-white cursor-pointer font-normal"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={isFirstQuestion || isSubmitting}
                            className="border-slate-600 text-slate-200 hover:bg-slate-700"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        {isLastQuestion ? (
                            <Button
                                onClick={handleNext}
                                disabled={!canNavigateNext || isSubmitting}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Quiz
                                        <Send className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={!canNavigateNext}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Answer Summary */}
                <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2">
                            {questions.map((q, index) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    disabled={isSubmitting}
                                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${selectedAnswers[q.id] !== undefined
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                        } ${currentQuestionIndex === index
                                            ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900'
                                            : 'hover:bg-slate-600'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Submit Quiz?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300">
                            Are you sure you want to submit your quiz? You have answered {answeredCount} out of{' '}
                            {questions.length} questions. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-600 text-slate-200 hover:bg-slate-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                            Submit Quiz
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
