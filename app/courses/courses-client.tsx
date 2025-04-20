'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Search, Star, ArrowLeft, ArrowRight, Zap, Users, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Course } from '@/lib/actions/actions';
import Logo from '@/components/gradient-logo';

const ITEMS_PER_PAGE = 9;

interface CourseCardProps {
  course: Course;
  viewMode: 'grid' | 'list';
  handleCourseSelection: (course: Course) => void;
}

const CourseCard = React.memo(({ course, viewMode, handleCourseSelection }: CourseCardProps) => {
  return (
    <Card
      onClick={() => handleCourseSelection(course)}
      className="group relative cursor-pointer overflow-hidden border-gray-700/50 bg-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-gray-800/70"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            <Book className="h-5 w-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-100 transition-colors group-hover:text-blue-300">
              {course.course_name || course.title}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-lg py-1">
            <Users className="mb-1 h-4 w-4 text-blue-400" />
            <p className="text-sm font-semibold text-gray-200">{course.request_count}</p>
            <p className="hidden text-xs text-gray-400 sm:block">Students</p>
          </div>
          <div className="flex flex-col items-center rounded-lg py-1">
            <Zap className="mb-1 h-4 w-4 text-blue-400" />
            <p className="text-sm font-semibold text-gray-200">{course.question_count}</p>
            <p className="hidden text-xs text-gray-400 sm:block">Questions</p>
          </div>
          <div className="flex flex-col items-center rounded-lg py-1">
            <Award className="mb-1 h-4 w-4 text-blue-400" />
            <p className="text-sm font-semibold text-gray-200">{course.video_count}</p>
            <p className="hidden text-xs text-gray-400 sm:block">Videos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CourseCard.displayName = 'CourseCard';

export default function CourseListClient({ initialCourses }: { initialCourses: Course[] }) {
  const [courses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'popular' | 'questions'>('popular');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => {
        const matchesSearch =
          (course.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.course_code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        if (selectedSort === 'popular') return Number(b.request_count) - Number(a.request_count);
        if (selectedSort === 'questions')
          return Number(b.question_count) - Number(a.question_count);
        return 0;
      });
  }, [searchTerm, courses, selectedSort]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  }, [filteredCourses.length]);

  const currentCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, currentPage]);

  const handleCourseSelection = useCallback(
    (course: Course) => {
      if (Number(course.question_count) === 0) {
        setShowModal(true);
      } else {
        router.push(`/courses/${course.course_code}`);
      }
    },
    [router]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSort]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage === currentPage || isTransitioning) return;

      setIsTransitioning(true);
      setCurrentPage(newPage);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    },
    [currentPage, isTransitioning]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
        duration: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100">
      <div className="w-full flex-none space-y-4 px-4 pt-3 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-full border-gray-700 bg-gray-800/50 py-1.5 pl-9 pr-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              size={16}
            />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant={selectedSort === 'popular' ? 'default' : 'ghost'}
            onClick={() => setSelectedSort('popular')}
            className="w-32 text-gray-300"
            size="sm"
          >
            <Star className="mr-2 h-4 w-4" />
            Popular
          </Button>
          <Button
            variant={selectedSort === 'questions' ? 'default' : 'ghost'}
            onClick={() => setSelectedSort('questions')}
            className="w-32 text-gray-300"
            size="sm"
          >
            <Zap className="mr-2 h-4 w-4" />
            Questions
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-4 pb-2 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full max-w-7xl flex-col">
          <div className="relative min-h-0 flex-1">
            <AnimatePresence
              mode="wait"
              initial={false}
              onExitComplete={() => setIsTransitioning(false)}
            >
              <motion.div
                key={`course-container-${currentPage}-${selectedSort}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="no-scrollbar absolute inset-0 grid grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2 lg:grid-cols-3"
              >
                {currentCourses.map(course => (
                  <motion.div
                    key={course.course_code}
                    className="h-fit"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <CourseCard
                      course={course}
                      viewMode="grid"
                      handleCourseSelection={handleCourseSelection}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-none pt-2">
            <div className="mx-auto max-w-lg">
              <div className="flex items-center justify-between rounded-lg p-2 backdrop-blur-sm">
                <Button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isTransitioning}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-gray-400">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0 || isTransitioning}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
