'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Zap, Clock, Shield, Award, ArrowRight, ArrowLeft, CheckCircle, XCircle, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/Button"
import { Progress } from "@/components/ui/Progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"
import { ScrollArea } from '@/components/ui/scroll-area'
import { QuizType } from '@/types/quiz'
import { initializeQuestionsWithFixedOrder, Question } from '@/lib/quizUtils'

const cleanQuestionText = (question: string): string => {
  return question.replace(/^\s*\d+[\).:\-]\s*/, '');
}

const cleanOptionText = (optionText: string, questionText: string): string => {
  return optionText.replace(questionText, '').trim();
}

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

interface InteractiveQuizProps {
  quizType: QuizType
  courseName: string
  questions: Question[]
  courseCode: string
  onExit?: () => void
}

interface PowerUpType {
  type: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  name: string
  active: boolean
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
}: {
  question: string;
  options: { option_number: string, option_text: string }[];
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
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const isTextQuestion = currentQuestion.content_type === 'text';
  const cleanedQuestion = cleanQuestionText(question);
  
  // Determine text size based on question length
  const questionTextClass = cleanedQuestion.length > 100 
    ? 'text-lg sm:text-xl' 
    : cleanedQuestion.length > 50 
    ? 'text-xl sm:text-2xl' 
    : 'text-2xl sm:text-3xl';

  return (
    <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-2 border-blue-500 shadow-lg max-h-[calc(100vh-12rem)] overflow-y-auto">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <CardTitle className={`${questionTextClass} font-bold text-blue-300 break-words max-w-full sm:max-w-[80%]`}>
          {currentQuestionIndex + 1}. {cleanedQuestion}
        </CardTitle>
        <div className="text-blue-300 font-semibold whitespace-nowrap">
          Score: {currentScore} / {totalQuestions}
        </div>
      </CardHeader>
      
      {(quizType === 'timed' || quizType === 'quick') && <QuizTimer time={timeLeft} maxTime={maxTime} />}
      
      <CardContent className="space-y-4">
        {isTextQuestion ? (
          <div className="space-y-4">
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg border-2 border-gray-600 max-h-[40vh] overflow-y-auto">
              <p className="text-gray-200 whitespace-pre-wrap text-sm sm:text-base">
                {currentQuestion.question_text}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              {quizType === 'quick' && (
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
              {(quizType === 'timed' || quizType === 'quick') && (
                <div className="flex gap-1">
                  {[...Array(lives)].map((_, i) => (
                    <Heart key={i} className="h-4 w-4 sm:h-6 sm:w-6 text-red-500" />
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid gap-3 sm:gap-4">
              {options.map((option, index) => {
                const isSelected = selectedOptions.includes(index);
                const isCorrect = currentQuestion.answer.includes(option.option_number.toUpperCase());
                const showCorrect = (feedback && quizType === 'practice' && isCorrect) || 
                                  (feedback && !feedback.correct && isCorrect);
                const cleanedOptionText = cleanOptionText(option.option_text, question);
                const optionTextClass = cleanedOptionText.length > 80 ? 'text-xs sm:text-sm' : 'text-sm sm:text-base';
                
                return (
                  <button
                    key={index}
                    onClick={() => !isAnswerLocked && onAnswer([index])}
                    disabled={isAnswerLocked}
                    className={`w-full p-3 sm:p-4 rounded-lg text-left transition-all duration-200 ${
                      isAnswerLocked
                        ? isSelected
                          ? isCorrect
                            ? 'bg-green-600 bg-opacity-20 border-2 border-green-500 text-green-300'
                            : 'bg-red-600 bg-opacity-20 border-2 border-red-500 text-red-300'
                          : showCorrect
                          ? 'bg-green-600 bg-opacity-20 border-2 border-green-500 text-green-300'
                          : 'bg-gray-700 bg-opacity-50 border-2 border-gray-600 text-gray-400'
                        : isSelected
                        ? 'bg-blue-600 bg-opacity-20 border-2 border-blue-500 text-blue-300 hover:bg-blue-600 hover:bg-opacity-30'
                        : 'bg-gray-700 bg-opacity-50 border-2 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start sm:items-center">
                      <span className="text-base sm:text-lg font-semibold mr-2 flex-shrink-0">
                        {option.option_number}.
                      </span>
                      <span className={`${optionTextClass} break-words`}>
                        {cleanedOptionText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
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
  const router = useRouter()
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
    { selectedOptions: number[]; correct: boolean; locked: boolean; correctAnswer?: string[] }[]
  >(questions.map(() => ({ selectedOptions: [], correct: false, locked: false })))
  
  const [quizSettings, setQuizSettings] = useState({
    showFeedback: true,
    enablePowerUps: true,
    enableLives: true
  })

  // Initialize power-ups for all quiz types if enabled
  useEffect(() => {
    if (quizSettings.enablePowerUps) {
      setPowerUps([
        { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
        { type: "extraTime", icon: Clock, name: "Extra Time", active: true },
        { type: "shield", icon: Shield, name: "Shield", active: true },
      ])
    } else {
      setPowerUps([])
    }
  }, [quizSettings.enablePowerUps])

  // Set initial lives based on settings
  useEffect(() => {
    setLives(quizSettings.enableLives ? 3 : 0)
  }, [quizSettings.enableLives])

  const handleSettingsChange = (setting: keyof typeof quizSettings) => {
    setQuizSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const confirmQuitQuiz = () => {
    if (window.confirm('Are you sure you want to end the quiz? Your progress will be saved in the results.')) {
      endQuiz()
    }
  }

  const endQuiz = useCallback(() => {
    setQuizEnded(true);
    let incorrectQuestions: string[] = [];
    try {
      const storedProgress = JSON.parse(localStorage.getItem("quizProgress") || "{}");
      incorrectQuestions = questions
        .filter((_, idx) => !userAnswers[idx]?.correct)
        .map((q) => q.question);
      storedProgress[courseCode] = {
        incorrectQuestions,
      };
      localStorage.setItem("quizProgress", JSON.stringify(storedProgress));
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }

    try {
      const totalQuestions = questions.length;
      const correctAnswers = userAnswers.filter(ans => ans.correct).length;
      const quizPerformance = Math.round((correctAnswers / totalQuestions) * 100);
      const weightedQuizProgress = Math.round(quizPerformance * 0.6);

      const weekProgress = JSON.parse(localStorage.getItem(`weekProgress_${courseCode}`) || "{}");
      const courseData = JSON.parse(localStorage.getItem(`courseData_${courseCode}`) || "{}");
      const totalWeeks = courseData.totalWeeks || 1;
      const viewedWeeks = Object.keys(weekProgress).length;
      const viewProgress = Math.round((viewedWeeks / totalWeeks) * 40);

      const totalProgress = Math.min(100, Math.round(viewProgress + weightedQuizProgress));
      
      const courseProgress = JSON.parse(localStorage.getItem("courseProgress") || "{}");
      courseProgress[courseCode] = totalProgress;
      localStorage.setItem("courseProgress", JSON.stringify(courseProgress));
    } catch (error) {
      console.error("Error updating course completion:", error);
    }
  }, [questions, userAnswers, courseCode]);

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
    const currentQuestion = questions[currentQuestionIndex]
    const displayedOptions = currentQuestion.options.filter((_, idx) => availableOptions.includes(idx))
    const selectedLabels = selectedOptions.map(idx => displayedOptions[idx].option_number.toUpperCase())
    const correctLabels = currentQuestion.answer.map((ans: string) => ans.toUpperCase())

    const isCorrect =
      selectedLabels.length === correctLabels.length &&
      selectedLabels.every(label => correctLabels.includes(label))

    if (isCorrect) {
      setScore(prev => prev + 1)
    } else if (quizSettings.enableLives) {
      setLives(prev => {
        const newLives = prev - 1
        if (newLives === 0) {
          endQuiz()
        }
        return newLives
      })
    }

    setUserAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[currentQuestionIndex] = {
        selectedOptions,
        correct: isCorrect,
        locked: true,
        correctAnswer: correctLabels
      }
      return newAnswers
    })

    if (quizSettings.showFeedback) {
      setFeedback({ correct: isCorrect, selectedIndexes: selectedOptions })
    }

    if (currentQuestionIndex === questions.length - 1) {
      setTimeout(() => endQuiz(), 1500)
    } else if (isCorrect || !quizSettings.showFeedback) {
      setTimeout(() => goToNextQuestion(), 1500)
    }
  }, [questions, currentQuestionIndex, selectedOptions, quizSettings, endQuiz, goToNextQuestion, availableOptions])

  const restartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setLives(quizSettings.enableLives ? 3 : 0)
    setTimeLeft(quizType === 'timed' || quizType === 'quick' ? quizTime * 60 : 0)
    setPowerUps((prev) => prev.map((p) => ({ ...p, active: true })))
    setQuizEnded(false)
    setAvailableOptions([0, 1, 2, 3])
    setFeedback(null)
    setSelectedOptions([])
    setUserAnswers(questions.map(() => ({ selectedOptions: [], correct: false, locked: false })))
  }, [quizTime, questions, quizType, quizSettings.enableLives])

  const usePowerUp = useCallback((type: string) => {
    if (!quizSettings.enablePowerUps) return;
    
    if (type === "fiftyFifty") {
      const currentQuestion = questions[currentQuestionIndex];
      const correctLabels = currentQuestion.answer.map(ans => ans.toUpperCase());
      
      const correctIndexes = currentQuestion.options.map((opt, idx) => {
        const label = opt.option_number.toUpperCase();
        return correctLabels.includes(label) ? idx : -1;
      }).filter(idx => idx !== -1);
      
      let incorrectOptions = availableOptions.filter(idx => !correctIndexes.includes(idx));

      if (availableOptions.length <= correctIndexes.length + 1) {
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
  }, [currentQuestionIndex, questions, availableOptions, quizSettings.enablePowerUps]);

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setSelectedOptions(userAnswers[currentQuestionIndex - 1]?.selectedOptions || [])
      setAvailableOptions([0, 1, 2, 3])
      setFeedback(null)
    }
  }

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
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswerLocked = userAnswers[currentQuestionIndex]?.locked

  return (
    <div className="w-full max-w-4xl flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={onExit}
          variant="ghost"
          className="text-blue-300 hover:bg-blue-900 transition-colors duration-300 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
        </Button>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSettingsChange('showFeedback')}
            variant={quizSettings.showFeedback ? 'default' : 'secondary'}
            size="sm"
          >
            {quizSettings.showFeedback ? 'Hide' : 'Show'} Feedback
          </Button>
          <Button
            onClick={() => handleSettingsChange('enablePowerUps')}
            variant={quizSettings.enablePowerUps ? 'default' : 'secondary'}
            size="sm"
          >
            {quizSettings.enablePowerUps ? 'Disable' : 'Enable'} Power-ups
          </Button>
          <Button
            onClick={() => handleSettingsChange('enableLives')}
            variant={quizSettings.enableLives ? 'default' : 'secondary'}
            size="sm"
          >
            {quizSettings.enableLives ? 'Disable' : 'Enable'} Lives
          </Button>
          <Button
            onClick={confirmQuitQuiz}
            variant="destructive"
            size="sm"
          >
            End Quiz
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{
                duration: 0.3, 
                ease: [0.42, 0, 0.58, 1], 
              }}
              className="h-full flex flex-col"
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
              />
              <div className="mt-5 pt-4">
                <div className="flex justify-between">
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
                      className={`mt-4 text-lg font-semibold text-center ${
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

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
    <Card className="w-full max-w-4xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-sm text-center border-2 border-blue-500 shadow-lg relative overflow-hidden">
      <button
        onClick={handleBackToPortal}
        className="absolute top-4 left-4 text-blue-300 hover:bg-blue-900 p-2 rounded-full transition-colors duration-300"
        aria-label="Back to Course Portal"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <CardHeader>
        <CardTitle className="text-3xl font-bold text-blue-300 mb-2">
          Quiz Results
        </CardTitle>
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
            <p className="text-gray-300 text-sm">
              {progressValue}% Accuracy
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-400">{score}</p>
              <p className="text-sm text-gray-300">Correct</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{totalQuestions - score}</p>
              <p className="text-sm text-gray-300">Incorrect</p>
            </div>
          </div>

          <Button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full max-w-md mx-auto bg-blue-600 hover:bg-blue-700"
          >
            {showDetails ? 'Hide Details' : 'Show Question Details'}
          </Button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full"
              >
                <ScrollArea className="h-[40vh] w-full mt-4 rounded-lg border border-gray-700">
                  <div className="space-y-4 p-4">
                    {questions.map((question, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg ${
                          userAnswers[idx]?.correct
                            ? "bg-green-900 bg-opacity-20 border border-green-700"
                            : "bg-red-900 bg-opacity-20 border border-red-700"
                        }`}
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-left text-gray-200">
                              {idx + 1}. {question.question}
                            </p>
                            {userAnswers[idx]?.correct ? (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 ml-2" />
                            )}
                          </div>
                          {!userAnswers[idx]?.correct && (
                            <div className="text-sm">
                              <p className="text-red-400">
                                Your answer: {userAnswers[idx]?.selectedOptions.map(opt => 
                                  question.options[opt]?.option_number
                                ).join(", ")}
                              </p>
                              <p className="text-green-400">
                                Correct answer: {question.answer.join(", ")}
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

      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onRestart}
          className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </Button>
        <Button
          onClick={handleBackToPortal}
          className="w-full sm:w-1/2 bg-gray-600 hover:bg-gray-700"
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
  const handleExit = onExit || (() => router.back());

  const [quizSettingsLoaded, setQuizSettingsLoaded] = useState(false)
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
    setQuizSettingsLoaded(true)
  }, [])

  const sanitizedQuestions = useMemo(() => initializeQuestionsWithFixedOrder(
    questions.filter(
      (q) =>
        q.question && (
          // Handle MCQ questions
          (q.content_type === 'mcq' && q.options && q.options.length >= 2 && q.answer && q.answer.length > 0) ||
          // Handle text questions
          (q.content_type === 'text' && q.question_text)
        )
    )
  ), [questions])

  let questionCount = quizSettings.questionCount
  const quizTimeValue = quizSettings.quizTime

  if (quizType === "practice") {
    questionCount = sanitizedQuestions.length;
  } else {
    questionCount = Math.min(questionCount, sanitizedQuestions.length);
  }

  const displayedQuestions = useMemo(() => {
    return quizType === "practice" || quizType === "progress" 
      ? sanitizedQuestions
      : shuffleArray(sanitizedQuestions).slice(0, questionCount)
  }, [sanitizedQuestions, quizType, questionCount])

  let progressTestQuestions: Question[] = [];

  if (quizType === "progress") {
    try {
      const storedProgress = JSON.parse(localStorage.getItem("quizProgress") || "{}");
      const incorrectQuestions = storedProgress[courseCode]?.incorrectQuestions || [];
      progressTestQuestions = displayedQuestions.filter((q) => incorrectQuestions.includes(q.question));
  
      if (progressTestQuestions.length === 0) {
        console.warn("No progress questions found, defaulting to all questions.");
        progressTestQuestions = displayedQuestions;
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      progressTestQuestions = displayedQuestions;
    }
  } else {
    progressTestQuestions = displayedQuestions;
  }

  if (!quizSettingsLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-4">
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
        </h1>
        <AnimatePresence mode="wait">
          {displayedQuestions ? (
            <Quiz
              quizType={quizType as "practice" | "timed" | "quick" | "progress"}
              onExit={handleExit}
              questions={quizType === "progress" ? progressTestQuestions : displayedQuestions}
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
