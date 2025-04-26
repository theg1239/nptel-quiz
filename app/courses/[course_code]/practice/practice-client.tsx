'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle2,
  Volume2,
  BookOpen,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  RotateCcw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import SpaceLoader from '@/components/space-loader';
import {
  initializeQuestionsWithFixedOrder,
  normalizeQuestion,
  Question,
} from '@/lib/utils/quizUtils';
import { getCourse } from '@/lib/actions/actions';
import ReportQuestion from '@/components/report-question';

interface Week {
  name: string;
  questions: Question[];
}

interface Course {
  course_code: string;
  course_name: string;
  question_count: number;
  weeks: Week[];
  request_count: string | number;
  title?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
}

interface Assignment {
  questions: {
    length: number;
  }[];
}

const sanitizeQuestion = (question: string): string => {
  return question.replace(/^(?:\d+[\.\)]?\s*)+/, '').trim();
};

const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="animate-float absolute rounded-full bg-blue-500 opacity-20"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 4 + 1}px`,
          height: `${Math.random() * 4 + 1}px`,
        }}
      />
    ))}
  </div>
);

const Logo = () => (
  <motion.div
    className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-6xl font-bold text-transparent"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    NPTEL Practice
  </motion.div>
);

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <motion.div
    className="flex flex-col items-center justify-center rounded-lg bg-gray-800 bg-opacity-50 p-6 shadow-lg"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    {icon}
    <h3 className="mt-2 text-lg font-semibold text-blue-300">{title}</h3>
    <p className="mt-1 text-3xl font-bold">{value.toLocaleString()}</p>
  </motion.div>
);

const getLabelAndText = (
  option: string | { option_number: string; option_text: string }
): { label: string; optionText: string } => {
  if (typeof option === 'object') {
    return {
      label: option.option_number,
      optionText: option.option_text,
    };
  }
  const labelMatch = option.match(/^([A-Z])[).:-]/i);
  const label = labelMatch ? labelMatch[1].toUpperCase() : '';
  const optionText = option.replace(/^[A-Z][).:-]/i, '').trim();
  return { label, optionText };
};

export default function PracticeClient({ courseCode }: { courseCode: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isReadAloudMode, setIsReadAloudMode] = useState(false);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await getCourse(courseCode);

        const sortedWeeks = response.weeks.slice().sort((a, b) => {
          const weekNumA = parseInt(a.name.match(/\d+/)?.[0] || '0');
          const weekNumB = parseInt(b.name.match(/\d+/)?.[0] || '0');
          return weekNumA - weekNumB;
        });

        const transformedCourse: Course = {
          course_code: response.course_code,
          course_name: response.course_name,
          title: response.course_name,
          request_count: response.request_count || 0,
          question_count:
            response.assignments?.reduce(
              (total: number, assignment: Assignment) => total + assignment.questions.length,
              0
            ) || 0,
          weeks: sortedWeeks.map(week => ({
            name: week.name,
            questions: week.questions.map((q: any) => {
              const partialQuestion = {
                question: typeof q === 'object' && 'question' in q ? (q.question as string) : '',
                question_text:
                  typeof q === 'object' && 'question_text' in q ? (q.question_text as string) : '',
                content_type:
                  typeof q === 'object' && 'content_type' in q
                    ? (q.content_type as 'mcq' | 'text')
                    : 'mcq',
                options: Array.isArray(q.options) ? q.options : [],
                answer: Array.isArray(q.answer) ? q.answer : [],
              };

              return normalizeQuestion({
                ...partialQuestion,
                question: partialQuestion.question || partialQuestion.question_text || '',
                question_text: partialQuestion.question_text || partialQuestion.question || '',
                content_type: partialQuestion.content_type || 'mcq',
              });
            }),
          })),
        };

        const courseMetadata: {
          totalWeeks: number;
          courseName: string;
          lastUpdated: string;
        } = {
          totalWeeks: transformedCourse.weeks.length,
          courseName: transformedCourse.course_name,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(`courseData_${courseCode}`, JSON.stringify(courseMetadata));

        setCourse(transformedCourse);
        if (transformedCourse.weeks.length > 0) {
          setSelectedWeek(transformedCourse.weeks[0].name);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseCode]);

  const sanitizedCourse = useMemo(() => {
    if (!course) return null;
    const sanitizedWeeks: Week[] = course.weeks.map(week => ({
      ...week,
      questions: initializeQuestionsWithFixedOrder(week.questions),
    }));
    return {
      ...course,
      weeks: sanitizedWeeks,
    };
  }, [course]);

  useEffect(() => {
    if (selectedWeek && !loading && !error) {
      try {
        const courseProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
        const weekProgress = JSON.parse(localStorage.getItem(`weekProgress_${courseCode}`) || '{}');

        weekProgress[selectedWeek] = true;
        localStorage.setItem(`weekProgress_${courseCode}`, JSON.stringify(weekProgress));

        const totalWeeks = sanitizedCourse?.weeks.length || 0;
        const viewedWeeks = Object.keys(weekProgress).length;
        const viewProgress = Math.round((viewedWeeks / totalWeeks) * 40);

        const quizProgress = courseProgress[courseCode] || 0;
        const weightedQuizProgress = Math.round(quizProgress * 0.6);

        const totalProgress = Math.min(100, Math.round(viewProgress + weightedQuizProgress));

        courseProgress[courseCode] = totalProgress;
        localStorage.setItem('courseProgress', JSON.stringify(courseProgress));
      } catch (error) {
        console.error('Error updating course progress:', error);
      }
    }
  }, [selectedWeek, courseCode, loading, error, sanitizedCourse?.weeks.length]);

  const handleWeekSelect = (weekName: string) => {
    setSelectedWeek(weekName);
    setIsNavOpen(false);
    setCurrentSpeechIndex(0);
  };

  const currentWeekIndex = course?.weeks.findIndex(w => w.name === selectedWeek) ?? -1;
  const totalWeeks = course?.weeks.length ?? 0;

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!course) return;
    const newIndex = direction === 'prev' ? currentWeekIndex - 1 : currentWeekIndex + 1;
    if (newIndex >= 0 && newIndex < course.weeks.length) {
      setSelectedWeek(course.weeks[newIndex].name);
      setCurrentSpeechIndex(0);
    }
  };

  useEffect(() => {
    if (isReadAloudMode && !loading && !error && sanitizedCourse && selectedWeek) {
      const weekQuestions = sanitizedCourse.weeks.find(
        week => week.name === selectedWeek
      )?.questions;
      if (!weekQuestions || weekQuestions.length === 0) return;

      const speakQuestion = (index: number) => {
        if (!synthRef.current) return;
        const question = weekQuestions[index];
        if (!question) return;

        const correctOptionIndices = question.answer.map(ans => {
          const idx = question.options.findIndex(option => {
            const { label } = getLabelAndText(option);
            return label === ans;
          });
          return idx;
        });

        const correctOptionsText = correctOptionIndices
          .map(optionIndex => {
            const option = question.options[optionIndex];
            const { optionText } = getLabelAndText(option);
            return `Option ${optionIndex + 1}: ${optionText}`;
          })
          .join('. ');

        const textToSpeak = `Question ${index + 1}: ${question.question}. ${correctOptionsText}.`;

        utteranceRef.current = new SpeechSynthesisUtterance(textToSpeak);
        utteranceRef.current.rate = 1.2;
        utteranceRef.current.onend = () => {
          setIsSpeaking(false);
          if (index + 1 < weekQuestions.length) {
            setCurrentSpeechIndex(index + 1);
          }
        };
        setIsSpeaking(true);
        synthRef.current.speak(utteranceRef.current);
      };

      if (!isSpeaking) {
        speakQuestion(currentSpeechIndex);
      }
    } else {
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
    }
  }, [
    isReadAloudMode,
    currentSpeechIndex,
    sanitizedCourse,
    selectedWeek,
    loading,
    error,
    isSpeaking,
  ]);

  const toggleReadAloudMode = () => {
    setIsReadAloudMode(!isReadAloudMode);
    setCurrentSpeechIndex(0);
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleFlashcardMode = () => {
    setIsFlashcardMode(!isFlashcardMode);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
  };

  const handleFlashcardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const navigateFlashcard = (direction: 'prev' | 'next') => {
    if (!course || !selectedWeek) return;

    const currentWeek = sanitizedCourse?.weeks.find(week => week.name === selectedWeek);
    if (!currentWeek || !currentWeek.questions.length) return;

    const newIndex =
      direction === 'prev'
        ? (currentFlashcardIndex - 1 + currentWeek.questions.length) % currentWeek.questions.length
        : (currentFlashcardIndex + 1) % currentWeek.questions.length;

    setCurrentFlashcardIndex(newIndex);
    setIsFlipped(false);
  };

  const getCurrentFlashcard = () => {
    if (!sanitizedCourse || !selectedWeek) return null;

    const currentWeek = sanitizedCourse.weeks.find(week => week.name === selectedWeek);
    if (!currentWeek || !currentWeek.questions.length) return null;

    return currentWeek.questions[currentFlashcardIndex];
  };

  const getCorrectAnswerText = (question: Question | null): string => {
    if (!question || !question.options) return '';

    return question.answer
      .map(ans => {
        const option = question.options.find(opt => {
          const { label } = getLabelAndText(opt);
          return label === ans;
        });

        if (!option) return '';

        const { optionText } = getLabelAndText(option);
        return optionText;
      })
      .join(', ');
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-gray-100">
      <header className="flex w-full max-w-5xl flex-col items-center space-y-4 p-4 md:p-6">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            className="flex items-center text-indigo-300 transition-colors hover:bg-indigo-900 hover:text-indigo-100"
            onClick={() => router.push(`/courses/${courseCode}`)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              className={`flex items-center text-indigo-300 transition-colors hover:bg-indigo-900 hover:text-indigo-100 ${isReadAloudMode ? 'bg-indigo-800/50' : ''}`}
              onClick={toggleReadAloudMode}
              disabled={isFlashcardMode}
            >
              <Volume2 className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">
                {isReadAloudMode ? 'Disable Read' : 'Read Aloud'}
              </span>
              <span className="sm:hidden">Read</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex items-center text-indigo-300 transition-colors hover:bg-indigo-900 hover:text-indigo-100 ${isFlashcardMode ? 'bg-indigo-800/50' : ''}`}
              onClick={toggleFlashcardMode}
              disabled={isReadAloudMode}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">
                {isFlashcardMode ? 'Exit Flashcards' : 'Flashcards'}
              </span>
              <span className="sm:hidden">Cards</span>
            </Button>
          </div>
          <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="md:hidden">
              <SheetHeader>
                <SheetTitle>Weeks</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {sanitizedCourse?.weeks.map((week: Week) => (
                  <Button
                    key={week.name}
                    variant="ghost"
                    className="w-full justify-start truncate text-left"
                    onClick={() => handleWeekSelect(week.name)}
                  >
                    {week.name}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <h1 className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-center text-2xl font-bold text-transparent md:text-3xl">
          {loading ? (
            <Skeleton className="h-10 w-64" />
          ) : isFlashcardMode ? (
            'Flashcard'
          ) : (
            'Practice'
          )}
        </h1>
      </header>

      <main className="flex w-full max-w-5xl flex-1 flex-col items-start gap-6 px-4 pt-2 md:flex-row md:px-6">
        {/* Sidebar for larger screens */}
        {!loading && !error && sanitizedCourse && !isFlashcardMode && (
          <div className="sticky top-6 hidden w-56 shrink-0 overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-md md:block">
            <div className="border-b border-gray-800 p-3">
              <h2 className="font-semibold text-indigo-300">Weeks</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-14rem)]">
              <div className="p-2">
                {sanitizedCourse.weeks.map(week => (
                  <Button
                    key={week.name}
                    variant={selectedWeek === week.name ? 'default' : 'ghost'}
                    className={`mb-1 w-full justify-start text-left text-sm ${
                      selectedWeek === week.name
                        ? 'bg-indigo-800/70 text-indigo-100'
                        : 'text-gray-300 hover:text-gray-100'
                    }`}
                    onClick={() => handleWeekSelect(week.name)}
                  >
                    <span className="truncate">{week.name}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className={`flex flex-1 flex-col ${isFlashcardMode ? 'w-full' : ''}`}>
          {isFlashcardMode && (
            <div className="mb-4 flex w-full items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigateWeek('prev')}
                disabled={currentWeekIndex <= 0}
                className="flex items-center text-indigo-300 transition-colors hover:bg-indigo-900 hover:text-indigo-100"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Previous Week</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <span className="truncate px-2 text-sm font-semibold text-indigo-300 md:text-lg">
                {selectedWeek}
              </span>
              <Button
                variant="outline"
                onClick={() => navigateWeek('next')}
                disabled={currentWeekIndex >= totalWeeks - 1}
                className="flex items-center text-indigo-300 transition-colors hover:bg-indigo-900 hover:text-indigo-100"
              >
                <span className="hidden sm:inline">Next Week</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isFlashcardMode ? (
              <motion.div
                key="flashcard-mode"
                className="flex w-full flex-col items-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex h-[calc(100vh-24rem)] w-full flex-col items-center md:h-[calc(100vh-20rem)]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <SpaceLoader size={100} />
                    </div>
                  ) : error ? (
                    <div className="rounded-lg bg-gray-900 bg-opacity-50 p-4 text-center text-pink-500 backdrop-blur-md">
                      {error}
                    </div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center">
                      <div className="mb-4 flex w-full items-center justify-between">
                        <span className="text-sm text-indigo-300">
                          Card {currentFlashcardIndex + 1} of{' '}
                          {sanitizedCourse?.weeks.find(week => week.name === selectedWeek)
                            ?.questions.length || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-pink-300 hover:bg-pink-900/30 hover:text-pink-100"
                          onClick={toggleFlashcardMode}
                        >
                          <X className="mr-1 h-4 w-4" />
                          <span className="hidden sm:inline">Exit Flashcards</span>
                          <span className="sm:hidden">Exit</span>
                        </Button>
                      </div>

                      <div className="relative flex w-full flex-grow items-center justify-center">
                        <button
                          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20 sm:p-3"
                          onClick={e => {
                            e.stopPropagation();
                            navigateFlashcard('prev');
                          }}
                        >
                          <ChevronLeft className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                        </button>

                        <motion.div
                          className="perspective-1000 h-[300px] w-full max-w-lg cursor-pointer sm:h-[400px] md:h-[450px]"
                          onClick={handleFlashcardFlip}
                          key={`${selectedWeek}-${currentFlashcardIndex}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="preserve-3d relative h-full w-full"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{
                              duration: 0.6,
                              type: 'spring',
                              stiffness: 260,
                              damping: 20,
                            }}
                          >
                            {/* Front of card (Question) */}
                            <motion.div className="backface-hidden absolute flex h-full w-full flex-col rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-800/90 to-purple-800/90 p-4 shadow-lg backdrop-blur-md sm:p-6">
                              <div className="absolute right-3 top-3 flex items-center text-xs text-indigo-300 opacity-70">
                                <span>Click to flip</span>
                                <RotateCcw className="ml-1 h-3 w-3" />
                              </div>

                              <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/20 sm:mb-6 sm:h-16 sm:w-16">
                                  <BookOpen className="h-6 w-6 text-indigo-300 sm:h-8 sm:w-8" />
                                </div>
                                <h3 className="mb-3 text-center text-lg font-medium text-indigo-100 sm:mb-4 sm:text-xl">
                                  Question
                                </h3>
                                <p className="max-h-[150px] overflow-y-auto break-words px-2 text-center text-base text-gray-200 sm:max-h-[250px] sm:text-lg md:max-h-[300px]">
                                  {getCurrentFlashcard()?.question}
                                </p>
                              </div>
                            </motion.div>

                            {/* Back of card (Answer) */}
                            <motion.div
                              className="backface-hidden absolute flex h-full w-full flex-col rounded-xl border border-green-500/30 bg-gradient-to-br from-green-800/90 to-blue-800/90 p-4 shadow-lg backdrop-blur-md sm:p-6"
                              style={{ transform: 'rotateY(180deg)' }}
                            >
                              <div className="absolute right-3 top-3 flex items-center text-xs text-green-300 opacity-70">
                                <span>Click to flip</span>
                                <RotateCcw className="ml-1 h-3 w-3" />
                              </div>

                              <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/20 sm:mb-6 sm:h-16 sm:w-16">
                                  <CheckCircle2 className="h-6 w-6 text-green-300 sm:h-8 sm:w-8" />
                                </div>
                                <h3 className="mb-3 text-center text-lg font-medium text-green-100 sm:mb-4 sm:text-xl">
                                  Answer
                                </h3>
                                <p className="max-h-[150px] overflow-y-auto break-words px-2 text-center text-base text-gray-200 sm:max-h-[250px] sm:text-lg md:max-h-[300px]">
                                  {getCorrectAnswerText(
                                    getCurrentFlashcard() ||
                                      ({
                                        options: [],
                                        answer: [],
                                        question: '',
                                        content_type: 'mcq',
                                      } as Question)
                                  )}
                                </p>
                              </div>
                            </motion.div>
                          </motion.div>
                        </motion.div>

                        <button
                          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20 sm:p-3"
                          onClick={e => {
                            e.stopPropagation();
                            navigateFlashcard('next');
                          }}
                        >
                          <ChevronRight className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex w-full justify-center">
                  <span className="text-sm text-indigo-300">
                    Card {currentFlashcardIndex + 1} of{' '}
                    {sanitizedCourse?.weeks.find(week => week.name === selectedWeek)?.questions
                      .length || 0}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="practice-mode"
                className="w-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="truncate text-lg font-semibold text-indigo-300">{selectedWeek}</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateWeek('prev')}
                      disabled={currentWeekIndex <= 0}
                      className="hidden h-8 text-indigo-300 hover:bg-indigo-900 hover:text-indigo-100 sm:flex"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateWeek('next')}
                      disabled={currentWeekIndex >= totalWeeks - 1}
                      className="hidden h-8 text-indigo-300 hover:bg-indigo-900 hover:text-indigo-100 sm:flex"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    <div className="flex gap-1 sm:hidden">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateWeek('prev')}
                        disabled={currentWeekIndex <= 0}
                        className="h-8 w-8 p-0 text-indigo-300 hover:bg-indigo-900 hover:text-indigo-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateWeek('next')}
                        disabled={currentWeekIndex >= totalWeeks - 1}
                        className="h-8 w-8 p-0 text-indigo-300 hover:bg-indigo-900 hover:text-indigo-100"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-16rem)] w-full overflow-y-auto">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <SpaceLoader size={100} />
                    </div>
                  ) : error ? (
                    <div className="rounded-lg bg-gray-900 bg-opacity-50 p-4 text-center text-pink-500 backdrop-blur-md">
                      {error}
                    </div>
                  ) : (
                    selectedWeek &&
                    sanitizedCourse && (
                      <Card className="overflow-hidden border-gray-800 bg-gray-900 bg-opacity-50 backdrop-blur-md">
                        <CardContent className="pt-6">
                          {sanitizedCourse.weeks
                            .find(week => week.name === selectedWeek)
                            ?.questions.map((question: Question, index: number) => (
                              <div key={index} className="mb-10 last:mb-6">
                                {question.content_type === 'text' ? (
                                  <>
                                    <h3 className="mb-2 break-words text-lg font-semibold text-gray-100 md:text-xl">
                                      {index + 1}. {question.question}
                                      <ReportQuestion questionText={question.question} variant="practice" />
                                    </h3>
                                    <div className="rounded-md border border-gray-700 bg-gray-800 bg-opacity-30 p-4 text-gray-300">
                                      <p className="whitespace-pre-line break-words">
                                        {question.question_text || 'No content available'}
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <h3 className="mb-3 break-words text-lg font-semibold text-gray-100 md:text-xl">
                                      {index + 1}. {question.question}
                                      <ReportQuestion questionText={question.question} variant="practice" />
                                    </h3>
                                    <ul className="space-y-3">
                                      {question.options.map((option, optionIndex: number) => {
                                        const { label, optionText } = getLabelAndText(option);
                                        const isCorrect = question.answer.includes(label);

                                        return (
                                          <li
                                            key={optionIndex}
                                            className={`rounded-md p-3 transition-colors ${
                                              isCorrect
                                                ? 'border border-green-600 bg-green-800 bg-opacity-30 text-green-300'
                                                : 'border border-gray-700 bg-gray-800 bg-opacity-30 hover:bg-gray-700'
                                            }`}
                                          >
                                            <div className="flex items-start">
                                              {isCorrect && (
                                                <CheckCircle2 className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                                              )}
                                              <span
                                                className={`${isCorrect ? 'text-green-300' : 'text-gray-300'} break-words`}
                                              >
                                                {`${label}. ${optionText}`}
                                              </span>
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </>
                                )}
                              </div>
                            ))}
                        </CardContent>
                      </Card>
                    )
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {!loading && !error && sanitizedCourse && (
        <div className="sticky bottom-0 left-0 right-0 mt-4 w-full bg-gray-900/80 p-3 backdrop-blur-md">
          <div className="mx-auto max-w-5xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-indigo-400">
                {`${currentWeekIndex + 1} / ${totalWeeks} weeks`}
              </span>
            </div>
            <Progress
              value={Math.round(((currentWeekIndex + 1) / totalWeeks) * 100)}
              className="h-2 bg-gray-700"
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
