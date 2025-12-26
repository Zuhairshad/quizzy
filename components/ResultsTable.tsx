'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ExportCSV } from '@/components/ExportCSV'
import { Search, TrendingUp, Users, Target, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface Question {
    id: string
    question_text: string
    options: string[]
    correct_option_index: number
}

interface SubmissionWithDetails {
    id: string
    user_id: string
    quiz_id: string
    score: number
    total_questions: number
    completed_at: string
    user_name: string
    user_email: string
    quiz_title: string
    answers: Record<string, number>
    questions?: Question[]
}

interface ResultsTableProps {
    submissions: SubmissionWithDetails[]
    questions: Record<string, Question[]>
}

export default function ResultsTable({ submissions, questions }: ResultsTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null)

    // Filter submissions by search term
    const filteredSubmissions = submissions.filter((sub) =>
        sub.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getScoreBadgeColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-950 text-green-300 border-green-800'
        if (percentage >= 50) return 'bg-primary/20 text-primary border-primary/50'
        return 'bg-red-950 text-red-300 border-red-800'
    }

    const handleRowClick = (submission: SubmissionWithDetails) => {
        // Attach questions to the submission
        const submissionWithQuestions = {
            ...submission,
            questions: questions[submission.quiz_id] || [],
        }
        setSelectedSubmission(submissionWithQuestions)
    }

    return (
        <div className="space-y-6">
            {/* Search and Export */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by intern name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                </div>
                <ExportCSV submissions={filteredSubmissions} />
            </div>

            {/* Results Table */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">All Submissions</CardTitle>
                    <CardDescription className="text-slate-400">
                        {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-700 hover:bg-slate-700/30">
                                    <TableHead className="text-slate-300">Intern Name</TableHead>
                                    <TableHead className="text-slate-300">Quiz Title</TableHead>
                                    <TableHead className="text-slate-300 text-center">Score</TableHead>
                                    <TableHead className="text-slate-300">Date Completed</TableHead>
                                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions.length > 0 ? (
                                    filteredSubmissions.map((submission) => {
                                        const percentage = Math.round((submission.score / submission.total_questions) * 100)
                                        return (
                                            <TableRow
                                                key={submission.id}
                                                className="border-slate-700 hover:bg-slate-700/30 cursor-pointer transition-colors"
                                                onClick={() => handleRowClick(submission)}
                                            >
                                                <TableCell className="text-white font-medium">
                                                    <div>
                                                        <div>{submission.user_name}</div>
                                                        <div className="text-sm text-slate-400">{submission.user_email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300">{submission.quiz_title}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge className={getScoreBadgeColor(percentage)}>
                                                            {submission.score}/{submission.total_questions}
                                                        </Badge>
                                                        <span className="text-xs text-slate-400">{percentage}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    {new Date(submission.completed_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-slate-600 text-slate-200 hover:bg-slate-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRowClick(submission)
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                                            No submissions found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
                <SheetContent className="bg-slate-800 border-slate-700 sm:max-w-2xl overflow-y-auto">
                    {selectedSubmission && (
                        <>
                            <SheetHeader>
                                <SheetTitle className="text-white text-2xl">Submission Details</SheetTitle>
                                <SheetDescription className="text-slate-400">
                                    Review answers for {selectedSubmission.user_name}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Summary */}
                                <Card className="border-slate-700 bg-slate-700/30">
                                    <CardContent className="pt-6 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-slate-400 text-sm">Intern</p>
                                            <p className="text-white font-medium">{selectedSubmission.user_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">Quiz</p>
                                            <p className="text-white font-medium">{selectedSubmission.quiz_title}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">Score</p>
                                            <p className="text-white font-medium">
                                                {selectedSubmission.score}/{selectedSubmission.total_questions} (
                                                {Math.round((selectedSubmission.score / selectedSubmission.total_questions) * 100)}%)
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">Completed</p>
                                            <p className="text-white font-medium">
                                                {new Date(selectedSubmission.completed_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Separator className="bg-slate-700" />

                                {/* Questions */}
                                <div>
                                    <h3 className="text-white font-semibold mb-4">Question Breakdown</h3>
                                    <div className="space-y-4">
                                        {selectedSubmission.questions && selectedSubmission.questions.length > 0 ? (
                                            selectedSubmission.questions.map((question, index) => {
                                                const userAnswer = selectedSubmission.answers[question.id]
                                                const isCorrect = userAnswer === question.correct_option_index

                                                return (
                                                    <Card
                                                        key={question.id}
                                                        className={`border-2 ${isCorrect
                                                                ? 'border-green-800 bg-green-950/20'
                                                                : 'border-red-800 bg-red-950/20'
                                                            }`}
                                                    >
                                                        <CardHeader className="pb-3">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <CardTitle className="text-white text-sm">
                                                                    Question {index + 1}: {question.question_text}
                                                                </CardTitle>
                                                                {isCorrect ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                                                ) : (
                                                                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="space-y-2">
                                                            {question.options.map((option, optIndex) => {
                                                                const isUserAnswer = userAnswer === optIndex
                                                                const isCorrectAnswer = question.correct_option_index === optIndex

                                                                return (
                                                                    <div
                                                                        key={optIndex}
                                                                        className={`p-2 rounded text-sm ${isCorrectAnswer
                                                                                ? 'bg-green-900/30 border border-green-700 text-green-200'
                                                                                : isUserAnswer
                                                                                    ? 'bg-red-900/30 border border-red-700 text-red-200'
                                                                                    : 'text-slate-400'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            {isCorrectAnswer && (
                                                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                                            )}
                                                                            {isUserAnswer && !isCorrectAnswer && (
                                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                                            )}
                                                                            <span>{option}</span>
                                                                            {isCorrectAnswer && (
                                                                                <span className="ml-auto text-xs">(Correct)</span>
                                                                            )}
                                                                            {isUserAnswer && !isCorrectAnswer && (
                                                                                <span className="ml-auto text-xs">(User's Answer)</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })
                                        ) : (
                                            <p className="text-slate-400 text-center py-4">
                                                Question details not available
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
