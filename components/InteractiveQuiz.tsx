'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Zap, Clock, Shield, Award, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/Button"
import { Progress } from "@/components/ui/Progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"
import { QuizType } from '@/types/quiz'

interface Question {
  question: string
  options: string[]
  answer: string[]
}

interface InteractiveQuizProps {
  quizType: QuizType
  courseName: string
  questions: Question[]
  courseCode: string;
  onExit?: () => void
}

interface PowerUpType {
  type: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  name: string
  active: boolean
}

function cleanQuestionText(question: string): string {
  return question.replace(/^\s*\d+[\).:\-]\s*/, '')
}

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5)
}

const PowerUp = ({ icon: Icon, name, active, onClick }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>, name: string, active: boolean, onClick: () => void }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`p-2 rounded-full ${active ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'} transition-colors duration-300`}
          disabled={!active}
          aria-label={`Use ${name} power-up`}
        >
          <Icon className="h-6 w-6 text-white" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const QuizTimer = ({ time, maxTime }: { time: number, maxTime: number }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
      style={{ width: `${(time / maxTime) * 100}%` }}
      role="progressbar"
      aria-valuenow={time}
      aria-valuemin={0}
      aria-valuemax={maxTime}
    ></div>
  </div>
)

function stripOptionLabels(options: string[]): { cleanOptions: string[]; labels: string[] } {
  const regex = /^Option\s([A-Z]):\s*/; // Pattern to match labels like "Option A:", "Option B:", etc.
  const cleanOptions = options.map((option) => option.replace(regex, ''));
  const labels = options.map((option) => (option.match(regex) ? option.match(regex)![1] : ''));
  return { cleanOptions, labels };
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
  selectedOptions,
  isAnswerLocked,
}: {
  question: string;
  options: string[];
  onAnswer: (newSelectedOptions: number[]) => void;
  timeLeft: number;
  maxTime: number;
  lives: number;
  powerUps: PowerUpType[];
  onUsePowerUp: (type: string) => void;
  quizType: string;
  currentScore: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  selectedOptions: number[];
  isAnswerLocked: boolean;
}) => {
  const displayOptions = options;

  return (
    <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-2 border-blue-500 shadow-lg">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-2xl font-bold text-blue-300">
          {cleanQuestionText(question)}
        </CardTitle>
        <div className="text-blue-300 font-semibold">
          Score: {currentScore} / {totalQuestions}
        </div>
      </CardHeader>
      {(quizType === 'timed' || quizType === 'quick') && (
        <QuizTimer time={timeLeft} maxTime={maxTime} />
      )}
      <div className="flex justify-between items-center mt-2 px-6">
      {(quizType === 'quick' || quizType === 'practice') && (
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
        {quizType === 'practice' && (
          <div className="flex items-center space-x-1">
            {[...Array(lives)].map((_, i) => (
              <Heart key={i} className="h-5 w-5 text-red-500 fill-current" />
            ))}
          </div>
        )}
      </div>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 mt-4">
          {displayOptions.map((option, index) => (
            <Button
              key={index}
              onClick={() => {
                if (!isAnswerLocked) {
                  const newSelectedOptions = selectedOptions.includes(index)
                    ? selectedOptions.filter((i) => i !== index)
                    : [...selectedOptions, index];
                  onAnswer(newSelectedOptions);
                }
              }}
              variant={selectedOptions.includes(index) ? "outline" : "default"} // Highlight selected with outline
              className={`relative text-left transition-colors duration-300 p-4 h-auto ${
                selectedOptions.includes(index)
                  ? 'ring-2 ring-white'
                  : 'bg-gray-800 text-gray-200 hover:bg-blue-700 hover:text-white'
              } ${
                isAnswerLocked ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={isAnswerLocked}
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
        {(quizType === 'timed' || quizType === 'quick') && (
          <div className="text-sm text-gray-400">Time left: {timeLeft}s</div>
        )}
      </CardFooter>
    </Card>
  );
};

const Quiz = ({
  quizType = "practice",
  onExit,
  questions,
  quizTime,
  courseName,
  courseCode,
}: {
  quizType: "practice" | "timed" | "quick" | "progress"
  onExit: () => void
  questions: Question[]
  quizTime: number
  courseName: string
  courseCode: string
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(quizType === 'timed' || quizType === 'quick' ? quizTime * 60 : 0)
  const [powerUps, setPowerUps] = useState<PowerUpType[]>([])
  const [quizEnded, setQuizEnded] = useState(false)
  const [availableOptions, setAvailableOptions] = useState<number[]>([0, 1, 2, 3])
  const [feedback, setFeedback] = useState<{
    correct: boolean
    selectedIndexes: number[]
  } | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [userAnswers, setUserAnswers] = useState<
    { selectedOptions: number[], correct: boolean, locked: boolean }[]
  >(questions.map(() => ({ selectedOptions: [], correct: false, locked: false })))

  useEffect(() => {
    if (quizType === "quick" || quizType === "practice") {
      setPowerUps([
        { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
        { type: "extraTime", icon: Clock, name: "Extra Time", active: true },
        { type: "shield", icon: Shield, name: "Shield", active: true },
      ])
    } else {
      setPowerUps([])
    }
  }, [quizType])

  useEffect(() => {
    if (
      (quizType === "timed" || quizType === "quick") &&
      timeLeft > 0 &&
      !quizEnded
    ) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizEnded && (quizType === "timed" || quizType === "quick")) {
      endQuiz();
    }
  }, [timeLeft, quizEnded, quizType]);

  useEffect(() => {
    if (quizType === "timed" || quizType === "quick") {
      setTimeLeft(quizTime * 60);
    }
  }, [quizType, quizTime]);

const endQuiz = useCallback(() => {
  setQuizEnded(true);
  let incorrectQuestions: string[] = [];
  try {
    const storedProgress = JSON.parse(localStorage.getItem("quizProgress") || "{}");
    incorrectQuestions = questions
      .filter((_, idx) => !userAnswers[idx]?.correct)
      .map((q) => q.question);
    storedProgress[quizType] = {
      incorrectQuestions,
    };
    localStorage.setItem("quizProgress", JSON.stringify(storedProgress));
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }

  try {
    const totalQuestions = questions.length;
    const answeredQuestions = userAnswers.filter(ans => ans.selectedOptions.length > 0).length;
    const completionPercentage = Math.floor((answeredQuestions / totalQuestions) * 100);
    const courseProgress = JSON.parse(localStorage.getItem("courseProgress") || "{}");
    courseProgress[courseName] = completionPercentage;
    localStorage.setItem("courseProgress", JSON.stringify(courseProgress));
  } catch (error) {
    console.error("Error updating course completion:", error);
  }
}, [questions, userAnswers, quizType, courseName]);

const goToNextQuestion = useCallback(() => {
  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedOptions(userAnswers[currentQuestionIndex + 1]?.selectedOptions || []);
    setAvailableOptions([0, 1, 2, 3]);
    setFeedback(null);
  } else {
    endQuiz();
  }
}, [currentQuestionIndex, questions.length, userAnswers, endQuiz]);

const handleAnswer = useCallback((newSelectedOptions: number[]) => {
  setSelectedOptions(newSelectedOptions);
  setUserAnswers((prev) => {
    const newAnswers = [...prev];
    newAnswers[currentQuestionIndex] = { selectedOptions: newSelectedOptions, correct: false, locked: false };
    return newAnswers;
  });
}, [currentQuestionIndex]);

const saveAnswers = useCallback(() => {
  const currentQuestion = questions[currentQuestionIndex];
  const correctIndexes = currentQuestion.answer.map((ans) =>
    currentQuestion.options.findIndex((opt) => opt.includes(ans))
  );

  const isCorrect =
    selectedOptions.length === correctIndexes.length &&
    selectedOptions.every((idx) => correctIndexes.includes(idx));

  if (isCorrect) {
    setScore((prev) => prev + 1);
  } else if (quizType === "practice") {
    setLives((prev) => prev - 1);
    if (lives - 1 === 0) {
      endQuiz();
      return;
    }
  }

  setUserAnswers((prev) => {
    const newAnswers = [...prev];
    newAnswers[currentQuestionIndex] = { selectedOptions, correct: isCorrect, locked: false };
    return newAnswers;
  });

  if (quizType === "practice") {
    setFeedback({ correct: isCorrect, selectedIndexes: selectedOptions });
  }

  setTimeout(() => {
    if (isCorrect || quizType !== "practice") {
      if (currentQuestionIndex < questions.length - 1) {
        goToNextQuestion();
      } else {
        endQuiz();
      }
    }
  }, 1500);
}, [questions, currentQuestionIndex, selectedOptions, quizType, lives, endQuiz, goToNextQuestion]);

  const restartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setLives(3)
    setTimeLeft(quizType === 'timed' || quizType === 'quick' ? quizTime * 60 : 0)
    setPowerUps((prev) => prev.map((p) => ({ ...p, active: true })))
    setQuizEnded(false)
    setAvailableOptions([0, 1, 2, 3])
    setFeedback(null)
    setSelectedOptions([])
    setUserAnswers(questions.map(() => ({ selectedOptions: [], correct: false, locked: false })))
  }, [quizTime, questions, quizType])

  const usePowerUp = useCallback((type: string) => {
    if (type === "fiftyFifty") {
      const currentQuestion = questions[currentQuestionIndex];
      const correctIndexes = currentQuestion.answer.map((ans) =>
        currentQuestion.options.findIndex((opt) => opt.includes(ans))
      );
  
      let incorrectOptions = availableOptions.filter(idx => !correctIndexes.includes(idx));
  
      if (availableOptions.length <= 3) {
        setAvailableOptions(correctIndexes);
      } else {
        const optionsToRemove = incorrectOptions.slice(0, Math.min(2, incorrectOptions.length));
        setAvailableOptions(prev => prev.filter(idx => !optionsToRemove.includes(idx)));
      }
    } else if (type === "extraTime") {
      setTimeLeft(prev => prev + 30);
    } else if (type === "shield") {
      setLives(prev => prev + 1);
    }
  
    setPowerUps(prev => prev.map(p => (p.type === type ? { ...p, active: false } : p)));
  }, [currentQuestionIndex, questions, availableOptions]);  

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setSelectedOptions(userAnswers[currentQuestionIndex - 1]?.selectedOptions || [])
      setAvailableOptions([0, 1, 2, 3])
      setFeedback(null)
    }
  }

  const [quizSettings, setQuizSettings] = useState<{ questionCount: number; quizTime: number }>({
    questionCount: 10,
    quizTime: 5,
  })

  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('quizSettings') || '{}')
    if (storedSettings.questionCount) {
      setQuizSettings((prev) => ({ ...prev, questionCount: storedSettings.questionCount }))
    }
    if (storedSettings.quizTime) {
      setQuizSettings((prev) => ({ ...prev, quizTime: storedSettings.quizTime }))
    }
  }, [])

  function initializeQuestionsWithFixedOrder(questions: Question[]): Question[] {
    return questions.map((q) => {
      const { cleanOptions, labels } = stripOptionLabels(q.options);
      const labeledOptions = labels.map((label, index) => `${label}. ${cleanOptions[index]}`);
      return {
        ...q,
        options: labeledOptions,
      };
    });
  }
  
  const sanitizedQuestions = initializeQuestionsWithFixedOrder(
    questions.filter(
      (q) =>
        q.question &&
        q.options &&
        q.options.length >= 2 &&
        q.answer &&
        q.answer.length > 0
    )
  );

  let questionCount = quizSettings.questionCount
  const quizTimeValue = quizSettings.quizTime

  if (quizType === "practice") {
    questionCount = sanitizedQuestions.length;
  } else {
    questionCount = Math.min(questionCount, sanitizedQuestions.length);
  }

  const displayedQuestions = useMemo(() => {
    return quizType === "practice" || quizType === "progress" 
      ? questions
      : shuffleArray(questions).slice(0, questionCount)
  }, [questions, quizType, questionCount])

  if (quizEnded) {
    return (
      <ResultScreen
        score={score}
        totalQuestions={questions.length}
        onRestart={restartQuiz}
        courseCode={courseCode}
      />
    )
  }

  const currentQuestion = displayedQuestions[currentQuestionIndex];
  const isAnswerLocked = userAnswers[currentQuestionIndex]?.locked;
  
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
        {currentQuestion ? ( // Only render if currentQuestion exists
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{
              duration: 0.3, // Increase duration for a slower transition
              ease: [0.42, 0, 0.58, 1], // Use an ease-in-out curve for smoothness
            }}
            >
            <QuizContent
              question={currentQuestion.question}
              options={currentQuestion.options.filter((_, idx) =>
                availableOptions.includes(idx)
              )}
              onAnswer={handleAnswer}
              timeLeft={timeLeft}
              maxTime={quizTimeValue * 60}
              lives={lives}
              powerUps={powerUps}
              onUsePowerUp={usePowerUp}
              quizType={quizType}
              currentScore={score}
              totalQuestions={questions.length}
              currentQuestionIndex={currentQuestionIndex}
              selectedOptions={selectedOptions}
              isAnswerLocked={isAnswerLocked}
            />
            <div className="flex justify-between mt-6">
              <Button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-gray-600 hover:bg-gray-700 transition-colors duration-300"
              >
                Previous
              </Button>
              <Button
                onClick={saveAnswers}
                disabled={isAnswerLocked || selectedOptions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
              >
                Save Answers
              </Button>
              <Button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="bg-gray-600 hover:bg-gray-700 transition-colors duration-300"
              >
                Next
              </Button>
            </div>
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
        ) : null} {/* Skip rendering if currentQuestion is undefined */}
      </AnimatePresence>
    </div>
  );  
}

const ResultScreen = ({
  score,
  totalQuestions,
  onRestart,
  courseCode, 
}: {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  courseCode: string; 
}) => {
  const router = useRouter();

  const handleBackToPortal = () => {
    router.push(`/courses/${courseCode}`); 
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-sm text-center border-2 border-blue-500 shadow-lg relative">
      <button
        onClick={handleBackToPortal}
        className="absolute top-4 left-4 text-blue-300 hover:bg-blue-900 p-2 rounded-full transition-colors duration-300"
        aria-label="Back to Course Portal"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

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
};

export default function InteractiveQuiz({
  quizType,
  courseName,
  onExit,
  questions,
  courseCode,
}: InteractiveQuizProps & { courseCode: string }) {
  const router = useRouter();
  const handleExit = onExit || (() => router.back());

  const shuffledQuestions = useMemo(() => shuffleArray(questions), [questions]);

  const isValidQuizType =
    quizType === "practice" ||
    quizType === "timed" ||
    quizType === "quick" ||
    quizType === "progress";

  function initializeQuestionsWithFixedOrder(questions: Question[]): Question[] {
    return questions.map((q) => {
      const { cleanOptions, labels } = stripOptionLabels(q.options);
      const labeledOptions = labels.map((label, index) => `${label}. ${cleanOptions[index]}`);
      return {
        ...q,
        options: labeledOptions,
      };
    });
  }

  const sanitizedQuestions = initializeQuestionsWithFixedOrder(
    shuffledQuestions.filter(
      (q) =>
        q.question &&
        q.options &&
        q.options.length >= 2 &&
        q.answer &&
        q.answer.length > 0
    )
  );

  const [quizSettings, setQuizSettings] = useState<{ questionCount: number; quizTime: number }>({
    questionCount: 10,
    quizTime: 5,
  });

  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('quizSettings') || '{}');
    if (storedSettings.questionCount) {
      setQuizSettings((prev) => ({ ...prev, questionCount: storedSettings.questionCount }));
    }
    if (storedSettings.quizTime) {
      setQuizSettings((prev) => ({ ...prev, quizTime: storedSettings.quizTime }));
    }
  }, []);

  let questionCount = quizSettings.questionCount;
  const quizTimeValue = quizSettings.quizTime;

  if (quizType === "practice") {
    questionCount = sanitizedQuestions.length;
  } else {
    questionCount = Math.min(questionCount, sanitizedQuestions.length);
  }

  const displayedQuestions = useMemo(() => {
    return quizType === "practice" || quizType === "progress" 
      ? sanitizedQuestions
      : sanitizedQuestions.slice(0, questionCount);
  }, [sanitizedQuestions, quizType, questionCount]);

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
              questions={quizType === "progress" ? displayedQuestions : displayedQuestions}
              quizTime={quizTimeValue}
              courseName={courseName}
              courseCode={courseCode}
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