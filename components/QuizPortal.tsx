"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Clock, Zap, BarChart, Award, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import QuizOption from "@/components/QuizOption";

interface Course {
  title: string;
  request_count: string;
  weeks: {
    name: string;
    questions: {
      question: string;
      options: string[];
      answer: string[];
    }[];
  }[];
}

interface QuizPortalProps {
  course: Course;
  course_code: string;
}

const VALID_QUIZ_TYPES = ["practice", "timed", "quick", "progress"];

const QuizPortal = ({ course, course_code }: QuizPortalProps) => {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [quizTime, setQuizTime] = useState<number>(30);

  const totalQuestions = course.weeks.reduce(
    (acc, week) => acc + week.questions.length,
    0
  );

  useEffect(() => {
    calculateProgress();
  }, [course_code]);

  const calculateProgress = () => {
    const storedProgress = JSON.parse(localStorage.getItem("quizProgress") || "{}");
    const completedQuestions = storedProgress[course_code]?.completedQuestions || [];
    const totalQuestions = course.weeks.reduce(
      (acc, week) => acc + week.questions.length,
      0
    );

    const progressPercentage = Math.min(
      Math.round((completedQuestions.length / totalQuestions) * 100),
      100
    );

    setProgress(progressPercentage);
  };

  const handleStartQuiz = () => {
    if (!VALID_QUIZ_TYPES.includes(selectedQuiz || "")) {
      console.error("Invalid quiz type selected.");
      return;
    }

    let finalQuestionCount = questionCount;
    let finalQuizTime = quizTime;

    if (selectedQuiz === "quick") {
      finalQuestionCount = 10;
      finalQuizTime = 5; 
    } else if (selectedQuiz === "practice") {
      finalQuestionCount = totalQuestions;
      finalQuizTime = 0; 
    } else if (selectedQuiz === "progress") {
      finalQuestionCount = Math.min(20, totalQuestions); 
      finalQuizTime = finalQuestionCount * 1; 
    }

    const quizPath = `/courses/${course_code}/quiz/${selectedQuiz}?questions=${finalQuestionCount}&time=${finalQuizTime}`;
    router.push(quizPath);
  };

  const quizOptions = [
    {
      icon: Book,
      title: "Practice Quiz",
      description: "Unlimited time, all questions at your own pace",
      onClick: () => setSelectedQuiz("practice"),
    },
    {
      icon: Clock,
      title: "Timed Quiz",
      description: "Set your own time and question count",
      onClick: () => setSelectedQuiz("timed"),
    },
    {
      icon: Zap,
      title: "Quick Review",
      description: "Quick 10-question quiz with limited time",
      onClick: () => setSelectedQuiz("quick"),
    },
    {
      icon: BarChart,
      title: "Progress Test",
      description: "Focus on areas needing improvement",
      onClick: () => setSelectedQuiz("progress"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl z-10"
      >
        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          {course.title}
        </h1>
        <p className="text-xl text-center mb-8 text-blue-300">
          Interactive Learning Portal
        </p>

        <Card className="mb-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-300">
              <Award className="h-6 w-6 text-yellow-500" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2 text-gray-300">
              <span>Course Completion</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {!selectedQuiz ? (
            <motion.div
              key="quiz-options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                Choose Your Quiz Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizOptions.map((option, index) => (
                  <QuizOption key={index} {...option} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selected-quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                {selectedQuiz === "practice" && "Practice Quiz"}
                {selectedQuiz === "timed" && "Timed Quiz"}
                {selectedQuiz === "quick" && "Quick Review"}
                {selectedQuiz === "progress" && "Progress Test"}
              </h2>
              <p className="mb-4 text-gray-300">
                {selectedQuiz === "practice" &&
                  "All questions with unlimited time."}
                {selectedQuiz === "timed" &&
                  `Set your preferred quiz time and number of questions.`}
                {selectedQuiz === "quick" &&
                  "Quick 10-question quiz with 5-minute limit."}
                {selectedQuiz === "progress" &&
                  "Focus on questions you've previously missed."}
              </p>
              {selectedQuiz === "timed" && (
                <div className="mb-4">
                  <label className="text-gray-300 block mb-2">
                    Number of Questions (1 - {totalQuestions}):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={totalQuestions}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full p-2 rounded bg-gray-700 text-white mb-4"
                  />
                  <label className="text-gray-300 block mb-2">
                    Time Limit (minutes):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quizTime}
                    onChange={(e) => setQuizTime(Number(e.target.value))}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                  />
                </div>
              )}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuiz(null)}
                  className="bg-transparent border-blue-500 text-blue-300 hover:bg-blue-900"
                >
                  Back to Options
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 flex items-center"
                  onClick={handleStartQuiz}
                >
                  Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default QuizPortal;
