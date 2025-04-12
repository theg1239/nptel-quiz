"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Award } from "lucide-react";

export default function QuizResultsPage({ params }: { params: Promise<{ course_code: string; quiz_type: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const courseCode = unwrappedParams.course_code;
  const quizType = unwrappedParams.quiz_type;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  useEffect(() => {
    const fetchedScore = parseInt(searchParams.get("score") || "0", 10);
    const fetchedTotal = parseInt(searchParams.get("total") || "0", 10);

    if (fetchedTotal > 0) {
      setScore(fetchedScore);
      setTotalQuestions(fetchedTotal);

      updateProgressInLocalStorage(fetchedScore, fetchedTotal);
    }
  }, [searchParams]);

  const updateProgressInLocalStorage = (quizScore: number, totalQuizQuestions: number) => {
    const storedProgress = JSON.parse(localStorage.getItem("quizProgress") || "{}");
    const completedQuestions = storedProgress[courseCode]?.completedQuestions || [];

    if (quizScore === totalQuizQuestions) {
      const newQuestions = Array(totalQuizQuestions).fill(true); 
      storedProgress[courseCode] = {
        completedQuestions: newQuestions,
      };

      localStorage.setItem("quizProgress", JSON.stringify(storedProgress));
    }
  };

  const handleRetake = () => {
    router.push(`/courses/${courseCode}/quiz/${quizType}`);
  };

  if (score === null || totalQuestions === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <p className="text-blue-300">Loading quiz results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm text-center w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-blue-300">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent>
          <Award className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
          <p className="text-2xl font-bold text-gray-200">Your Score: {score}/{totalQuestions}</p>
          <Progress value={(score / totalQuestions) * 100} className="mt-4" />
        </CardContent>
        <CardFooter>
          <Button onClick={handleRetake} className="w-full bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
