'use client'

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useCallback, useMemo, Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
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
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import {
  setCurrentQuestionIndex,
  setIsAnswerLocked,
  setScore,
  setLives,
  setTimeLeft,
  decrementTimeLeft,
  setPowerUps,
  setQuizEnded,
  setAvailableOptions,
  setFeedback,
  setSelectedOptions,
  addUserAnswer,
  setShake,
  resetQuiz,
} from './slices/quizSlice';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, Transition } from '@headlessui/react';
import { InteractiveQuizProps, ProcessedQuestion } from '@/types/quiz';

// Define PowerUpType interface
interface PowerUpType {
  type: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active: boolean;
}

// Define UserAnswer interface
interface UserAnswer {
  selectedOptions: number[];
  correct: boolean;
  locked: boolean;
  timeSpent: number;
}

// Define ResultScreenProps interface
interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  handleRestart: () => void;
  handleFinishQuiz: () => void;
  courseCode: string;
  userAnswers: UserAnswer[];
  questions: ProcessedQuestion[];
}

// Shuffle function
const shuffleArray = <T,>(array: T[]): T[] => {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

type QuizType = 'timed' | 'quick' | 'practice' | 'progress';

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

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, message, onClose }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const QuizTimer = ({ maxTime }: { maxTime: number }) => {
  const searchParams = useSearchParams();
  const initialTimeLeft = parseInt(searchParams.get('quizTime') || '0', 10);
  
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  useEffect(() => {
    // Countdown effect
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
        style={{ width: `${(timeLeft / maxTime) * 100}%` }}
        role="progressbar"
        aria-valuenow={timeLeft}
        aria-valuemin={0}
        aria-valuemax={maxTime}
      ></div>
      <p>Time left: {timeLeft}s</p>
    </div>
  );
};

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
            active
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
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
          {question}
        </CardTitle>
        <div className="text-blue-300 font-semibold">
          Score: {currentScore} / {totalQuestions}
        </div>
      </CardHeader>
      {(quizType === 'timed' || quizType === 'quick') && <QuizTimer maxTime={maxTime} />}
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

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
                          {questions[currentQuestionIndex].question}
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
  questions,
  quizTime = null,
  courseName,
  courseCode,
  numQuestions = null,
  isModalOpen,
  modalContent,
  handleCloseModal,
}: {
  quizType: QuizType;
  questions: ProcessedQuestion[];
  quizTime?: number | null;
  courseName: string;
  courseCode: string;
  numQuestions?: number | null;
  isModalOpen: boolean;
  modalContent: { title: string; message: string };
  handleCloseModal: () => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const {
    currentQuestionIndex,
    score,
    lives,
    timeLeft, 
    powerUps,
    quizEnded,
    availableOptions,
    feedback,
    selectedOptions,
    userAnswers,
    shake,
  } = useSelector((state: RootState) => state.quiz);

  useEffect(() => {
    dispatch(setTimeLeft(quizTime));
  }, [dispatch, quizTime]);

  const endQuiz = useCallback(() => {
    dispatch(setQuizEnded(true));
    let incorrectQuestions: string[] = [];

    try {
      const storedProgress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
      incorrectQuestions = questions
        .filter((_, idx) => !userAnswers[idx]?.correct)
        .map((q) => q.question);

      if (quizType === 'progress') {
        const existingIncorrect = storedProgress[courseCode]?.incorrectQuestions || [];
        const mergedIncorrect = Array.from(new Set([...existingIncorrect, ...incorrectQuestions]));
        storedProgress[courseCode] = { incorrectQuestions: mergedIncorrect };
        localStorage.setItem('quizProgress', JSON.stringify(storedProgress));
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [dispatch, questions, userAnswers, courseCode, quizType]);

  useEffect(() => {
    if (
      (quizType === 'timed' || quizType === 'quick') &&
      timeLeft !== null &&
      timeLeft > 0 &&
      !quizEnded
    ) {
      const timer = setInterval(() => {
        dispatch(decrementTimeLeft());
      }, 1000);
  
      return () => clearInterval(timer);
    } else if (timeLeft !== null && timeLeft <= 0 && !quizEnded) {
      endQuiz();
    }
  }, [dispatch, timeLeft, quizEnded, quizType, endQuiz]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1));
      const nextAnswer = userAnswers[currentQuestionIndex + 1] || {
        selectedOptions: [],
        correct: false,
        locked: false,
        timeSpent: 0,
      };
      dispatch(setSelectedOptions(nextAnswer.selectedOptions));
      dispatch(setAvailableOptions([0, 1, 2, 3]));
      dispatch(setFeedback(null));
      dispatch(setIsAnswerLocked(nextAnswer.locked));
    } else {
      endQuiz();
    }
  }, [dispatch, currentQuestionIndex, questions.length, userAnswers, endQuiz]);

  const handleAnswer = useCallback(
    (newSelectedOptions: number[]) => {
      dispatch(setSelectedOptions(newSelectedOptions));
    },
    [dispatch]
  );

  const saveAnswers = useCallback(() => {
    if (selectedOptions.length === 0) {
      dispatch(setShake(true));
      setTimeout(() => dispatch(setShake(false)), 600);
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const correctIndices = currentQuestion.answerIndices?.slice().sort((a, b) => a - b) || [];
    const selectedIndices = selectedOptions.slice().sort((a, b) => a - b);

    const isCorrect =
      selectedIndices.length === correctIndices.length &&
      selectedIndices.every((val, index) => val === correctIndices[index]);

    if (isCorrect) {
      dispatch(setScore(score + 1));
    } else if (quizType === 'practice' || quizType === 'progress') {
      dispatch(setLives(lives - 1));
      if (lives - 1 === 0) {
        endQuiz();
      }
    }

    const timeSpent = userAnswers[currentQuestionIndex]?.timeSpent ?? 0; // Implement time tracking as needed

    dispatch(
      addUserAnswer({
        selectedOptions,
        correct: isCorrect,
        locked: quizType !== 'practice',
        timeSpent,
      })
    );

    if (quizType === 'practice' || quizType === 'progress') {
      dispatch(setFeedback({ correct: isCorrect, selectedIndexes: selectedOptions }));
    }

    if (quizType !== 'practice') {
      dispatch(setIsAnswerLocked(true));
    }

    setTimeout(() => {
      if (isCorrect || (quizType !== 'practice' && quizType !== 'progress')) {
        goToNextQuestion();
      } else {
        dispatch(setIsAnswerLocked(false));
      }
    }, 1500);
  }, [
    dispatch,
    selectedOptions,
    quizType,
    score,
    lives,
    currentQuestionIndex,
    questions,
    endQuiz,
    goToNextQuestion,
    userAnswers,
  ]);

  const usePowerUp = useCallback(
    (type: string) => {
      if (!powerUps.some((p) => p.type === type && p.active)) return;
  
      if (type === 'extraTime') {
        if (timeLeft !== null) {
          dispatch(setTimeLeft(timeLeft + 30));
          dispatch(setPowerUps(powerUps.map((p) => (p.type === type ? { ...p, active: false } : p))));
        } else {
          console.warn('Cannot use extra time power-up when there is no timer.');
        }
      } else if (type === 'shield') {
        dispatch(setLives(lives + 1));
        dispatch(setPowerUps(powerUps.map((p) => (p.type === type ? { ...p, active: false } : p))));
      }
    },
    [dispatch, powerUps, timeLeft, lives]
  );

  useEffect(() => {
    if ((quizType === 'timed' || quizType === 'quick') && quizTime !== null) {
      dispatch(setTimeLeft(quizTime));
    } else {
      dispatch(setTimeLeft(null)); // Set timeLeft to null for other quiz types
    }
  }, [dispatch, quizTime, quizType]);

  const isCurrentQuestionLocked = useMemo(() => {
    return userAnswers[currentQuestionIndex]?.locked || false;
  }, [userAnswers, currentQuestionIndex]);

  const handleExit = () => {
    router.push(`/courses/${courseCode}`);
  };

  const handleRestart = () => {
    dispatch(resetQuiz());
    // Additional logic if needed
  };

  const handleFinishQuiz = () => {
    router.push(`/courses/${courseCode}`);
  };

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
          onClick={handleExit}
          variant="ghost"
          className="text-blue-300 hover:bg-blue-900 transition-colors duration-300 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
        </Button>
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
              maxTime={quizTime ?? 0}
              lives={lives}
              powerUps={powerUps}
              onUsePowerUp={usePowerUp}
              quizType={quizType}
              currentScore={score}
              totalQuestions={questions.length}
              currentQuestionIndex={currentQuestionIndex}
              selectedOptions={selectedOptions}
              isAnswerLocked={isCurrentQuestionLocked}
              shake={shake}
            />
            <div className="flex justify-between mt-4">
              <Button
                onClick={() => dispatch(setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1)))}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button onClick={saveAnswers}>
                Save Answer
              </Button>
              <Button
                onClick={() => dispatch(setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1)))}
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
      <Modal 
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default function InteractiveQuiz({
  quizType,
  courseName,
  questions,
  courseCode,
  quizTime = null,
  numQuestions = null,
}: InteractiveQuizProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  useEffect(() => {
    dispatch(resetQuiz());
  }, [dispatch]);

  const selectedQuestions: ProcessedQuestion[] = useMemo(() => {
    const totalQuestions = numQuestions ?? questions.length;
    return shuffleArray(questions).slice(0, totalQuestions).map((question) => {
      const strippedOptions = question.options.map((opt) => opt.replace(/^Option [A-D]:\s*/, ''));
      const correctOptionTexts = question.answer.map((letter) => strippedOptions[letter.charCodeAt(0) - 65]);
      const shuffled = shuffleArray(strippedOptions);
      const answerIndices = correctOptionTexts.map((text) => shuffled.indexOf(text)).filter((idx) => idx !== -1);
      return { ...question, shuffledOptions: shuffled, answerIndices };
    });
  }, [numQuestions, questions]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRestart = () => {
    dispatch(resetQuiz());
    // Additional logic if needed
  };

  const handleFinishQuiz = () => {
    router.push(`/courses/${courseCode}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-6 lg:p-12">
      <ParticleBackground />
      <div className="w-full max-w-screen-xl mx-auto">
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
            questions={selectedQuestions}
            quizTime={quizTime}
            courseName={courseName}
            courseCode={courseCode}
            numQuestions={numQuestions}
            isModalOpen={isModalOpen}
            modalContent={modalContent}
            handleCloseModal={handleCloseModal}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}