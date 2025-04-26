'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book,
  Clock,
  Zap,
  BarChart,
  ArrowRight,
  BookOpen,
  Award,
  ChevronLeft,
  Film,
  Users,
  Calendar,
  ConstructionIcon,
  X,
  Lightbulb,
  GroupIcon,
  UsersRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import FeatureAnnounce from '@/components/feature-announce';

interface Course {
  title?: string;
  course_name?: string;
  request_count: string | number;
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

type QuizOptionType = 'practice' | 'timed' | 'quick' | 'progress' | 'weekly';

const VALID_QUIZ_TYPES = ['practice', 'timed', 'quick', 'progress', 'weekly'];

export default function Component(
  { course, course_code }: QuizPortalProps = {
    course: { title: 'Sample Course', request_count: '0', weeks: [] },
    course_code: 'SAMPLE101',
  }
) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState<QuizOptionType | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [quizTime, setQuizTime] = useState<number>(30);
  const [progress, setProgress] = useState<number>(0);
  const [weekSelections, setWeekSelections] = useState<Record<string, boolean>>({});
  const [showWeekSelector, setShowWeekSelector] = useState<boolean>(false);
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(true);

  const totalQuestions = (course?.weeks || []).reduce(
    (acc, week) => acc + week.questions.length,
    0
  );

  useEffect(() => {
    const storedProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    const progressPercentage = storedProgress[course_code] || 0;
    setProgress(progressPercentage);
  }, [course_code, totalQuestions]);

  useEffect(() => {
    if (course?.weeks) {
      const initialSelections: Record<string, boolean> = {};
      course.weeks.forEach(week => {
        initialSelections[week.name] = false;
      });
      setWeekSelections(initialSelections);
    }
  }, [course]);

  useEffect(() => {
    if (course?.weeks?.length > 0) {
      console.log(`Course has ${course.weeks.length} weeks available for selection`);
    }
  }, [course]);

  const handleStartQuiz = () => {
    if (totalQuestions === 0) {
      alert('No questions available for this course.');
      return;
    }
    if (!VALID_QUIZ_TYPES.includes(selectedQuiz || '')) {
      console.error('Invalid quiz type selected.');
      return;
    }

    let finalQuestionCount = questionCount;
    let finalQuizTime = quizTime;

    if (selectedQuiz === 'quick') {
      finalQuestionCount = 10;
      finalQuizTime = 5;
    } else if (selectedQuiz === 'practice') {
      finalQuestionCount = totalQuestions;
      finalQuizTime = 0;
    } else if (selectedQuiz === 'progress') {
      finalQuestionCount = Math.min(20, totalQuestions);
      finalQuizTime = finalQuestionCount * 1;
    }

    const quizSettings = {
      questionCount: finalQuestionCount,
      quizTime: finalQuizTime,
    };
    localStorage.setItem('quizSettings', JSON.stringify(quizSettings));

    const quizPath = `/courses/${course_code}/quiz/${selectedQuiz}`;
    router.push(quizPath);
  };

  const handleStartPracticeMode = () => {
    router.push(`/courses/${course_code}/practice`);
  };

  const toggleWeekSelection = (weekName: string) => {
    setWeekSelections(prev => ({
      ...prev,
      [weekName]: !prev[weekName],
    }));
  };

  const getSelectedWeeksCount = () => {
    return Object.values(weekSelections).filter(Boolean).length;
  };

  const handleStartWeeklyQuiz = () => {
    if (totalQuestions === 0) {
      alert('No questions available for this course.');
      return;
    }

    const selectedWeeks = course.weeks.filter(week => weekSelections[week.name]);

    if (selectedWeeks.length === 0) {
      alert('Please select at least one week to start the quiz.');
      return;
    }

    const selectedWeeksQuestions = selectedWeeks.reduce(
      (acc, week) => [
        ...acc,
        ...week.questions.map(question => ({
          ...question,
          week_name: week.name,
          options: question.options || [],
          answer: question.answer || [],
          content_type: 'mcq',
        })),
      ],
      [] as (Course['weeks'][0]['questions'][0] & { week_name: string })[]
    );

    if (selectedWeeksQuestions.length === 0) {
      alert('No questions found in the selected weeks. Please select different weeks.');
      return;
    }

    localStorage.setItem(`weekSelections_${course_code}`, JSON.stringify(weekSelections));

    const timeLimit = selectedWeeksQuestions.length;

    const quizSettings = {
      questionCount: selectedWeeksQuestions.length,
      quizTime: timeLimit,
      weekSelections,
      selectedWeeksQuestions,
      enableTimer: true,
      timerSeconds: timeLimit * 60,
    };

    localStorage.setItem('quizSettings', JSON.stringify(quizSettings));

    const quizPath = `/courses/${course_code}/quiz/weekly`;
    router.push(quizPath);
  };

