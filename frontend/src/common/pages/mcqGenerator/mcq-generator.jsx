"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVoiceAssistance } from "@/hooks/useVoiceAssistance";

const MCQGeneratorPage = () => {
    const [chapterName, setChapterName] = useState('');
    const [mcqs, setMcqs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { speak, speaking } = useVoiceAssistance();

    const handleGenerateMCQs = async () => {
        if (!chapterName.trim()) {
            setError("Please enter a chapter name");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/mcq/generatemcq/`,
                { chapter_name: chapterName },
                { 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))?.access}`
                    } 
                }
            );

            // Directly use the answer_key from the response
            setMcqs(response.data.answer_key);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to generate MCQs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionHover = (text) => {
        if (!speaking) {
            speak(text);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-200 via-sky-200 to-blue-200 p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        MCQ Generator
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            <Input 
                                value={chapterName}
                                onChange={(e) => setChapterName(e.target.value)}
                                placeholder="Enter chapter name"
                                className="flex-grow"
                                aria-label="Enter chapter name to generate MCQs"
                            />
                            <Button 
                                onClick={handleGenerateMCQs}
                                disabled={loading}
                                aria-label={loading ? 'Generating MCQs...' : 'Generate MCQs'}
                            >
                                {loading ? 'Generating...' : 'Generate MCQs'}
                            </Button>
                        </div>

                        {error && (
                            <div 
                                className="text-red-500 text-sm text-center"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {mcqs.length > 0 && (
                            <div className="space-y-4">
                                {mcqs.map((mcq, questionIndex) => (
                                    <Card 
                                        key={questionIndex} 
                                        className="border-2 border-gray-200 hover:border-blue-300 transition-colors"
                                    >
                                        <CardContent className="p-4">
                                            <div 
                                                className="mb-2 font-semibold text-lg"
                                                onMouseEnter={() => handleQuestionHover(mcq.question)}
                                                aria-label="Hover to hear question"
                                            >
                                                Question {mcq.question_number}: {mcq.question}
                                            </div>
                                            <div 
                                                role="radiogroup" 
                                                aria-labelledby={`question-${questionIndex}`}
                                                className="space-y-2"
                                            >
                                                {mcq.options.map((option, optionIndex) => (
                                                    <div 
                                                        key={optionIndex} 
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <input 
                                                            type="radio" 
                                                            id={`q${questionIndex}-option${optionIndex}`}
                                                            name={`question-${questionIndex}`}
                                                            value={option}
                                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                                        />
                                                        <label 
                                                            htmlFor={`q${questionIndex}-option${optionIndex}`}
                                                            className="ml-2 block text-sm text-gray-700"
                                                            onMouseEnter={() => handleQuestionHover(option)}
                                                        >
                                                            {option}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Hidden correct answer for tracking purposes */}
                                            <input 
                                                type="hidden" 
                                                name={`correct-answer-${questionIndex}`} 
                                                value={mcq.correct_answer_option} 
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MCQGeneratorPage;
