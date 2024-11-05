// components/InteractiveQuiz.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Zap,
  Clock,
  Shield,
  Award,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle as XCircleIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { InteractiveQuizProps, ProcessedQuestion } from '@/types/quiz';

type QuizType = 'timed' | 'quick' | 'practice' | 'progress';

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  handleRestart: () => void;
  handleFinishQuiz: () => void;
  courseCode: string;
  userAnswers: UserAnswer[];
  questions: ProcessedQuestion[];
}

interface PowerUpType {
  type: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  active: boolean;
}

interface UserAnswer {
  selectedOptions: number[];
  correct: boolean;
  locked: boolean;
  timeSpent: number;
}

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const defaultUserAnswer = (): UserAnswer => ({
  selectedOptions: [],
  correct: false,
  locked: false,
  timeSpent: 0,
});

const defaultPowerUps = (quizType: QuizType): PowerUpType[] => {
  switch (quizType) {
    case 'timed':
    case 'quick':
      return [
        { type: 'fiftyFifty', icon: Zap, name: '50/50', active: true },
        { type: 'extraTime', icon: Clock, name: 'Extra Time', active: true },
        { type: 'shield', icon: Shield, name: 'Shield', active: true },
      ];
    case 'practice':
      return [
        { type: 'fiftyFifty', icon: Zap, name: '50/50', active: true },
        { type: 'shield', icon: Shield, name: 'Shield', active: true },
      ];
    case 'progress':
      return [];
    default:
      return [];
  }
};

const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white rounded-full opacity-10"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 4 + 1}px`,
          height: `${Math.random() * 4 + 1}px`,
        }}
        animate={{
          y: [0, Math.random() * 100 - 50],
          x: [0, Math.random() * 100 - 50],
        }}
        transition={{
          duration: Math.random() * 10 + 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    ))}
  </div>
);

const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number | string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-indigo-200">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  </motion.div>
);

const cleanQuestionText = (question: string): string => {
  return question.replace(/^\s*\d+[\).]\s*/, '');
};

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
            active ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'
          } transition-colors duration-300`}
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
);

const QuizTimer = ({ time, maxTime }: { time: number; maxTime: number }) => (
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
);

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
  shake,
}: {
  question: string;
  options: string[];
  onAnswer: (newSelectedOptions: number[]) => void;
  timeLeft: number;
  maxTime: number;
  lives: number;
  powerUps: PowerUpType[];
  onUsePowerUp: (type: string) => void;
  quizType: QuizType;
  currentScore: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  selectedOptions: number[];
  isAnswerLocked: boolean;
  shake: boolean;
}) => (
  <motion.div
    animate={shake ? 'shake' : 'rest'}
    variants={{
      shake: {
        x: [0, -15, 15, -15, 15, 0],
        transition: { duration: 0.6 },
      },
      rest: { x: 0 },
    }}
  >
    <Card className="w-full bg-gray-800 bg-opacity-50 backdrop-blur-sm border-2 border-blue-500 shadow-lg">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl font-bold text-blue-300">
          {cleanQuestionText(question)}
        </CardTitle>
        <div className="text-blue-300 font-semibold">
          Score: {currentScore} / {totalQuestions}
        </div>
      </CardHeader>
      {typeof timeLeft === 'number' && <QuizTimer time={timeLeft} maxTime={maxTime} />}
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          {(quizType === 'quick' || quizType === 'practice' || quizType === 'progress') && (
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
          {(quizType === 'practice' || quizType === 'progress') && (
            <div className="flex items-center space-x-1">
              {[...Array(lives)].map((_, i) => (
                <Heart key={i} className="h-5 w-5 text-red-500 fill-current" />
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {options.map((option, index) => {
            const isSelected = selectedOptions.includes(index);
            return (
              <Button
                key={index}
                onClick={() => {
                  if (quizType === 'practice' || !isAnswerLocked) {
                    const newSelectedOptions = isSelected
                      ? selectedOptions.filter((i) => i !== index)
                      : [...selectedOptions, index];
                    onAnswer(newSelectedOptions);
                  }
                }}
                variant="outline"
                className={`justify-start text-left h-auto py-3 px-4 border ${
                  isSelected ? 'border-blue-500' : 'border-transparent'
                } ${
                  isSelected
                    ? 'bg-blue-500 bg-opacity-20 text-blue-300'
                    : 'hover:shadow-outline-blue'
                } ${quizType !== 'practice' && isAnswerLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={quizType !== 'practice' && isAnswerLocked}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
        {(quizType === 'timed' || quizType === 'quick') && (
          <div className="text-sm text-gray-400">Time left: {timeLeft}s</div>
        )}
      </CardFooter>
    </Card>
  </motion.div>
);

