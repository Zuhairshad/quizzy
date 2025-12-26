"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createQuiz } from "@/lib/quiz-actions"
import { quizSchema, type QuizFormData } from "@/lib/quiz-schema"

export default function AssessmentsPage() {
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<QuizFormData>({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            title: "",
            description: "",
            duration_minutes: undefined,
            passing_score: undefined,
            questions: [
                {
                    question_text: "",
                    options: ["", "", "", ""],
                    correct_option_index: 0,
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions",
    })

    async function onSubmit(values: QuizFormData) {
        setIsLoading(true)
        try {
            const result = await createQuiz(values)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message || "Assessment created successfully!")
                form.reset()
                // Reset to one empty question
                form.setValue("questions", [
                    {
                        question_text: "",
                        options: ["", "", "", ""],
                        correct_option_index: 0,
                    },
                ])
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to create assessment")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Assessment</h2>
                <p className="text-muted-foreground">
                    Add a new quiz/assessment that will be available to users
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Details</CardTitle>
                            <CardDescription>Basic information about the assessment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., React Fundamentals Quiz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what this assessment covers..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="duration_minutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (minutes) - Optional</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 30"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="passing_score"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passing Score (%) - Optional</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 70"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Questions</CardTitle>
                                    <CardDescription>Add questions for this assessment</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            question_text: "",
                                            options: ["", "", "", ""],
                                            correct_option_index: 0,
                                        })
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Question
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {fields.map((field, questionIndex) => (
                                <Card key={field.id} className="border-2">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(questionIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name={`questions.${questionIndex}.question_text`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question Text</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter the question..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="space-y-2">
                                            <FormLabel>Options</FormLabel>
                                            {[0, 1, 2, 3].map((optionIndex) => (
                                                <FormField
                                                    key={optionIndex}
                                                    control={form.control}
                                                    name={`questions.${questionIndex}.options.${optionIndex}`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        placeholder={`Option ${optionIndex + 1}`}
                                                                        {...field}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`questions.${questionIndex}.correct_option_index`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <input
                                                                                        type="radio"
                                                                                        checked={field.value === optionIndex}
                                                                                        onChange={() => field.onChange(optionIndex)}
                                                                                        className="h-4 w-4"
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <span className="text-sm text-muted-foreground">Correct</span>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                        >
                            Reset
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Assessment
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

