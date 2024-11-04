'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  XCircle as XCircleIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/Button"
import { Progress } from "@/components/ui/Progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define Quiz Types
type QuizType = 'practice' | 'timed' | 'quick' | 'progress';

// Define Interfaces
interface ProcessedQuestion {
  question: string;
  shuffledOptions: string[];
  answerIndices: number[];
}

interface InteractiveQuizProps {
  quizType: QuizType;
  courseName: string;
  questions: ProcessedQuestion[];
  courseCode: string;
  onExit?: () => void;
  quizTime?: number; // Optional prop for quiz time in seconds
  numQuestions?: number; // Optional prop for the number of questions
}

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  handleRestart: () => void;
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

// Utility: Shuffle Array
const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

// Particle Background Component
const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full opacity-10 animate-float"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 4 + 1}px`,
          height: `${Math.random() * 4 + 1}px`,
          animationDuration: `${Math.random() * 10 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
)

// StatCard Component
const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number | string }) => (
  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-indigo-200">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
    </CardContent>
  </Card>
)

// PowerUp Component
const PowerUp = ({
  icon: Icon,
  name,
  active,
  onClick
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  name: string,
  active: boolean,
  onClick: () => void
}) => (
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

// QuizTimer Component
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

// QuizContent Component
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
  quizType: QuizType;
  currentScore: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  selectedOptions: number[];
  isAnswerLocked: boolean;
}) => (
  <Card className="w-full bg-gray-800 bg-opacity-50 backdrop-blur-sm border-2 border-blue-500 shadow-lg">
    <CardHeader className="flex justify-between items-center">
      <CardTitle className="text-xl font-bold text-blue-300">
        {question}
      </CardTitle>
      <div className="text-blue-300 font-semibold">
        Score: {currentScore} / {totalQuestions}
      </div>
    </CardHeader>
    {(quizType === 'timed' || quizType === 'quick') && (
      <QuizTimer time={timeLeft} maxTime={maxTime} />
    )}
    <CardContent>
      <div className="flex justify-between items-center mb-4">
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
        {quizType === "practice" && (
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
                if (!isAnswerLocked) {
                  const newSelectedOptions = isSelected
                    ? selectedOptions.filter((i) => i !== index)
                    : [...selectedOptions, index];
                  onAnswer(newSelectedOptions);
                }
              }}
              variant={isSelected ? "secondary" : "outline"}
              className={`justify-start text-left h-auto py-3 px-4 ${
                isAnswerLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isAnswerLocked}
            >
              {option}
            </Button>
          )
        })}
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
)