const ResultScreen = ({
  score,
  totalQuestions,
  handleRestart,
  handleFinishQuiz,
  courseCode,
  userAnswers,
  questions,
}: ResultScreenProps) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleBackToPortal = () => {
    router.push(`/courses/${courseCode}`);
  };

  const progressValue = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const navigateQuestion = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentQuestionIndex - 1 : currentQuestionIndex + 1;
    if (newIndex >= 0 && newIndex < totalQuestions) {
      setCurrentQuestionIndex(newIndex);
    }
  };

  const getScoreMessage = () => {
    if (score === totalQuestions) return 'Perfect score! Excellent work!';
    if (score >= totalQuestions * 0.8) return "Great job! You're doing well!";
    if (score >= totalQuestions * 0.6) return 'Good effort! Keep practicing!';
    return "Don't give up! Try again to improve your score.";
  };

  const totalTimeSpent = userAnswers.reduce((total, answer) => total + answer.timeSpent, 0);
  const averageTimePerQuestion = totalQuestions > 0 ? totalTimeSpent / totalQuestions : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-7xl mx-auto px-4 py-6 h-screen flex flex-col"
    >
      <header className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          className="text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          onClick={handleBackToPortal}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200"
        >
          Quiz Results
        </motion.h1>
        <div className="flex space-x-2">
          <Button onClick={handleRestart} variant="outline" className="text-indigo-200 border-indigo-200 hover:bg-white/10">
            Try Again
          </Button>
          <Button
            onClick={handleFinishQuiz}
            variant="outline"
            className="text-indigo-200 border-indigo-200 hover:bg-white/10"
          >
            Finish Quiz
          </Button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div className="lg:w-1/3 space-y-4">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-indigo-200">Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
                  className="text-4xl font-bold text-center mb-2 text-white"
                >
                  {Math.round(progressValue)}%
                </motion.div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Progress value={progressValue} className="h-2 mb-2" />
                </motion.div>
                <p className="text-sm text-indigo-100 text-center">{getScoreMessage()}</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={<Award className="h-4 w-4 text-yellow-300" />} title="Score" value={`${score}/${totalQuestions}`} />
            <StatCard icon={<CheckCircle2 className="h-4 w-4 text-green-300" />} title="Accuracy" value={`${Math.round((score / totalQuestions) * 100)}%`} />
            <StatCard icon={<XCircleIcon className="h-4 w-4 text-red-300" />} title="Incorrect" value={totalQuestions - score} />
            <StatCard icon={<Clock className="h-4 w-4 text-blue-300" />} title="Avg. Time" value={`${Math.round(averageTimePerQuestion)}s`} />
          </div>
        </div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:w-2/3"
        >
          <Tabs defaultValue="review" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-1 bg-white/5 text-indigo-200 mb-2">
              <TabsTrigger value="review" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Question Review
              </TabsTrigger>
            </TabsList>
            <TabsContent value="review" className="flex-grow overflow-hidden">
              <Card className="bg-white/5 backdrop-blur-sm border-white/20 h-full flex flex-col">
                <CardContent className="p-4 flex-grow overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <Button
                      variant="outline"
                      onClick={() => navigateQuestion('prev')}
                      disabled={currentQuestionIndex <= 0}
                      className="text-indigo-200 border-indigo-200 hover:bg-white/10 disabled:opacity-50"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm font-semibold text-indigo-200">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => navigateQuestion('next')}
                      disabled={currentQuestionIndex >= totalQuestions - 1}
                      className="text-indigo-200 border-indigo-200 hover:bg-white/10 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="h-full pr-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h3 className="text-lg font-semibold mb-2 text-white">
                          {cleanQuestionText(questions[currentQuestionIndex].question)}
                        </h3>
                        <ul className="space-y-2">
                          {questions[currentQuestionIndex].shuffledOptions!.map((option, optionIndex) => {
                            const isCorrect = questions[currentQuestionIndex].answerIndices!.includes(optionIndex);
                            const isSelected = userAnswers[currentQuestionIndex]?.selectedOptions.includes(optionIndex) ?? false;

                            return (
                              <motion.li
                                key={optionIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: optionIndex * 0.1 }}
                                className={`p-2 rounded-md transition-colors ${
                                  isCorrect
                                    ? 'bg-green-800/30 border border-green-500/50 text-green-200'
                                    : isSelected
                                    ? 'bg-red-800/30 border border-red-500/50 text-red-200'
                                    : 'bg-white/5 border border-white/10 text-indigo-100'
                                }`}
                              >
                                <div className="flex items-center">
                                  {isCorrect && <CheckCircle2 className="mr-2 h-4 w-4 text-green-300 flex-shrink-0" />}
                                  {isSelected && !isCorrect && <XCircleIcon className="mr-2 h-4 w-4 text-red-300 flex-shrink-0" />}
                                  <span className="text-sm">{option}</span>
                                </div>
                              </motion.li>
                            );
                          })}
                        </ul>
                        <div className="mt-2 text-xs text-indigo-200">
                          Time spent: {userAnswers[currentQuestionIndex]?.timeSpent ?? 0} seconds
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </motion.div>
  );
};

