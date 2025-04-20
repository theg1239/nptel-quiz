'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Book, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import UnderConstructionModal from '@/components/under-construction-modal';
import { Course } from '@/types/index';

interface SearchComponentProps {
  courses: Course[];
}

const SearchComponent: React.FC<SearchComponentProps> = ({ courses }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Course[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 0 && courses.length > 0) {
        const filteredCourses = courses.filter(course =>
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSuggestions(filteredCourses.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, courses]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCourseSelection = (course: Course) => {
    if (course.question_count === 0 && course.video_count === 0 && course.transcript_count === 0) {
      setShowModal(true);
    } else {
      setSearchTerm('');
      setSuggestions([]);
      setIsSearchFocused(false);
      router.push(`/courses/${course.course_code}`);
    }
  };

  return (
    <>
      <div ref={searchContainerRef} className="relative">
        <div
          className={`relative flex items-center overflow-hidden rounded-xl transition-all duration-300 ${isSearchFocused ? 'shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500' : 'ring-1 ring-white/10'}`}
        >
          <Input
            type="text"
            placeholder="Search for courses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full border-none bg-white/5 p-4 pr-28 text-sm text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-0"
          />
          <div className="absolute bottom-0 right-0 top-0 flex items-center">
            <div
              className="group flex h-full cursor-pointer items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-5 transition-all duration-300 hover:from-indigo-700 hover:to-purple-700"
              onClick={() => {
                if (suggestions.length > 0) {
                  handleCourseSelection(suggestions[0]);
                }
              }}
            >
              <Search className="h-5 w-5 text-white" />
              <span className="hidden font-medium text-white sm:inline">Search</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isSearchFocused && suggestions.length > 0 && (
            <motion.div
              className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.map(course => (
                <motion.div
                  key={course.course_code}
                  className="border-b border-white/5 last:border-none"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <button
                    onClick={() => handleCourseSelection(course)}
                    className="group flex w-full items-center justify-between p-4 text-left transition-colors duration-150 hover:bg-white/10"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 rounded-lg bg-indigo-500/20 p-2 text-indigo-300">
                        <Book className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{course.course_name}</div>
                        <div className="text-sm text-blue-300">{course.course_code}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UnderConstructionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default SearchComponent;