// ResultScreen Component
const ResultScreen = ({
  score,
  totalQuestions,
  handleRestart,
  courseCode,
  userAnswers,
  questions,
}: ResultScreenProps) => {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const handleBackToPortal = () => {
    router.push(`/courses/${courseCode}`)
  }

  const progressValue = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0

  const navigateQuestion = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentQuestionIndex - 1 : currentQuestionIndex + 1
    if (newIndex >= 0 && newIndex < totalQuestions) {
      setCurrentQuestionIndex(newIndex)
    }
  }

  const getScoreMessage = () => {
    if (score === totalQuestions) return "Perfect score! Excellent work!"
    if (score >= totalQuestions * 0.8) return "Great job! You're doing well!"
    if (score >= totalQuestions * 0.6) return "Good effort! Keep practicing!"
    return "Don't give up! Try again to improve your score."
  }

  const totalTimeSpent = userAnswers.reduce((total, answer) => total + answer.timeSpent, 0)
  const averageTimePerQuestion = totalQuestions > 0 ? totalTimeSpent / totalQuestions : 0

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 h-screen flex flex-col">
      <header className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          className="text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          onClick={handleBackToPortal}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">
          Quiz Results
        </h1>
        <Button onClick={handleRestart} variant="outline" className="text-indigo-200 border-indigo-200 hover:bg-white/10">
          Try Again
        </Button>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div className="lg:w-1/3 space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-indigo-200">Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center mb-2 text-white">{Math.round(progressValue)}%</div>
              <Progress value={progressValue} className="h-2 mb-2" />
              <p className="text-sm text-indigo-100 text-center">{getScoreMessage()}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={<Award className="h-4 w-4 text-yellow-300" />} title="Score" value={`${score}/${totalQuestions}`} />
            <StatCard icon={<CheckCircle2 className="h-4 w-4 text-green-300" />} title="Accuracy" value={`${Math.round((score / totalQuestions) * 100)}%`} />
            <StatCard icon={<XCircleIcon className="h-4 w-4 text-red-300" />} title="Incorrect" value={totalQuestions - score} />
            <StatCard icon={<Clock className="h-4 w-4 text-blue-300" />} title="Avg. Time" value={`${Math.round(averageTimePerQuestion)}s`} />
          </div>
        </div>

        <div className="lg:w-2/3">
          <Tabs defaultValue="review" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 text-indigo-200 mb-2">
              <TabsTrigger value="review" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Question Review</TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Summary</TabsTrigger>
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

                  <ScrollArea className="h-[calc(100vh-18rem)] pr-4"> {/* Adjusted height */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold mb-2 text-white">
                          {questions[currentQuestionIndex].question.replace(/^Option [A-Z]:\s*/, '')} {/* Remove "Option X: " prefix */}
                        </h3>
                        <ul className="space-y-2">
                          {questions[currentQuestionIndex].shuffledOptions.map((option, optionIndex) => {
                            const isCorrect = questions[currentQuestionIndex].answerIndices.includes(optionIndex)
                            const isSelected = userAnswers[currentQuestionIndex].selectedOptions.includes(optionIndex)

                            return (
                              <li
                                key={optionIndex}
                                className={`p-2 rounded-md transition-colors ${
                                  isCorrect
                                    ? 'bg-green-800/30 border border-green-500/50 text-green-200'
                                    : isSelected
                                    ? 'bg-red-800/30 border border-red-500/50 text-red-200'
                                    : 'bg-white/5 border border-white/10 text-indigo-100'
                                }`}
                              >
                                <div className="flex items-center">
                                  {isCorrect && (
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-300 flex-shrink-0" />
                                  )}
                                  {isSelected && !isCorrect && (
                                    <XCircleIcon className="mr-2 h-4 w-4 text-red-300 flex-shrink-0" />
                                  )}
                                  <span className="text-sm">
                                    {option.replace(/^Option [A-Z]:\s*/, '')} {/* Remove "Option X: " prefix */}
                                  </span>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                        <div className="mt-2 text-xs text-indigo-200">
                          Time spent: {userAnswers[currentQuestionIndex].timeSpent} seconds
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="summary" className="flex-grow overflow-hidden">
              <Card className="bg-white/5 backdrop-blur-sm border-white/20 h-full">
                <CardContent className="p-4 h-full">
                  <ScrollArea className="h-[calc(100vh-18rem)] pr-4"> {/* Adjusted height */}
                    <div className="space-y-2">
                      {questions.map((question, index) => (
                        <Card key={index} className="bg-white/5 border-white/20">
                          <CardHeader className="p-2">
                            <CardTitle className="text-xs font-medium flex items-center text-indigo-200">
                              <span className="mr-2">Q{index + 1}:</span>
                              {userAnswers[index].correct ? (
                                <CheckCircle2 className="h-4 w-4 text-green-300" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 text-red-300" />
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-2">
                            <p className="text-xs text-indigo-100 mb-1">{question.question.replace(/^Option [A-Z]:\s*/, '')}</p> {/* Remove prefix */}
                            <p className="text-xs text-indigo-200">
                              Time: {userAnswers[index].timeSpent}s
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

// Quiz Component
const Quiz = ({
  quizType,
  onExit,
  questions,
  quizTime = 300, 
  courseName,
  courseCode,
}: {
  quizType: QuizType;
  onExit: () => void;
  questions: ProcessedQuestion[];
  quizTime?: number; 
  courseName: string;
  courseCode: string;
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(quizType === 'timed' || quizType === 'quick' ? quizTime : 0)
  const [powerUps, setPowerUps] = useState<PowerUpType[]>([])
  const [quizEnded, setQuizEnded] = useState(false)
  const [availableOptions, setAvailableOptions] = useState<number[]>([0, 1, 2, 3])
  const [feedback, setFeedback] = useState<{ correct: boolean; selectedIndexes: number[] } | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [currentQuestions, setCurrentQuestions] = useState<ProcessedQuestion[]>(questions)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [restartTrigger, setRestartTrigger] = useState(false)

  const router = useRouter()

  const localStorageKey = `quizState_${courseCode}_${quizType}`

  // Load Quiz Progress or Saved State
  useEffect(() => {
    const loadProgress = () => {
      if (quizType === 'progress') {
        try {
          const storedProgress = JSON.parse(localStorage.getItem("quizProgress") || "{}")
          const incorrectQuestions = storedProgress[courseCode]?.incorrectQuestions || []
          if (incorrectQuestions.length === 0) {
            alert("You have no incorrect questions to review!")
            onExit()
            return
          }
          const filteredQuestions = questions.filter(q => incorrectQuestions.includes(q.question))
          if (filteredQuestions.length === 0) {
            alert("No matching incorrect questions found.")
            onExit()
            return
          }
          setCurrentQuestions(filteredQuestions)
          setUserAnswers(filteredQuestions.map(() => ({ selectedOptions: [], correct: false, locked: false, timeSpent: 0 })))
          setCurrentQuestionIndex(0)
          setScore(0)
          setLives(3)
          setTimeLeft(0) 
          setPowerUps([]) 
          setQuizEnded(false)
          setAvailableOptions([0, 1, 2, 3])
          setFeedback(null)
          setSelectedOptions([])
          setRestartTrigger(prev => !prev)
        } catch (error) {
          console.error("Error loading progress from localStorage:", error)
        }
      } else {
        const savedState = localStorage.getItem(localStorageKey)
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState)
            setCurrentQuestionIndex(parsedState.currentQuestionIndex ?? 0)
            setScore(parsedState.score ?? 0)
            setLives(parsedState.lives ?? 3)
            setTimeLeft(parsedState.timeLeft ?? (quizType === 'timed' || quizType === 'quick' ? quizTime : 0))
            setPowerUps(parsedState.powerUps ?? (quizType === "timed" || quizType === "quick" ? [
              { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
              { type: "extraTime", icon: Clock, name: "Extra Time", active: true },
              { type: "shield", icon: Shield, name: "Shield", active: true },
            ] : quizType === "practice" ? [
              { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
              { type: "shield", icon: Shield, name: "Shield", active: true },
            ] : []))
            setQuizEnded(parsedState.quizEnded ?? false)
            setAvailableOptions(parsedState.availableOptions ?? [0, 1, 2, 3])
            setFeedback(parsedState.feedback ?? null)
            setSelectedOptions(parsedState.selectedOptions ?? [])
            setUserAnswers(parsedState.userAnswers ?? questions.map(() => ({ selectedOptions: [], correct: false, locked: false, timeSpent: 0 })))
          } catch (error) {
            console.error("Error parsing saved quiz state:", error)
          }
        } else {
          switch (quizType) {
            case 'timed':
            case 'quick':
              setPowerUps([
                { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
                { type: "extraTime", icon: Clock, name: "Extra Time", active: true },
                { type: "shield", icon: Shield, name: "Shield", active: true },
              ])
              break
            case 'practice':
              setPowerUps([
                { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
                { type: "shield", icon: Shield, name: "Shield", active: true },
              ])
              break
            default:
              setPowerUps([])
              break
          }
          setUserAnswers(questions.map(() => ({ selectedOptions: [], correct: false, locked: false, timeSpent: 0 })))
        }
    };

    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save Quiz State to Local Storage
  useEffect(() => {
    if (quizType !== 'progress') { 
      const stateToSave = {
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
      }
      localStorage.setItem(localStorageKey, JSON.stringify(stateToSave))
    }
  }, [
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
    quizType,
    localStorageKey
  ])

  // End Quiz Function
  const endQuiz = useCallback(() => {
    setQuizEnded(true)
    let incorrectQuestions: string[] = []
    try {
      const storedProgress = JSON.parse(localStorage.getItem("quizProgress") || "{}")
      incorrectQuestions = currentQuestions
        .filter((_, idx) => !userAnswers[idx]?.correct)
        .map((q) => q.question)
      storedProgress[courseCode] = {
        incorrectQuestions,
      }
      localStorage.setItem("quizProgress", JSON.stringify(storedProgress))
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }

    try {
      const totalQuestions = currentQuestions.length
      const correctAnswers = userAnswers.filter(ans => ans.correct).length
      const completionPercentage = Math.floor((correctAnswers / totalQuestions) * 100)
      const courseProgress = JSON.parse(localStorage.getItem("courseProgress") || "{}")
      courseProgress[courseCode] = completionPercentage
      localStorage.setItem("courseProgress", JSON.stringify(courseProgress))
    } catch (error) {
      console.error("Error updating course completion:", error)
    }
  }, [currentQuestions, userAnswers, courseCode])

  // Go To Next Question Function
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOptions(userAnswers[currentQuestionIndex + 1]?.selectedOptions || [])
      setAvailableOptions([0, 1, 2, 3])
      setFeedback(null)
    } else {
      endQuiz()
    }
  }, [currentQuestionIndex, currentQuestions.length, userAnswers, endQuiz])

  // Handle Answer Selection
  const handleAnswer = useCallback((newSelectedOptions: number[]) => {
    setSelectedOptions(newSelectedOptions)
  }, [])

  // Save Answers Function
  const saveAnswers = useCallback(() => {
    const currentQuestion = currentQuestions[currentQuestionIndex]
    const correctIndices = currentQuestion.answerIndices.slice().sort((a, b) => a - b)
    const selectedIndices = selectedOptions.slice().sort((a, b) => a - b)

    const isCorrect =
      selectedIndices.length === correctIndices.length &&
      selectedIndices.every((val, index) => val === correctIndices[index])

    if (isCorrect) {
      setScore(prev => prev + 1)
    } else if (quizType === "practice") {
      setLives(prev => {
        const newLives = prev - 1
        if (newLives === 0) {
          endQuiz()
        }
        return newLives
      })
    }

    const currentTime = Date.now()
    const timeSpent = Math.floor((currentTime - questionStartTime) / 1000)

    setUserAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[currentQuestionIndex] = { 
        selectedOptions, 
        correct: isCorrect, 
        locked: true,
        timeSpent: timeSpent
      }
      return newAnswers
    })

    if (quizType === "practice") {
      setFeedback({ correct: isCorrect, selectedIndexes: selectedOptions })
    }

    setTimeout(() => {
      if (isCorrect || quizType !== "practice") {
        if (currentQuestionIndex < currentQuestions.length - 1) {
          goToNextQuestion()
        } else {
          endQuiz()
        }
      }
    }, 1500)
  }, [currentQuestions, currentQuestionIndex, selectedOptions, quizType, lives, endQuiz, goToNextQuestion, questionStartTime])

  // Restart Quiz Function
  const restartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setLives(3)
    setTimeLeft(quizType === 'timed' || quizType === 'quick' ? quizTime : 0)
    setPowerUps((prev) => prev.map((p) => ({ ...p, active: true })))
    setQuizEnded(false)
    setAvailableOptions([0, 1, 2, 3])
    setFeedback(null)
    setSelectedOptions([])
    setUserAnswers(currentQuestions.map(() => ({ selectedOptions: [], correct: false, locked: false, timeSpent: 0 })))
    setRestartTrigger(prev => !prev)
    // Clear saved state
    if (quizType !== 'progress') {
      localStorage.removeItem(localStorageKey)
    }
  }, [quizTime, currentQuestions, quizType, localStorageKey])

  // Use Power-Up Function
  const usePowerUp = useCallback((type: string) => {
    if (type === "fiftyFifty") {
      const currentQuestion = currentQuestions[currentQuestionIndex]
      const correctIndices = currentQuestion.answerIndices.slice().sort((a, b) => a - b)
      
      let incorrectOptions = availableOptions.filter(idx => !correctIndices.includes(idx))

      if (availableOptions.length <= correctIndices.length + 1) {
        setAvailableOptions(correctIndices)
      } else {
        const optionsToRemove = shuffleArray(incorrectOptions).slice(0, Math.min(2, incorrectOptions.length))
        setAvailableOptions(prev => prev.filter(idx => !optionsToRemove.includes(idx)))
      }
    } else if (type === "extraTime") {
      setTimeLeft(prev => prev + 30)
    } else if (type === "shield") {
      setLives(prev => prev + 1)
    }

    setPowerUps(prev => prev.map(p => (p.type === type ? { ...p, active: false } : p)))
  }, [currentQuestionIndex, currentQuestions, availableOptions])

  // Initialize Power-Ups Based on Quiz Type
  useEffect(() => {
    switch (quizType) {
      case 'timed':
      case 'quick':
        setPowerUps([
          { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
          { type: "extraTime", icon: Clock, name: "Extra Time", active: true },
          { type: "shield", icon: Shield, name: "Shield", active: true },
        ])
        break
      case 'practice':
        setPowerUps([
          { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
          { type: "shield", icon: Shield, name: "Shield", active: true },
        ])
        break
      default:
        setPowerUps([])
        break
    }
  }, [quizType])

  // Timer Effect
  useEffect(() => {
    if ((quizType === "timed" || quizType === "quick") && timeLeft > 0 && !quizEnded) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !quizEnded && (quizType === "timed" || quizType === "quick")) {
      endQuiz()
    }
  }, [timeLeft, quizEnded, quizType, endQuiz])

  // Update Question Start Time on Question Change or Restart
  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex, restartTrigger])

  // Handle Reset When Questions or Quiz Type Changes
  useEffect(() => {
    // Reset only if there's no saved state and not in progress mode
    if (quizType !== 'progress') {
      const savedState = localStorage.getItem(localStorageKey)
      if (!savedState) {
        setUserAnswers(currentQuestions.map(() => ({ selectedOptions: [], correct: false, locked: false, timeSpent: 0 })))
        setCurrentQuestionIndex(0)
        setScore(0)
        setLives(3)
        setTimeLeft(quizType === 'timed' || quizType === 'quick' ? quizTime : 0)
        setPowerUps(() => {
          switch (quizType) {
            case 'timed':
            case 'quick':
              return [
                { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
                { type: "extraTime", icon: Clock, name: "Extra Time", active: true },
                { type: "shield", icon: Shield, name: "Shield", active: true },
              ]
            case 'practice':
              return [
                { type: "fiftyFifty", icon: Zap, name: "50/50", active: true },
                { type: "shield", icon: Shield, name: "Shield", active: true },
              ]
            default:
              return []
          }
        })
        setQuizEnded(false)
        setAvailableOptions([0, 1, 2, 3])
        setFeedback(null)
        setSelectedOptions([])
      }
    }
  }, [currentQuestions, quizType, quizTime, restartTrigger, localStorageKey])

  // If Quiz Ended, Show Result Screen
  if (quizEnded) {
    return (
      <ResultScreen
        score={score}
        totalQuestions={currentQuestions.length}
        handleRestart={restartQuiz}
        courseCode={courseCode}
        userAnswers={userAnswers}
        questions={currentQuestions}
      />
    )
  }

  const currentQuestion = currentQuestions[currentQuestionIndex]
  const isAnswerLocked = userAnswers[currentQuestionIndex]?.locked

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={onExit}
          variant="ghost"
          className="text-blue-300 hover:bg-blue-900 transition-colors duration-300 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
        </Button>
      </div>
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuizContent
              question={currentQuestion.question.replace(/^Option [A-Z]:\s*/, '')} // Remove "Option X: " prefix
              options={currentQuestion.shuffledOptions.map(option => option.replace(/^Option [A-Z]:\s*/, ''))} // Remove prefixes
              onAnswer={handleAnswer}
              timeLeft={timeLeft}
              maxTime={quizTime}
              lives={lives}
              powerUps={powerUps}
              onUsePowerUp={usePowerUp}
              quizType={quizType}
              currentScore={score}
              totalQuestions={currentQuestions.length}
              currentQuestionIndex={currentQuestionIndex}
              selectedOptions={selectedOptions}
              isAnswerLocked={isAnswerLocked}
            />
            <div className="flex justify-between mt-6">
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                onClick={saveAnswers}
                disabled={isAnswerLocked || selectedOptions.length === 0}
              >
                Save Answer
              </Button>
              <Button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === currentQuestions.length - 1}
                variant="outline"
              >
                Next
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
  )
}

// InteractiveQuiz Component
export default function InteractiveQuiz({
  quizType,
  courseName,
  onExit,
  questions,
  courseCode,
  quizTime = 300, // Default to 5 minutes (300 seconds) if not provided
  numQuestions,    // Optional number of questions
}: InteractiveQuizProps) {
  const router = useRouter();
  const handleExit = onExit || (() => router.back());

  // Select a subset of questions if numQuestions is provided
  const selectedQuestions: ProcessedQuestion[] = useMemo(() => {
    if (numQuestions) {
      return shuffleArray(questions).slice(0, Math.min(numQuestions, questions.length))
    }
    return questions
  }, [questions, numQuestions])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-6 lg:p-12">
      <ParticleBackground />
      <div className="w-full max-w-screen-xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          {courseName} Quiz
        </h1>
        <AnimatePresence mode="wait">
          {selectedQuestions && (
            <Quiz
              quizType={quizType}
              onExit={handleExit}
              questions={selectedQuestions}
              quizTime={quizTime} // Use user-defined quiz time or default
              courseName={courseName}
              courseCode={courseCode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