  const quizOptions = [
    {
      icon: Book,
      title: 'Practice Quiz',
      description: 'Unlimited time, all questions at your own pace',
      onClick: () => setSelectedQuiz('practice'),
    },
    {
      icon: Clock,
      title: 'Timed Quiz',
      description: 'Set your own time and question count',
      onClick: () => setSelectedQuiz('timed'),
    },
    {
      icon: Zap,
      title: 'Quick Review',
      description: 'Quick 10-question quiz with limited time',
      onClick: () => setSelectedQuiz('quick'),
    },
    {
      icon: BarChart,
      title: 'Weekly Quiz',
      description: 'Select specific weeks to study',
      onClick: () => {
        setSelectedQuiz('weekly');
        setShowWeekSelector(true);
      },
    },
  ];

  const learningFeatures = [
    {
      icon: BookOpen,
      title: 'Study Materials',
      description: 'Access lecture notes and supplementary content',
      onClick: () => router.push(`/courses/${course_code}/materials`),
    },
    {
      icon: Film,
      title: 'Video Lectures',
      description: 'Watch video explanations of key concepts',
      onClick: () => router.push(`/courses/${course_code}/videos`),
    },
    {
      icon: Calendar,
      title: 'Study Planner',
      description: 'Create personalized study schedules',
      onClick: () => router.push(`/courses/${course_code}/study-planner`),
    },
    {
      icon: UsersRound,
      title: 'Discussions',
      description: 'Ask doubts and course feedback',
      onClick: () => router.push(`/courses/${course_code}/discussions`),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 text-gray-100 md:p-6">
      <FeatureAnnounce
        id="discussion-feature"
        title="New Discussions"
        description="Post queries or talk about the course"
        buttonText="Try it now"
        icon={<UsersRound className="h-9 w-9 text-purple-200" />}
        maxViews={2}
        onClose={() => setShowAnnouncement(false)}
      />

      <div className="mb-6 flex w-full max-w-6xl items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/courses')}
          className="flex items-center text-violet-300 hover:bg-violet-800"
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
        </Button>

        <div className="flex-1 text-center">
          <h1 className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text py-2 text-3xl font-bold text-transparent md:text-3xl">
            {course.title || course.course_name}
          </h1>
          <p className="text-lg text-violet-300 md:text-xl">Interactive Learning Portal</p>
        </div>
      </div>

      <main className="relative w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <Card className="border-violet-700 bg-gray-800 bg-opacity-40 backdrop-blur-sm md:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="mb-2 flex items-center gap-2 text-xl text-violet-300">
                <Award className="h-5 w-5 text-yellow-400" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-6 pt-4">
              <div className="mb-3 flex justify-between text-sm text-violet-200">
                <span>Course Completion</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-violet-900" colorClass="bg-violet-400" />
            </CardContent>
          </Card>

          <Card className="border-violet-700 bg-gray-800 bg-opacity-40 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-xl text-violet-300">
                <BookOpen className="h-5 w-5 text-emerald-400" />
                Practice Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-violet-200">
                All questions with answers, flashcards.
              </p>
              <Button
                className="flex w-full items-center justify-center bg-emerald-600 text-sm hover:bg-emerald-700"
                onClick={handleStartPracticeMode}
                disabled={totalQuestions === 0}
              >
                Start Practice <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <Card className="border-violet-700 bg-gray-800 bg-opacity-40 backdrop-blur-sm md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-violet-300">Quiz Options</CardTitle>
              <CardDescription className="text-sm text-violet-200">
                Choose your preferred quiz mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {quizOptions.map((option, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className={`flex h-auto w-full flex-col items-center border-violet-600 bg-violet-900 bg-opacity-50 p-3 text-left hover:border-violet-400 hover:bg-opacity-75 ${
                            selectedQuiz === option.title.toLowerCase().split(' ')[0]
                              ? 'ring-2 ring-violet-400'
                              : ''
                          }`}
                          onClick={option.onClick}
                        >
                          <option.icon className="mb-2 h-6 w-6 text-violet-300" />
                          <div className="text-sm font-semibold text-violet-200">
                            {option.title}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="border-violet-600 bg-violet-800 text-violet-100"
                      >
                        <p className="text-xs">{option.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-violet-700 bg-gray-800 bg-opacity-40 backdrop-blur-sm md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-violet-300">
                Learning Features
              </CardTitle>
              <CardDescription className="text-sm text-violet-200">
                Explore additional study options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {learningFeatures.map((feature, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex h-auto w-full flex-col items-center border-violet-600 bg-violet-900 bg-opacity-50 p-3 text-left hover:border-violet-400 hover:bg-opacity-75"
                          onClick={feature.onClick}
                        >
                          <feature.icon className="mb-2 h-6 w-6 text-violet-300" />
                          <div className="text-sm font-semibold text-violet-200">
                            {feature.title}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="border-violet-600 bg-violet-800 text-violet-100"
                      >
                        <p className="text-xs">{feature.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {selectedQuiz === 'weekly' && showWeekSelector && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-md overflow-hidden rounded-2xl border border-violet-600 bg-gray-800/95 shadow-xl backdrop-blur-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center justify-between border-b border-violet-700/50 p-4">
                  <h3 className="text-xl font-semibold text-violet-300">Select Weeks</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 text-violet-300 hover:text-violet-100"
                    onClick={() => setShowWeekSelector(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-4">
                  <div className="mb-4 grid grid-cols-1 gap-2">
                    {course?.weeks && course.weeks.length > 0 ? (
                      course.weeks.map(week => (
                        <div
                          key={week.name}
                          className="flex items-center space-x-3 rounded-lg bg-violet-800/50 p-3 transition-colors hover:bg-violet-800/70"
                        >
                          <Checkbox
                            id={`week-${week.name}`}
                            checked={weekSelections[week.name] || false}
                            onCheckedChange={() => toggleWeekSelection(week.name)}
                            className="data-[state=checked]:bg-violet-500"
                          />
                          <label
                            htmlFor={`week-${week.name}`}
                            className="flex-1 cursor-pointer text-sm font-medium text-violet-200"
                          >
                            {week.name} ({week.questions?.length || 0} questions)
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-violet-300">
                        No weeks available for this course.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-violet-700/50 bg-violet-900/30 p-4">
                  <div className="text-sm text-violet-300">
                    {getSelectedWeeksCount()} weeks selected
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-violet-500 text-violet-300 hover:bg-violet-800"
                      onClick={() => setShowWeekSelector(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-700"
                      disabled={getSelectedWeeksCount() === 0}
                      onClick={handleStartWeeklyQuiz}
                    >
                      Start Quiz
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {selectedQuiz && selectedQuiz !== 'weekly' && (
            <motion.div
              key="selected-quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-40 md:fixed md:inset-0 md:flex md:items-center md:justify-center md:bg-black/40 md:p-4"
            >
              <Card className="rounded-t-2xl border-violet-700 bg-gray-800/95 shadow-xl backdrop-blur-md md:w-full md:max-w-md md:rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-violet-300">
                      {selectedQuiz === 'practice' && 'Practice Quiz'}
                      {selectedQuiz === 'timed' && 'Timed Quiz'}
                      {selectedQuiz === 'quick' && 'Quick Review'}
                      {selectedQuiz === 'progress' && 'Progress Test'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuiz(null)}
                      className="h-8 w-8 rounded-full p-0 text-violet-300 hover:text-violet-100 md:hidden"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <CardDescription className="text-sm text-violet-200">
                    {selectedQuiz === 'practice' &&
                      'All questions with unlimited time and live feedback.'}
                    {selectedQuiz === 'timed' &&
                      'Set your preferred quiz time and number of questions.'}
                    {selectedQuiz === 'quick' && 'Quick 10-question quiz with 5-minute limit.'}
                    {selectedQuiz === 'progress' && "Focus on questions you've previously missed."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="custom-scrollbar">
                  {selectedQuiz === 'timed' && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="questionCount"
                          className="mb-1 block text-sm text-violet-200"
                        >
                          Questions (1 - {totalQuestions}):
                        </label>
                        <input
                          id="questionCount"
                          type="number"
                          min={1}
                          max={totalQuestions}
                          value={questionCount}
                          onChange={e => setQuestionCount(Number(e.target.value))}
                          className="w-full rounded border border-violet-600 bg-violet-900 p-2 text-sm text-violet-100 focus:border-violet-400 focus:ring focus:ring-violet-400 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="quizTime" className="mb-1 block text-sm text-violet-200">
                          Time Limit (minutes):
                        </label>
                        <input
                          id="quizTime"
                          type="number"
                          min={1}
                          value={quizTime}
                          onChange={e => setQuizTime(Number(e.target.value))}
                          className="w-full rounded border border-violet-600 bg-violet-900 p-2 text-sm text-violet-100 focus:border-violet-400 focus:ring focus:ring-violet-400 focus:ring-opacity-50"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedQuiz(null)}
                      className="hidden border-violet-500 bg-transparent text-sm text-violet-300 hover:bg-violet-900 hover:text-violet-100 md:flex"
                    >
                      Back to Options
                    </Button>
                    <Button
                      className="flex items-center bg-violet-600 text-sm hover:bg-violet-700 md:ml-auto"
                      onClick={handleStartQuiz}
                    >
                      Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
