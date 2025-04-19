'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { QuizType } from '@/types/quiz';
import { initializeQuestionsWithFixedOrder, Question } from '@/lib/quizUtils';

const cleanQuestionText = (question: string): string => question.replace(/^\s*\d+[\).:\-]\s*/, '');

const cleanOptionText = (optionText: string, questionText: string): string =>
  optionText.replace(questionText, '').trim();

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

interface InteractiveQuizProps {
  quizType: QuizType;
  courseName: string;
  questions: Question[];
  courseCode: string;
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
          className={`rounded-full p-2 transition-all duration-300 ${
            active
              ? 'bg-blue-600 shadow-lg shadow-blue-500/50 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-700 opacity-50'
          }`}
          disabled={!active}
          aria-label={`Use ${name} power-up`}
          type="button"
        >
          <Icon className={`h-6 w-6 ${active ? 'text-white' : 'text-gray-400'}`} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>
          {name} {!active && '(Used)'}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const QuizTimer = ({ time, maxTime }: { time: number; maxTime: number }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const percentage = (time / maxTime) * 100;

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-gray-300">Time Left:</span>
        <span className="font-medium text-blue-300">
          {minutes}m{seconds.toString().padStart(2, '0')}s
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-700">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.max(0, percentage)}%` }}
          role="progressbar"
          aria-valuenow={time}
          aria-valuemin={0}
          aria-valuemax={maxTime}
        />
      </div>
    </div>
  );
};

