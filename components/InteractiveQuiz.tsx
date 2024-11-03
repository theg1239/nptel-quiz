"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Zap,
  Clock,
  Shield,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { QuizType } from "@/types/quiz";

interface Question {
  question: string;
  options: string[];
  answer: string[];
}

interface InteractiveQuizProps {
  quizType: QuizType;
  courseName: string;
  questions: Question[];
  onExit?: () => void;
}

interface PowerUpType {
  type: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  active: boolean;
}

const PowerUp = ({
  icon: Icon,
  name,
  active,
  onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  active: boolean;
  onClick: () => void;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`p-2 rounded-full ${
            active ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 cursor-not-allowed"
          } transition-colors duration-300`}
          disabled={!active}
        >
          <Icon className="h-6 w-6 text-white" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const QuizTimer = ({ time, maxTime }: { time: number; maxTime: number }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
      style={{ width: `${(time / maxTime) * 100}%` }}
    ></div>
  </div>
);

function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

const QuizContent = ({
  question,
  options,
  onAnswer,
  timeLeft,
  maxTime,
  lives,
  powerUps,
  onUsePowerUp,
  quizType,
  currentScore,
  totalQuestions,
  currentQuestionIndex,
}: {
  question: string;
  options: string[];
  onAnswer: (selectedIndex: number) => void;
  timeLeft: number;
  maxTime: number;
  lives: number;
  powerUps: PowerUpType[];
  onUsePowerUp: (type: string) => void;
  quizType: string;
  currentScore: number;
  totalQuestions: number;
  currentQuestionIndex: number;
}) => (
  <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-2 border-blue-500 shadow-lg">
    <CardHeader className="flex justify-between items-center">
      <CardTitle className="text-2xl font-bold text-blue-300">
        {question}
      </CardTitle>
      <div className="text-blue-300 font-semibold">
        Score: {currentScore} / {totalQuestions}
      </div>
    </CardHeader>
    {quizType === "timed" && <QuizTimer time={timeLeft} maxTime={maxTime} />}
    <div className="flex justify-between items-center mt-2 px-6">
      {quizType === "practice" && (
        <div className="flex space-x-2">
          {powerUps.map((powerUp, index) => (
            <PowerUp
              key={index}
              icon={powerUp.icon}
              name={powerUp.name}
              active={powerUp.active}
              onClick={() => onUsePowerUp(powerUp.type)}
            />
          ))}
        </div>
      )}
      {quizType === "practice" && (
        <div className="flex items-center space-x-1">
          {[...Array(lives)].map((_, i) => (
            <Heart key={i} className="h-5 w-5 text-red-500 fill-current" />
          ))}
        </div>
      )}
    </div>
    <CardContent>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {options.map((option, index) => (
          <Button
            key={index}
            onClick={() => onAnswer(index)}
            variant="outline"
            className="relative text-left text-gray-200 hover:bg-blue-700 hover:text-white transition-colors duration-300 p-4 h-auto"
          >
            {option}
          </Button>
        ))}
      </div>
    </CardContent>
    <CardFooter className="justify-between">
      <div className="text-sm text-gray-400">
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </div>
      {quizType === "timed" && (
        <div className="text-sm text-gray-400">Time left: {timeLeft}s</div>
      )}
    </CardFooter>
  </Card>
);

const Quiz = ({
  quizType = "practice",
  onExit,
  questions,
  quizTime,
}: {
  quizType: "practice" | "timed" | "quick" | "progress";
  onExit: () => void;
  questions: Question[];
  quizTime: number;
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(quizTime * 60); 
  const [powerUps, setPowerUps] = useState<PowerUpType[]>([
    { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
    { type: "extraTime", icon: Clock, name: "Extra Time", active: true },
    { type: "shield", icon: Shield, name: "Shield", active: true },
  ]);
  const [quizEnded, setQuizEnded] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<number[]>([0, 1, 2, 3]);
  const [feedback, setFeedback] = useState<{ correct: boolean; selectedIndex: number } | null>(
    null
  );

  useEffect(() => {
    if ((quizType === "timed" || quizType === "quick" || quizType === "progress") && timeLeft > 0 && !quizEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizEnded) {
      endQuiz();
    }
  }, [timeLeft, quizEnded, quizType]);

  const handleAnswer = (selectedIndex: number) => {
    if (feedback) return;
    const currentQuestion = questions[currentQuestionIndex];
    const correctIndex = currentQuestion.options.findIndex(
      (opt) => opt === currentQuestion.answer[0]
    );
    const isCorrect = selectedIndex === correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else if (quizType === "practice") {
      setLives((prev) => prev - 1);
      if (lives - 1 === 0) {
        endQuiz();
        return;
      }
    }

    setFeedback({ correct: isCorrect, selectedIndex });

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        if (quizType !== "practice") setTimeLeft(timeLeft);
        setAvailableOptions([0, 1, 2, 3]);
        setFeedback(null);
      } else {
        endQuiz();
      }
    }, 1500);
  };

  const endQuiz = () => {
    setQuizEnded(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(quizTime * 60);
    setPowerUps((prev) => prev.map((p) => ({ ...p, active: true })));
    setQuizEnded(false);
    setAvailableOptions([0, 1, 2, 3]);
    setFeedback(null);
  };

  const usePowerUp = (type: string) => {
    switch (type) {
      case "fiftyFifty":
        const currentQuestion = questions[currentQuestionIndex];
        const correctIndex = currentQuestion.options.findIndex(
          (opt) => opt === currentQuestion.answer[0]
        );
        let incorrectOptions = availableOptions.filter((idx) => idx !== correctIndex);
        if (incorrectOptions.length > 1) {
          const shuffled = shuffleArray(incorrectOptions);
          const optionsToRemove = shuffled.slice(0, 2);
          setAvailableOptions((prev) => prev.filter((idx) => !optionsToRemove.includes(idx)));
        }
        break;
      case "extraTime":
        setTimeLeft((prev) => prev + 30); 
        break;
      case "shield":
        setLives((prev) => prev + 1);
        break;
      default:
        break;
    }
    setPowerUps((prev) =>
      prev.map((p) => (p.type === type ? { ...p, active: false } : p))
    );
  };

  if (quizEnded) {
    return (
      <ResultScreen
        score={score}
        totalQuestions={questions.length}
        onRestart={restartQuiz}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={onExit}
          variant="ghost"
          className="text-blue-300 hover:bg-blue-900 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
        </Button>
        <div className="text-blue-300 font-semibold">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <QuizContent
            question={currentQuestion.question}
            options={currentQuestion.options.filter((_, idx) =>
              availableOptions.includes(idx)
            )}
            onAnswer={handleAnswer}
            timeLeft={timeLeft}
            maxTime={quizTime * 60}
            lives={lives}
            powerUps={powerUps}
            onUsePowerUp={usePowerUp}
            quizType={quizType}
            currentScore={score}
            totalQuestions={questions.length}
            currentQuestionIndex={currentQuestionIndex}
          />
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 text-lg font-semibold ${
                  feedback.correct ? "text-green-500" : "text-red-500"
                }`}
              >
                {feedback.correct ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Correct!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-6 w-6" />
                    <span>Incorrect!</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ResultScreen = ({
  score,
  totalQuestions,
  onRestart,
}: {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}) => (
  <Card className="w-full max-w-md mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-sm text-center border-2 border-blue-500 shadow-lg">
    <CardHeader>
      <CardTitle className="text-3xl font-bold text-blue-300">
        Quiz Completed!
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Award className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
      <p className="text-2xl font-bold text-gray-200">
        Your Score: {score}/{totalQuestions}
      </p>
      <Progress value={(score / totalQuestions) * 100} className="mt-4" />
      <p className="mt-4 text-gray-300">
        {score === totalQuestions
          ? "Perfect score! Excellent work!"
          : score >= totalQuestions * 0.8
          ? "Great job! You're doing well!"
          : score >= totalQuestions * 0.6
          ? "Good effort! Keep practicing!"
          : "Don't give up! Try again to improve your score."}
      </p>
    </CardContent>
    <CardFooter>
      <Button
        onClick={onRestart}
        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
      >
        Try Again
      </Button>
    </CardFooter>
  </Card>
);

export default function InteractiveQuiz({
  quizType,
  courseName,
  onExit,
  questions,
}: InteractiveQuizProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleExit = onExit || (() => router.back());

  const isValidQuizType =
    quizType === "practice" ||
    quizType === "timed" ||
    quizType === "quick" ||
    quizType === "progress";

  const questionCount = parseInt(searchParams.get("questions") || "10", 10);
  const quizTime = parseInt(searchParams.get("time") || "5", 10);

  const sanitizedQuestions = questions
    .filter(
      (q) =>
        q.question &&
        q.options &&
        q.options.length >= 2 &&
        q.answer &&
        q.answer.length > 0
    )
    .map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));

  const randomizedQuestions = shuffleArray(sanitizedQuestions).slice(
    0,
    questionCount
  );

  const storedProgress = JSON.parse(localStorage.getItem("quizProgress") || "{}");
  const incorrectQuestions = storedProgress[courseName]?.incorrectQuestions || [];

  const progressTestQuestions =
    quizType === "progress"
      ? randomizedQuestions.filter((q) => incorrectQuestions.includes(q.question))
      : randomizedQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-blue-500 rounded-full opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          {courseName} - {quizType.charAt(0).toUpperCase() + quizType.slice(1)} Quiz
        </h1>
        <AnimatePresence mode="wait">
          {isValidQuizType ? (
            <Quiz
              quizType={quizType as "practice" | "timed" | "quick" | "progress"}
              onExit={handleExit}
              questions={progressTestQuestions}
              quizTime={quizTime}
            />
          ) : (
            <div className="text-center text-red-500 bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-lg">
              Invalid Quiz Type. Please select a valid quiz type.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