const Quiz = ({
  quizType,
  onExit,
  questions,
  quizTime = 300,
  courseName,
  courseCode,
  numQuestions,
}: {
  quizType: QuizType;
  onExit: () => void;
  questions: ProcessedQuestion[];
  quizTime?: number;
  courseName: string;
  courseCode: string;
  numQuestions?: number;
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quizType === 'timed' || quizType === 'quick' ? quizTime : null
  );
  const [powerUps, setPowerUpsState] = useState<PowerUpType[]>(defaultPowerUps(quizType));
  const [quizEnded, setQuizEnded] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<number[]>([0, 1, 2, 3]);
  const [feedback, setFeedback] = useState<{ correct: boolean; selectedIndexes: number[] } | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(questions.map(() => defaultUserAnswer()));
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [restartTrigger, setRestartTrigger] = useState(false);
  const [shake, setShake] = useState(false);

  const router = useRouter();

  const endQuiz = useCallback(() => {
    setQuizEnded(true);
    let incorrectQuestions: string[] = [];

    try {
      const storedProgress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
      incorrectQuestions = questions
        .filter((_, idx) => !userAnswers[idx]?.correct)
        .map((q) => cleanQuestionText(q.question));

      if (quizType === 'progress') {
        const existingIncorrect = storedProgress[courseCode]?.incorrectQuestions || [];
        const mergedIncorrect = Array.from(new Set([...existingIncorrect, ...incorrectQuestions]));
        storedProgress[courseCode] = { incorrectQuestions: mergedIncorrect };
        localStorage.setItem('quizProgress', JSON.stringify(storedProgress));
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [questions, userAnswers, courseCode, quizType]);

  const handleFinishQuiz = useCallback(() => {
    endQuiz();
    router.push(`/courses/${courseCode}`);
  }, [endQuiz, router, courseCode]);

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(quizType === 'timed' || quizType === 'quick' ? quizTime : null);
    setPowerUpsState(defaultPowerUps(quizType));
    setQuizEnded(false);
    setAvailableOptions([0, 1, 2, 3]);
    setFeedback(null);
    setSelectedOptions([]);
    setUserAnswers(questions.map(() => defaultUserAnswer()));
    setIsAnswerLocked(false);
    setRestartTrigger((prev) => !prev);

    if (quizType === 'progress') {
      try {
        const storedProgress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
        delete storedProgress[courseCode];
        localStorage.setItem('quizProgress', JSON.stringify(storedProgress));
      } catch (error) {
        console.error('Error resetting quiz progress:', error);
      }
    }
  }, [quizTime, questions, quizType, courseCode]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptions(userAnswers[currentQuestionIndex + 1]?.selectedOptions || []);
      setAvailableOptions([0, 1, 2, 3]);
      setFeedback(null);
    } else {
      endQuiz();
    }
  }, [currentQuestionIndex, questions.length, endQuiz, userAnswers]);

  const handleAnswer = useCallback((newSelectedOptions: number[]) => {
    if (quizType === 'practice' || !isAnswerLocked) {
      setSelectedOptions(newSelectedOptions);
    }
  }, [quizType, isAnswerLocked]);

  const saveAnswers = useCallback(() => {
    if (selectedOptions.length === 0) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (isAnswerLocked && quizType !== 'practice') return;

    const currentQuestion = questions[currentQuestionIndex];
    const correctIndices = currentQuestion.answerIndices?.slice().sort((a, b) => a - b) || [];
    const selectedIndices = selectedOptions.slice().sort((a, b) => a - b);

    const isCorrect =
      selectedIndices.length === correctIndices.length &&
      selectedIndices.every((val, index) => val === correctIndices[index]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else if (quizType === 'practice' || quizType === 'progress') {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives === 0) {
          endQuiz();
        }
        return newLives;
      });
    }

    const currentTime = Date.now();
    const timeSpent = Math.floor((currentTime - questionStartTime) / 1000);

    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = {
        selectedOptions,
        correct: isCorrect,
        locked: quizType !== 'practice',
        timeSpent: timeSpent,
      };
      return newAnswers;
    });

    if (quizType === 'practice' || quizType === 'progress') {
      setFeedback({ correct: isCorrect, selectedIndexes: selectedOptions });
    }

    setIsAnswerLocked(quizType !== 'practice');

    setTimeout(() => {
      if (isCorrect || (quizType !== 'practice' && quizType !== 'progress')) {
        goToNextQuestion();
      } else {
        setIsAnswerLocked(false);
      }
    }, 1500);
  }, [
    questions,
    currentQuestionIndex,
    selectedOptions,
    quizType,
    lives,
    endQuiz,
    goToNextQuestion,
    questionStartTime,
    isAnswerLocked,
  ]);

  const usePowerUp = useCallback(
    (type: string) => {
      if (!powerUps.some((p) => p.type === type && p.active)) return;

      if (type === 'fiftyFifty') {
        const currentQuestion = questions[currentQuestionIndex];
        const correctIndices = currentQuestion.answerIndices?.slice().sort((a, b) => a - b) || [];

        let incorrectOptions = availableOptions.filter((idx) => !correctIndices.includes(idx));

        // Ensure at least one correct option remains
        if (incorrectOptions.length === 0) return;

        const optionsToRemove = shuffleArray(incorrectOptions).slice(0, Math.min(2, incorrectOptions.length));
        setAvailableOptions((prev) => prev.filter((idx) => !optionsToRemove.includes(idx)));
      } else if (type === 'extraTime') {
        setTimeLeft((prev) => (typeof prev === 'number' ? prev + 30 : 30));
      } else if (type === 'shield') {
        setLives((prev) => prev + 1);
      }

      setPowerUpsState((prev) => prev.map((p) => (p.type === type ? { ...p, active: false } : p)));
    },
    [powerUps, questions, currentQuestionIndex, availableOptions]
  );

  useEffect(() => {
    if ((quizType === 'timed' || quizType === 'quick') && typeof timeLeft === 'number' && timeLeft > 0 && !quizEnded) {
      const timer = setTimeout(() => setTimeLeft((prev) => (typeof prev === 'number' ? prev - 1 : prev)), 1000);
      return () => clearTimeout(timer);
    } else if (typeof timeLeft === 'number' && timeLeft <= 0 && !quizEnded) {
      endQuiz();
    }
  }, [timeLeft, quizEnded, quizType, endQuiz]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    const previousAnswer = userAnswers[currentQuestionIndex];
    setSelectedOptions(previousAnswer.selectedOptions);
    setAvailableOptions([0, 1, 2, 3]);
    setFeedback(null);
    setIsAnswerLocked(userAnswers[currentQuestionIndex]?.locked || false);
  }, [currentQuestionIndex, restartTrigger, userAnswers]);

  if (quizEnded) {
    return (
      <ResultScreen
        score={score}
        totalQuestions={questions.length}
        handleRestart={handleRestart}
        handleFinishQuiz={handleFinishQuiz}
        courseCode={courseCode}
        userAnswers={userAnswers}
        questions={questions}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={onExit}
          variant="ghost"
          className="text-blue-300 hover:bg-blue-900 transition-colors duration-300 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
        </Button>
        {/* Removed the "Finish Quiz" button from the Quiz component */}
      </div>
      <AnimatePresence mode="wait">
        {currentQuestionIndex < questions.length && (
          <motion.div
            key={`quiz-${quizType}-${quizTime ?? 'default'}-${numQuestions ?? 'default'}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex flex-col"
          >
            <QuizContent
              question={questions[currentQuestionIndex].question}
              options={availableOptions.map(idx => questions[currentQuestionIndex].shuffledOptions![idx])}
              onAnswer={handleAnswer}
              timeLeft={timeLeft ?? 0}
              maxTime={quizTime}
              lives={lives}
              powerUps={powerUps}
              onUsePowerUp={usePowerUp}
              quizType={quizType}
              currentScore={score}
              totalQuestions={questions.length}
              currentQuestionIndex={currentQuestionIndex}
              selectedOptions={selectedOptions}
              isAnswerLocked={isAnswerLocked}
              shake={shake}
            />
            <div className="flex justify-between mt-4">
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button onClick={saveAnswers}>
                Save Answer
              </Button>
              <Button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                variant="outline"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-4 text-lg font-semibold ${
              feedback.correct ? 'text-green-500' : 'text-red-500'
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
    </div>
  );
};

export default function InteractiveQuiz({
  quizType,
  courseName,
  onExit,
  questions,
  courseCode,
  quizTime = 300,
  numQuestions,
}: InteractiveQuizProps) {
  const router = useRouter();
  const handleExit = useCallback(() => {
    router.push(`/courses/${courseCode}`);
  }, [router, courseCode]);

  const selectedQuestions: ProcessedQuestion[] = useMemo(() => {
    let selected: ProcessedQuestion[] = [];

    switch (quizType) {
      case 'progress':
        try {
          const storedProgress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
          const incorrectQuestions = storedProgress[courseCode]?.incorrectQuestions || [];
          if (incorrectQuestions.length === 0) {
            alert('You have no incorrect questions to review!');
            return [];
          }

          selected = questions.filter((q) => incorrectQuestions.includes(cleanQuestionText(q.question)));
          if (selected.length === 0) {
            alert('No matching incorrect questions found.');
            return [];
          }

          selected = numQuestions
            ? shuffleArray(selected).slice(0, Math.min(numQuestions, selected.length))
            : selected;

        } catch (error) {
          console.error('Error loading progress from localStorage:', error);
          alert('Failed to load progress.');
          return [];
        }
        break;

      case 'quick':
        selected = shuffleArray(questions).slice(0, numQuestions ? Math.min(numQuestions, questions.length) : 10);
        break;

      case 'timed':
        selected = shuffleArray(questions).slice(
          0,
          numQuestions ? Math.min(numQuestions, questions.length) : questions.length
        );
        break;

      case 'practice':
        selected = numQuestions ? shuffleArray(questions).slice(0, Math.min(numQuestions, questions.length)) : questions;
        break;

      default:
        selected = questions;
        break;
    }

    selected = selected.map((question) => {
      const strippedOptions = question.options.map(opt => opt.replace(/^Option [A-D]:\s*/, ''));
      const answerLetters = question.answer;
      const correctOptionTexts = answerLetters.map(letter => {
        const index = letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
        return strippedOptions[index];
      });
      const shuffled = shuffleArray(strippedOptions);
      const answerIndices = correctOptionTexts.map(text => shuffled.indexOf(text)).filter(idx => idx !== -1);

      return {
        ...question,
        shuffledOptions: shuffled,
        answerIndices: answerIndices,
      };
    });

    return selected;
  }, [quizType, numQuestions, questions, courseCode]);

  if (quizType === 'progress' && selectedQuestions.length === 0) {
    return null;
  }

  if (selectedQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-white">No questions available.</div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-6 lg:p-12">
      <ParticleBackground />
      <div className="w-full max-w-screen-xl mx-auto h-full flex flex-col">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
        >
          {courseName} Quiz
        </motion.h1>
        <AnimatePresence mode="wait">
          <Quiz
            key={`quiz-${quizType}-${quizTime ?? 'default'}-${numQuestions ?? 'default'}`}
            quizType={quizType}
            onExit={handleExit}
            questions={selectedQuestions}
            quizTime={quizType === 'timed' ? quizTime : quizType === 'quick' ? 300 : quizTime}
            courseName={courseName}
            courseCode={courseCode}
            numQuestions={numQuestions}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}