const QuizSettings = ({
  quizSettings,
  onSettingChange,
}: {
  quizSettings: {
    showFeedback: boolean;
    enablePowerUps: boolean;
    enableLives: boolean;
  };
  onSettingChange: (setting: 'showFeedback' | 'enablePowerUps' | 'enableLives') => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0 border-gray-700 hover:border-gray-600 hover:bg-gray-700"
        aria-label="Quiz Settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </PopoverTrigger>

    <PopoverContent
      className="w-64 space-y-2 rounded-lg border border-blue-500 p-2 shadow-lg animate-in fade-in-0 zoom-in-95"
      style={{
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
      }}
      sideOffset={5}
    >
      <div className="space-y-2">
        <Button
          onClick={() => onSettingChange('showFeedback')}
          variant={quizSettings.showFeedback ? 'default' : 'secondary'}
          size="sm"
          className={`w-full justify-start ${
            quizSettings.showFeedback
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          {quizSettings.showFeedback ? 'Hide' : 'Show'} Feedback
        </Button>

        <Button
          onClick={() => onSettingChange('enablePowerUps')}
          variant={quizSettings.enablePowerUps ? 'default' : 'secondary'}
          size="sm"
          className={`w-full justify-start ${
            quizSettings.enablePowerUps
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          {quizSettings.enablePowerUps ? 'Disable' : 'Enable'} Power‑ups
        </Button>

        <Button
          onClick={() => onSettingChange('enableLives')}
          variant={quizSettings.enableLives ? 'default' : 'secondary'}
          size="sm"
          className={`w-full justify-start ${
            quizSettings.enableLives
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          {quizSettings.enableLives ? 'Disable' : 'Enable'} Lives
        </Button>
      </div>
    </PopoverContent>
  </Popover>
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
  feedback,
  questions,
  quizSettings,
}: {
  question: string;
  options: { option_number: string; option_text: string }[];
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
  feedback: { correct: boolean; selectedIndexes: number[] } | null;
  questions: Question[];
  quizSettings: {
    enablePowerUps: boolean;
    enableLives: boolean;
    showFeedback: boolean;
  };
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const isTextQuestion = currentQuestion.content_type === 'text';
  const cleanedQuestion = cleanQuestionText(question);
  const weekName = quizType === 'weekly' ? (currentQuestion as any).week_name : null;

  const questionTextClass =
    cleanedQuestion.length > 100
      ? 'text-lg sm:text-xl'
      : cleanedQuestion.length > 50
        ? 'text-xl sm:text-2xl'
        : 'text-2xl sm:text-3xl';

  return (
    <ScrollArea className="custom-scrollbar mb-4 w-full flex-1 overflow-y-auto">
      <div className="p-1 md:p-2">
        <Card className="flex h-full flex-col border-2 border-blue-500 bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-sm">
          <CardHeader className="flex-shrink-0 px-4 py-3">
            {weekName && (
              <div className="mb-2">
                <span className="text-sm font-medium text-blue-400">{weekName}</span>
              </div>
            )}

            <div className="mb-2 flex items-center justify-between gap-2">
              <CardTitle
                className={`${questionTextClass} flex-1 break-words font-bold text-blue-300`}
              >
                {currentQuestionIndex + 1}. {cleanedQuestion}
              </CardTitle>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-blue-300 sm:text-base">
                  Score: {currentScore} / {totalQuestions}
                </div>
              </div>

              {(quizType === 'timed' || quizType === 'quick' || quizType === 'weekly') && (
                <div className="w-32 sm:w-40">
                  <QuizTimer time={timeLeft} maxTime={maxTime} />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="no-scrollbar flex-1 overflow-y-auto px-4 py-2">
            {isTextQuestion ? (
              <div className="space-y-4">
                <div className="custom-scrollbar max-h-[40vh] overflow-y-auto rounded-lg border-2 border-gray-600 bg-gray-700 bg-opacity-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-200 sm:text-base">
                    {currentQuestion.question_text}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {quizSettings?.enablePowerUps && (
                    <div className="flex flex-wrap gap-2">
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

                  {quizSettings.enableLives &&
                    (quizType === 'timed' || quizType === 'quick' || quizType === 'progress') && (
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <Heart
                            key={i}
                            className={`h-4 w-4 sm:h-6 sm:w-6 ${
                              i < lives ? 'fill-red-500 text-red-500' : 'text-red-500/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                </div>

                <div
                  className="grid min-h-[50vh] gap-2 sm:min-h-[40vh] sm:gap-3"
                  role="radiogroup"
                  aria-label="Quiz options"
                >
                  {options.map((option, index) => {
                    const isSelected = selectedOptions.includes(index);
                    const isCorrect = currentQuestion.answer.includes(
                      option.option_number.toUpperCase()
                    );
                    const showCorrect =
                      (feedback && quizType === 'practice' && isCorrect) ||
                      (feedback && !feedback.correct && isCorrect);
                    const cleanedOptionText = cleanOptionText(option.option_text, question);
                    const optionTextClass =
                      cleanedOptionText.length > 80 ? 'text-xs sm:text-sm' : 'text-sm sm:text-base';
                    const optionId = `option-${currentQuestionIndex}-${index}`;

                    return (
                      <div key={index} className="relative">
                        <input
                          type="radio"
                          id={optionId}
                          name={`question-${currentQuestionIndex}`}
                          checked={isSelected}
                          onChange={() => !isAnswerLocked && onAnswer([index])}
                          disabled={isAnswerLocked}
                          className="peer sr-only"
                          aria-label={`Option ${option.option_number}: ${cleanedOptionText}`}
                        />

                        <label
                          htmlFor={optionId}
                          className={`block w-full cursor-pointer select-none rounded-lg p-2.5 text-left transition-all duration-200 sm:p-4 ${
                            isAnswerLocked
                              ? isSelected
                                ? isCorrect
                                  ? 'border-2 border-green-500 bg-green-600 bg-opacity-20 text-green-300'
                                  : 'border-2 border-red-500 bg-red-600 bg-opacity-20 text-red-300'
                                : showCorrect
                                  ? 'border-2 border-green-500 bg-green-600 bg-opacity-20 text-green-300'
                                  : 'border-2 border-gray-600 bg-gray-700 bg-opacity-50 text-gray-400'
                              : 'border-2 border-gray-600 bg-gray-700 bg-opacity-50 text-gray-300 hover:border-gray-500 hover:bg-gray-600 peer-checked:border-blue-500 peer-checked:bg-blue-600 peer-checked:bg-opacity-20 peer-checked:text-blue-300'
                          }`}
                        >
                          <div className="flex items-start sm:items-center">
                            <span className="mr-2 min-w-[1.5rem] flex-shrink-0 text-base font-semibold sm:text-lg">
                              {option.option_number}.
                            </span>
                            <span className={`${optionTextClass} flex-grow break-words`}>
                              {cleanedOptionText}
                            </span>
                            {isAnswerLocked && (
                              <span className="ml-2 flex-shrink-0">
                                {isSelected && isCorrect && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                {isSelected && !isCorrect && (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                {!isSelected && showCorrect && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

const Quiz = ({
  quizType = 'practice',
  onExit,
  questions,
  quizTime,
  courseName,
  courseCode,
}: {
  quizType: QuizType;
  onExit: () => void;
  questions: Question[];
  quizTime: number;
  courseName: string;
  courseCode: string;
}) => {
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (quizType === 'timed' || quizType === 'quick' || quizType === 'weekly') {
      return quizTime * 60;
    }
    return 0;
  });
  const [powerUps, setPowerUps] = useState<PowerUpType[]>([]);
  const [quizEnded, setQuizEnded] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<number[]>([0, 1, 2, 3]);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    selectedIndexes: number[];
  } | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<
    {
      selectedOptions: number[];
      correct: boolean;
      locked: boolean;
      correctAnswer?: string[];
    }[]
  >(questions.map(() => ({ selectedOptions: [], correct: false, locked: false })));

  const [quizSettings, setQuizSettings] = useState({
    showFeedback: true,
    enablePowerUps: true,
    enableLives: true,
  });

  const [powerUpUsage, setPowerUpUsage] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (quizSettings.enablePowerUps) {
      setPowerUps([
        {
          type: 'fiftyFifty',
          icon: Zap,
          name: '50/50',
          active: !powerUpUsage['fiftyFifty'],
        },
        {
          type: 'extraTime',
          icon: Clock,
          name: 'Extra Time',
          active: !powerUpUsage['extraTime'],
        },
        {
          type: 'shield',
          icon: Shield,
          name: 'Shield',
          active: !powerUpUsage['shield'],
        },
      ]);
    } else {
      setPowerUps([]);
    }
  }, [quizSettings.enablePowerUps, powerUpUsage]);

  const savePowerUpUsage = useCallback((type: string) => {
    setPowerUpUsage(prev => ({ ...prev, [type]: true }));
  }, []);

  const handleExit = useCallback(() => {
    setPowerUpUsage({});
    if (onExit) onExit();
  }, [onExit]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (
      (quizType === 'timed' || quizType === 'quick' || quizType === 'weekly') &&
      !quizEnded &&
      timeLeft > 0
    ) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizType, quizEnded, timeLeft]);

  const handleSettingsChange = (setting: keyof typeof quizSettings) => {
    setQuizSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const endQuiz = useCallback(() => {
    setTimeLeft(0);
    setQuizEnded(true);

    try {
      const storedProgress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
      const incorrectQuestions = questions
        .filter((_, idx) => !userAnswers[idx]?.correct)
        .map(q => q.question);
      storedProgress[courseCode] = {
        incorrectQuestions,
      };
      localStorage.setItem('quizProgress', JSON.stringify(storedProgress));
    } catch (err) {
      console.error('Error updating quiz progress:', err);
    }

    try {
      const totalQuestions = questions.length;
      const correctAnswers = userAnswers.filter(ans => ans.correct).length;
      const quizPerformance = Math.round((correctAnswers / totalQuestions) * 100);
      const weightedQuizProgress = Math.round(quizPerformance * 0.6);

      const weekProgress = JSON.parse(localStorage.getItem(`weekProgress_${courseCode}`) || '{}');
      const courseData = JSON.parse(localStorage.getItem(`courseData_${courseCode}`) || '{}');
      const totalWeeks = courseData.totalWeeks || 1;
      const viewedWeeks = Object.keys(weekProgress).length;
      const viewProgress = Math.round((viewedWeeks / totalWeeks) * 40);

      const totalProgress = Math.min(100, Math.round(viewProgress + weightedQuizProgress));

      const courseProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
      courseProgress[courseCode] = totalProgress;
      localStorage.setItem('courseProgress', JSON.stringify(courseProgress));
    } catch (err) {
      console.error('Error updating course completion:', err);
    }
  }, [questions, userAnswers, courseCode]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptions(userAnswers[currentQuestionIndex + 1]?.selectedOptions || []);
      setAvailableOptions([0, 1, 2, 3]);
      setFeedback(null);
    } else {
      endQuiz();
    }
  }, [currentQuestionIndex, questions.length, userAnswers, endQuiz]);

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const previousIndex = currentQuestionIndex - 1;
      const previousAnswer = userAnswers[previousIndex];

      setCurrentQuestionIndex(previousIndex);
      setSelectedOptions(previousAnswer?.selectedOptions || []);
      setAvailableOptions([0, 1, 2, 3]);

      if (previousAnswer?.locked) {
        const isCorrect = previousAnswer.correct;
        setFeedback({
          correct: isCorrect,
          selectedIndexes: previousAnswer.selectedOptions,
        });
      } else {
        setFeedback(null);
      }
    }
  };

  const handleAnswer = useCallback(
    (newSelectedOptions: number[]) => {
      setSelectedOptions(newSelectedOptions);
      setUserAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex] = {
          selectedOptions: newSelectedOptions,
          correct: false,
          locked: false,
        };
        return newAnswers;
      });
    },
    [currentQuestionIndex]
  );

  const saveAnswers = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    const displayedOptions = currentQuestion.options.filter((_, idx) =>
      availableOptions.includes(idx)
    );
    const selectedLabels = selectedOptions.map(idx =>
      displayedOptions[idx].option_number.toUpperCase()
    );
    const correctLabels = currentQuestion.answer.map((ans: string) => ans.toUpperCase());

    const isCorrect =
      selectedLabels.length === correctLabels.length &&
      selectedLabels.every(label => correctLabels.includes(label));

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else if (quizSettings.enableLives) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives === 0) {
          endQuiz();
        }
        return newLives;
      });
    }

    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = {
        selectedOptions,
        correct: isCorrect,
        locked: true,
        correctAnswer: correctLabels,
      };
      return newAnswers;
    });

    if (quizSettings.showFeedback) {
      setFeedback({ correct: isCorrect, selectedIndexes: selectedOptions });
    }

    if (currentQuestionIndex === questions.length - 1) {
      setTimeout(() => endQuiz(), 1500);
    } else if (isCorrect || !quizSettings.showFeedback) {
      setTimeout(() => goToNextQuestion(), 1500);
    }
  }, [
    questions,
    currentQuestionIndex,
    selectedOptions,
    quizSettings,
    endQuiz,
    goToNextQuestion,
    availableOptions,
  ]);

  const usePowerUp = useCallback(
    (type: string) => {
      if (!quizSettings.enablePowerUps || powerUpUsage[type]) return;

      if (type === 'fiftyFifty') {
        const currentQuestion = questions[currentQuestionIndex];
        const correctLabels = currentQuestion.answer.map(ans => ans.toUpperCase());

        const correctIndexes = currentQuestion.options
          .map((opt, idx) => {
            const label = opt.option_number.toUpperCase();
            return correctLabels.includes(label) ? idx : -1;
          })
          .filter(idx => idx !== -1);

        let incorrectOptions = availableOptions.filter(idx => !correctIndexes.includes(idx));

        if (availableOptions.length <= correctIndexes.length + 1) {
          setAvailableOptions(correctIndexes);
        } else {
          const optionsToRemove = incorrectOptions.slice(0, Math.min(2, incorrectOptions.length));
          setAvailableOptions(prev => prev.filter(idx => !optionsToRemove.includes(idx)));
        }
      } else if (type === 'extraTime') {
        setTimeLeft(prev => prev + 30);
      } else if (type === 'shield') {
        setLives(prev => prev + 1);
      }

      savePowerUpUsage(type);
      setPowerUps(prev => prev.map(p => (p.type === type ? { ...p, active: false } : p)));
    },
    [
      currentQuestionIndex,
      questions,
      availableOptions,
      quizSettings.enablePowerUps,
      powerUpUsage,
      savePowerUpUsage,
    ]
  );

  const restartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(quizSettings.enableLives ? 3 : 0);
    setTimeLeft(
      quizType === 'timed' || quizType === 'quick'
        ? quizTime * 60
        : quizType === 'weekly'
          ? quizTime * 60
          : 0
    );
    setPowerUpUsage({});
    setPowerUps(prev => prev.map(p => ({ ...p, active: true })));
    setQuizEnded(false);
    setAvailableOptions([0, 1, 2, 3]);
    setFeedback(null);
    setSelectedOptions([]);
    setUserAnswers(questions.map(() => ({ selectedOptions: [], correct: false, locked: false })));
  }, [quizTime, questions, quizType, quizSettings.enableLives]);

  if (quizEnded) {
    return (
      <ResultScreen
        score={score}
        totalQuestions={questions.length}
        onRestart={restartQuiz}
        courseCode={courseCode}
        questions={questions}
        userAnswers={userAnswers}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswerLocked = userAnswers[currentQuestionIndex]?.locked;

  const confirmQuitQuiz = () => {
    if (
      window.confirm(
        'Are you sure you want to end the quiz? Your progress will be saved in the results.'
      )
    ) {
      endQuiz();
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-5rem)] w-full max-w-4xl flex-col overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExit}
            variant="ghost"
            className="flex items-center text-blue-300 transition-colors duration-300 hover:bg-blue-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit
          </Button>

          <QuizSettings quizSettings={quizSettings} onSettingChange={handleSettingsChange} />
        </div>

        <div className="flex items-center gap-4">
          {quizSettings.enableLives && (
            <div className="mr-4 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`h-5 w-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              ))}
            </div>
          )}

          <Button
            onClick={confirmQuitQuiz}
            variant="destructive"
            size="sm"
            className="whitespace-nowrap"
          >
            End Quiz
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: [0.42, 0, 0.58, 1] }}
            className="flex h-full flex-col"
          >
            <QuizContent
              question={currentQuestion.question}
              options={currentQuestion.options.filter((_, idx) => availableOptions.includes(idx))}
              onAnswer={handleAnswer}
              timeLeft={timeLeft}
              maxTime={quizTime * 60}
              lives={lives}
              powerUps={quizSettings.enablePowerUps ? powerUps : []}
              onUsePowerUp={usePowerUp}
              quizType={quizType}
              currentScore={score}
              totalQuestions={questions.length}
              currentQuestionIndex={currentQuestionIndex}
              selectedOptions={selectedOptions}
              isAnswerLocked={isAnswerLocked}
              feedback={feedback}
              questions={questions}
              quizSettings={quizSettings}
            />
          </motion.div>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 mt-4 border-t border-gray-800 bg-opacity-90 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl justify-between gap-2">
          <Button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-600 transition-colors duration-300 hover:bg-gray-700"
          >
            Previous
          </Button>

          <Button
            onClick={saveAnswers}
            disabled={isAnswerLocked || selectedOptions.length === 0}
            className="flex-1 bg-blue-600 transition-colors duration-300 hover:bg-blue-700"
          >
            Save Answers
          </Button>

          <Button
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className="bg-gray-600 transition-colors duration-300 hover:bg-gray-700"
          >
            Next
          </Button>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mt-2 text-center text-lg font-semibold ${
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
                  <CheckCircle className="h-5 w-5" />
                  <span>Correct!</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Incorrect!</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ResultScreen = ({
  score,
  totalQuestions,
  onRestart,
  courseCode,
  questions,
  userAnswers,
}: {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  courseCode: string;
  questions: Question[];
  userAnswers: { selectedOptions: number[]; correct: boolean; locked: boolean }[];
}) => {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const progressValue = Math.round((score / totalQuestions) * 100);

  const handleBackToPortal = () => {
    router.push(`/courses/${courseCode}`);
  };

  return (
    <Card className="relative mx-auto w-full max-w-4xl overflow-hidden border-2 border-blue-500 bg-gray-800 bg-opacity-50 text-center shadow-lg backdrop-blur-sm">
      <button
        onClick={handleBackToPortal}
        className="absolute left-4 top-4 rounded-full p-2 text-blue-300 transition-colors duration-300 hover:bg-blue-900"
        aria-label="Back to Course Portal"
        type="button"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <CardHeader>
        <CardTitle className="mb-2 text-3xl font-bold text-blue-300">Quiz Results</CardTitle>
        <CardDescription className="text-gray-300">
          You've completed the quiz! Here's how you did:
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Award className="h-16 w-16 text-yellow-400" />

            <div>
              <p className="text-3xl font-bold text-gray-200">
                {score}/{totalQuestions}
              </p>
              <p className="text-sm text-gray-400">Questions Correct</p>
            </div>

            <Progress value={progressValue} className="w-full max-w-md" />

            <p className="text-sm text-gray-300">{progressValue}% Accuracy</p>
          </div>

          <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-lg bg-opacity-50 p-4">
              <p className="text-2xl font-bold text-green-400">{score}</p>
              <p className="text-sm text-gray-300">Correct</p>
            </div>

            <div className="rounded-lg bg-opacity-50 p-4">
              <p className="text-2xl font-bold text-red-400">{totalQuestions - score}</p>
              <p className="text-sm text-gray-300">Incorrect</p>
            </div>
          </div>

          <Button
            onClick={() => setShowDetails(!showDetails)}
            className="mx-auto w-full max-w-md bg-blue-600 hover:bg-blue-700"
          >
            {showDetails ? 'Hide Details' : 'Show Question Details'}
          </Button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full"
              >
                <div className="border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-medium text-blue-300">Question Analysis</h3>
                </div>

                <ScrollArea className="custom-scrollbar mt-4 h-[40vh] w-full rounded-lg border border-gray-700">
                  <div className="space-y-4 p-4">
                    {questions.map((question, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-4 ${
                          userAnswers[idx]?.correct
                            ? 'border border-green-700 bg-green-900 bg-opacity-20'
                            : 'border border-red-700 bg-red-900 bg-opacity-20'
                        }`}
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="text-left text-sm font-medium text-gray-200">
                              {idx + 1}. {question.question}
                            </p>

                            {userAnswers[idx]?.correct ? (
                              <CheckCircle className="ml-2 h-5 w-5 flex-shrink-0 text-green-500" />
                            ) : (
                              <XCircle className="ml-2 h-5 w-5 flex-shrink-0 text-red-500" />
                            )}
                          </div>

                          {!userAnswers[idx]?.correct && (
                            <div className="text-sm">
                              <p className="text-red-400">
                                Your answer:{' '}
                                {userAnswers[idx]?.selectedOptions
                                  .map(opt => question.options[opt]?.option_text)
                                  .join(', ')}
                              </p>
                              <p className="text-green-400">
                                Correct answer:{' '}
                                {question.answer
                                  .map(label => {
                                    const opt = question.options.find(
                                      o => o.option_number.toUpperCase() === label.toUpperCase()
                                    );
                                    return opt ? opt.option_text : label;
                                  })
                                  .join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={onRestart} className="w-full bg-blue-600 hover:bg-blue-700 sm:w-1/2">
          Try Again
        </Button>

        <Button
          onClick={handleBackToPortal}
          className="w-full bg-gray-600 hover:bg-gray-700 sm:w-1/2"
        >
          Back to Course
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
}: InteractiveQuizProps) {
  const router = useRouter();

  const [currentPhase, setCurrentPhase] = useState<'intro' | 'quiz' | 'results'>('intro');

  const [quizSettingsLoaded, setQuizSettingsLoaded] = useState(false);
  const [quizSettings, setQuizSettings] = useState<{
    questionCount: number;
    quizTime: number;
  }>({ questionCount: 10, quizTime: 5 });

  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  useEffect(() => {
    try {
      const storedSettings = JSON.parse(localStorage.getItem('quizSettings') || '{}');

      if (quizType === 'weekly') {
        const weekSelections =
          storedSettings.weekSelections ||
          JSON.parse(localStorage.getItem(`weekSelections_${courseCode}`) || '{}');
        const selectedWeeks = Object.keys(weekSelections || {}).filter(w => weekSelections[w]);

        if (selectedWeeks.length === 0) {
          console.error('No weeks selected for weekly quiz');
          router.push(`/courses/${courseCode}`);
          return;
        }

        const filtered = questions.filter(q => selectedWeeks.includes((q as any).week_name));

        if (filtered.length === 0) {
          console.error('No questions found for selected weeks');
          router.push(`/courses/${courseCode}`);
          return;
        }

        const questionsWithWeekNames = filtered.map(q =>
          (q as any).week_name ? q : { ...q, week_name: 'Unknown Week' }
        );

        setFilteredQuestions(questionsWithWeekNames);
        const timeLimit = storedSettings.timerSeconds
          ? storedSettings.timerSeconds / 60
          : questionsWithWeekNames.length;
        setQuizSettings({
          questionCount: questionsWithWeekNames.length,
          quizTime: timeLimit,
        });
      } else {
        if (quizType === 'practice') {
          setQuizSettings({
            questionCount: questions.length,
            quizTime: 0,
          });
        } else if (quizType === 'timed') {
          setQuizSettings({
            questionCount: storedSettings.questionCount || Math.min(50, questions.length),
            quizTime: storedSettings.quizTime || 30,
          });
        } else if (quizType === 'quick') {
          setQuizSettings({ questionCount: 10, quizTime: 5 });
        } else if (quizType === 'progress') {
          const cnt = Math.min(20, questions.length);
          setQuizSettings({ questionCount: cnt, quizTime: cnt });
        }
      }
    } catch (err) {
      console.error('Error setting up quiz:', err);
      setQuizSettings({
        questionCount: Math.min(10, questions.length),
        quizTime: 10,
      });
    } finally {
      setQuizSettingsLoaded(true);
    }
  }, [quizType, questions, courseCode, router]);

  const rawQuestions = useMemo<Question[]>(
    () => (quizType === 'weekly' ? filteredQuestions : questions),
    [quizType, filteredQuestions, questions]
  );

  const sanitizedQuestions = useMemo(
    () =>
      initializeQuestionsWithFixedOrder(
        rawQuestions.filter(
          q =>
            q.question &&
            ((q.content_type === 'mcq' &&
              q.options &&
              q.options.length >= 2 &&
              q.answer &&
              q.answer.length > 0) ||
              (q.content_type === 'text' && q.question_text))
        )
      ),
    [rawQuestions]
  );

  const displayedQuestions = useMemo(() => {
    if (quizType === 'practice' || quizType === 'progress' || quizType === 'weekly') {
      return sanitizedQuestions;
    }
    const count = Math.min(quizSettings.questionCount, sanitizedQuestions.length);
    return shuffleArray(sanitizedQuestions).slice(0, count);
  }, [sanitizedQuestions, quizType, quizSettings.questionCount]);

  const progressQuestions = useMemo(() => {
    if (quizType !== 'progress') return displayedQuestions;

    try {
      const storedProgress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
      const incorrect = storedProgress[courseCode]?.incorrectQuestions || [];
      const onlyIncorrect = displayedQuestions.filter(q => incorrect.includes(q.question));
      return onlyIncorrect.length ? onlyIncorrect : displayedQuestions;
    } catch {
      return displayedQuestions;
    }
  }, [quizType, displayedQuestions, courseCode]);

  if (!quizSettingsLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 text-gray-100">
      <div className="pointer-events-none absolute inset-0 select-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500 opacity-20"
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
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {displayedQuestions ? (
            <Quiz
              quizType={quizType}
              onExit={onExit || (() => router.back())}
              questions={quizType === 'progress' ? progressQuestions : displayedQuestions}
              quizTime={quizSettings.quizTime}
              courseName={courseName}
              courseCode={courseCode}
            />
          ) : (
            <div className="rounded-lg bg-gray-800 bg-opacity-50 p-6 text-center text-red-500 backdrop-blur-sm">
              Invalid Quiz Type. Please select a valid quiz type.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
