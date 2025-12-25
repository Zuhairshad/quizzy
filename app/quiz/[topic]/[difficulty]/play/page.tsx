"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ArrowLeft, Maximize, CheckCircle, XCircle, ExternalLink, Clock } from "lucide-react"
import { QUIZ_DATA } from "@/lib/quiz-data"
import { useTimer } from "@/hooks/useTimer"
import { toast } from "sonner"

interface QuizPlayPageProps {
    params: Promise<{ topic: string; difficulty: string }>
}

export default function QuizPlayPage({ params }: QuizPlayPageProps) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, number>>({})
    const [showFeedback, setShowFeedback] = useState(false)
    const [score, setScore] = useState(0)
    const [showWarning, setShowWarning] = useState(false)
    const [warningMessage, setWarningMessage] = useState("")
    const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const hasStartedQuizRef = useRef(false)
    const isOpeningExternalLinkRef = useRef(false)
    const quizContainerRef = useRef<HTMLDivElement>(null)

    const { topic, difficulty } = use(params)
    const QUESTIONS = QUIZ_DATA[topic]?.[difficulty] || []

    // Timer (15 minutes)
    const timer = useTimer({
        durationMinutes: 15,
        onTimeout: () => {
            toast.warning("Time's Up!", {
                description: 'Your quiz will be auto-submitted',
            })
            // Auto-submit when time runs out
            handleAutoSubmit()
        },
        quizId: `${topic}_${difficulty}`,
    })

    const enterFullscreen = async () => {
        try {
            // Use document.documentElement instead of a container div
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen()
                setIsFullscreen(true)
                setShowFullscreenPrompt(false)
                hasStartedQuizRef.current = true
            } else {
                toast.error("Fullscreen not supported", {
                    description: "Your browser doesn't support fullscreen mode. Please use a modern browser."
                })
            }
        } catch (error) {
            console.error("Fullscreen request failed:", error)
            toast.error("Fullscreen failed", {
                description: "Could not enter fullscreen mode. Please try again or check browser permissions."
            })
        }
    }

    useEffect(() => {
        const storedEmail = sessionStorage.getItem("quiz_email")
        if (!storedEmail || QUESTIONS.length === 0) {
            router.push(`/quiz/${topic}/${difficulty}`)
            return
        }
        setEmail(storedEmail)

        document.body.style.userSelect = "none"
        document.body.style.webkitUserSelect = "none"

        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement
            setIsFullscreen(isCurrentlyFullscreen)

            if (!isCurrentlyFullscreen && hasStartedQuizRef.current) {
                setSubmittedAnswers({})
                setCurrentQuestion(0)
                setScore(0)
                setShowFeedback(false)
                setSelectedAnswer(null)

                setWarningMessage(
                    "⚠️ QUIZ RESTARTED: You exited fullscreen mode. All progress cleared."
                )
                setShowWarning(true)
                setShowFullscreenPrompt(true)
                hasStartedQuizRef.current = false
            }
        }

        const handleVisibilityChange = () => {
            // Ignore visibility changes from opening external links
            if (isOpeningExternalLinkRef.current) {
                isOpeningExternalLinkRef.current = false
                return
            }

            if (document.hidden && hasStartedQuizRef.current) {
                setSubmittedAnswers({})
                setCurrentQuestion(0)
                setScore(0)
                setShowFeedback(false)
                setSelectedAnswer(null)

                if (document.fullscreenElement) {
                    document.exitFullscreen()
                }

                setWarningMessage(
                    "⚠️ QUIZ RESTARTED: Tab switching detected. All progress cleared."
                )
                setShowWarning(true)
                setShowFullscreenPrompt(true)
                hasStartedQuizRef.current = false
            }
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            document.body.style.userSelect = ""
            document.body.style.webkitUserSelect = ""
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
            document.removeEventListener("visibilitychange", handleVisibilityChange)

            if (document.fullscreenElement) {
                document.exitFullscreen()
            }
        }
    }, [topic, difficulty, router, QUESTIONS.length])

    const handleCopyAttempt = (e: React.ClipboardEvent) => {
        e.preventDefault()
        setWarningMessage("Copying quiz content is against academic integrity policies.")
        setShowWarning(true)
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
    }

    const handleAnswerSelect = (optionIndex: number) => {
        // Can only select if question hasn't been submitted yet
        if (!submittedAnswers[currentQuestion] && submittedAnswers[currentQuestion] !== 0) {
            setSelectedAnswer(optionIndex)
        }
    }

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return

        const question = QUESTIONS[currentQuestion]
        const isCorrect = selectedAnswer === question.correctAnswer

        // Lock in the answer
        setSubmittedAnswers({ ...submittedAnswers, [currentQuestion]: selectedAnswer })

        // Update score if correct
        if (isCorrect) {
            setScore(score + 1)
        }

        // Show feedback
        setShowFeedback(true)
    }

    const handleNextQuestion = () => {
        if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setSelectedAnswer(submittedAnswers[currentQuestion + 1] ?? null)
            setShowFeedback(submittedAnswers[currentQuestion + 1] !== undefined)
        } else {
            finishQuiz()
        }
    }

    const finishQuiz = () => {
        // Quiz complete - save results and navigate
        sessionStorage.setItem("quiz_score", score.toString())
        sessionStorage.setItem("quiz_total", QUESTIONS.length.toString())
        sessionStorage.setItem("quiz_answers", JSON.stringify(submittedAnswers))

        if (document.fullscreenElement) {
            document.exitFullscreen()
        }

        timer.clearTimer()
        router.push(`/quiz/${topic}/${difficulty}/results`)
    }

    const handleAutoSubmit = () => {
        // Auto-submit all questions when timer runs out
        finishQuiz()
    }

    const progress = ((Object.keys(submittedAnswers).length) / QUESTIONS.length) * 100
    const question = QUESTIONS[currentQuestion]
    const isQuestionAnswered = submittedAnswers[currentQuestion] !== undefined
    const userAnswer = submittedAnswers[currentQuestion]
    const isCorrect = userAnswer === question?.correctAnswer

    if (!question) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Navbar />
                <p className="text-[#ffff00]">Quiz not found</p>
            </div>
        )
    }

    return (
        <div
            ref={quizContainerRef}
            className="min-h-screen bg-black select-none"
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
            }}
            onCopy={handleCopyAttempt}
            onCut={handleCopyAttempt}
            onContextMenu={handleContextMenu}
            onDragStart={(e) => e.preventDefault()}
        >
            {!isFullscreen && <Navbar />}

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {showFullscreenPrompt && (
                        <Card className="border-[#ffff00]/30 bg-[#ffff00]/10 backdrop-blur-xl mb-6">
                            <CardHeader>
                                <CardTitle className="text-[#ffff00] flex items-center gap-2">
                                    <Maximize className="h-6 w-6" />
                                    Fullscreen Mode Required
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-[#f0ff00] text-sm">
                                    <p>⚠️ <strong>Quiz Rules:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Quiz must be in fullscreen</li>
                                        <li>Exiting fullscreen restarts quiz</li>
                                        <li>Switching tabs restarts quiz</li>
                                        <li>Once submitted, answers are final</li>
                                    </ul>
                                </div>
                                <Button
                                    onClick={enterFullscreen}
                                    className="w-full bg-gradient-to-r from-[#ffff00] to-[#f0ff00] text-black font-bold text-lg py-6"
                                >
                                    <Maximize className="mr-2 h-5 w-5" />
                                    Enter Fullscreen & Start Quiz
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {isFullscreen && (
                        <>
                            <div className="absolute top-4 left-4 z-50">
                                <Link href={`/quiz/${topic}/${difficulty}`}>
                                    <Button
                                        variant="ghost"
                                        className="border border-[#ffff00]/20 text-[#f0ff00] hover:bg-[#ffff00]/10"
                                        onClick={() => {
                                            if (document.fullscreenElement) {
                                                document.exitFullscreen()
                                            }
                                        }}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Exit Quiz
                                    </Button>
                                </Link>
                            </div>

                            {/* Timer Display */}
                            <div className="absolute top-4 right-4 z-50">
                                <Card className={`border-2 ${timer.isVeryLowTime
                                    ? 'bg-red-950/50 border-red-500'
                                    : timer.isLowTime
                                        ? 'bg-yellow-950/50 border-yellow-500'
                                        : 'bg-[#ffff00]/10 border-[#ffff00]/30'
                                    } backdrop-blur`}>
                                    <CardContent className="py-2 px-4 flex items-center gap-3">
                                        <Clock className={`w-5 h-5 ${timer.isVeryLowTime ? 'text-red-400' :
                                            timer.isLowTime ? 'text-yellow-400' :
                                                'text-[#ffff00]'
                                            }`} />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-[#f0ff00]/60">Time Left</span>
                                            <Badge className={`text-lg font-mono ${timer.isVeryLowTime
                                                ? 'bg-red-900 text-red-200 border-red-700'
                                                : timer.isLowTime
                                                    ? 'bg-yellow-900 text-yellow-200 border-yellow-700'
                                                    : 'bg-[#ffff00]/20 text-[#ffff00] border-[#ffff00]/40'
                                                }`}>
                                                {timer.formattedTime}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mb-6 mt-20">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-sm font-medium text-[#f0ff00]">
                                        Question {currentQuestion + 1} of {QUESTIONS.length}
                                    </h2>
                                    <span className="text-sm text-[#f0ff00]/60">
                                        Score: {score}/{QUESTIONS.length}
                                    </span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <Card className="border-[#ffff00]/30 bg-[#ffff00]/5 backdrop-blur-xl mb-6">
                                <CardHeader>
                                    <CardTitle className="text-[#ffff00] text-xl">
                                        {question.question}
                                    </CardTitle>
                                    <CardDescription className="text-[#f0ff00]">
                                        Select one answer
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <RadioGroup
                                        value={selectedAnswer?.toString()}
                                        onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                                        disabled={isQuestionAnswered}
                                    >
                                        <div className="space-y-3">
                                            {question.options.map((option, index) => {
                                                const isCorrectAnswer = index === question.correctAnswer
                                                const isUserAnswer = index === userAnswer
                                                const showAsCorrect = isQuestionAnswered && isCorrectAnswer
                                                const showAsIncorrect = isQuestionAnswered && isUserAnswer && !isCorrect

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${showAsCorrect
                                                            ? "border-green-500 bg-green-500/20"
                                                            : showAsIncorrect
                                                                ? "border-red-500 bg-red-500/20"
                                                                : selectedAnswer === index
                                                                    ? "border-[#ffff00] bg-[#ffff00]/10"
                                                                    : "border-[#ffff00]/20 hover:border-[#ffff00]/40"
                                                            } ${isQuestionAnswered ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                                                        onClick={() => !isQuestionAnswered && handleAnswerSelect(index)}
                                                    >
                                                        <RadioGroupItem
                                                            value={index.toString()}
                                                            id={`option-${index}`}
                                                            disabled={isQuestionAnswered}
                                                        />
                                                        <Label
                                                            htmlFor={`option-${index}`}
                                                            className={`flex-1 cursor-pointer font-normal ${showAsCorrect ? "text-green-400 font-semibold" :
                                                                showAsIncorrect ? "text-red-400 font-semibold" :
                                                                    "text-[#f0ff00]"
                                                                }`}
                                                        >
                                                            {option}
                                                            {showAsCorrect && " ✓"}
                                                            {showAsIncorrect && " ✗"}
                                                        </Label>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </RadioGroup>
                                </CardContent>

                                <CardFooter className="flex justify-end gap-4">
                                    {!isQuestionAnswered ? (
                                        <Button
                                            onClick={handleSubmitAnswer}
                                            disabled={selectedAnswer === null}
                                            className="bg-gradient-to-r from-[#ffff00] to-[#f0ff00] text-black font-bold hover:from-[#f0ff00] hover:to-[#ccff00]"
                                        >
                                            Submit Answer
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNextQuestion}
                                            className="bg-gradient-to-r from-[#ffff00] to-[#f0ff00] text-black font-bold hover:from-[#f0ff00] hover:to-[#ccff00]"
                                        >
                                            {currentQuestion === QUESTIONS.length - 1 ? "Finish Quiz" : "Next Question →"}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>

                            {showFeedback && (
                                <Card className={`border-2 ${isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"} backdrop-blur-xl mb-6`}>
                                    <CardHeader>
                                        <CardTitle className={`flex items-center gap-2 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                                            {isCorrect ? (
                                                <>
                                                    <CheckCircle className="h-6 w-6" />
                                                    Correct!
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-6 w-6" />
                                                    Incorrect
                                                </>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-[#f0ff00]">
                                            <p className="font-semibold mb-2">Explanation:</p>
                                            <p>{question.explanation}</p>
                                        </div>
                                        <Link
                                            href={question.resourceLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => isOpeningExternalLinkRef.current = true}
                                            className="inline-flex items-center gap-2 text-[#ffff00] hover:text-[#ccff00] underline"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            {question.resourceTitle}
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </main>

            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent className="bg-black border-[#ffff00]/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#ffff00]">
                            ⚠️ Academic Integrity Violation
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#f0ff00] whitespace-pre-line">
                            {warningMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => setShowWarning(false)}
                            className="bg-gradient-to-r from-[#ffff00] to-[#f0ff00] text-black font-bold"
                        >
                            I Understand
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
