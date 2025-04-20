import { Metadata } from 'next';
import { Book, FileText, HelpCircle } from 'lucide-react';
import SearchComponent from '@/components/search';
import StatCard from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAllCourses, getStats } from '@/lib/actions/actions';
import { Stats } from '@/lib/actions/actions';

interface SearchCourse {
  course_code: string;
  course_name: string;
  question_count: number;
  video_count: number;
  transcript_count: number;
  weeks: string[] | null;
  request_count: number;
}

export const metadata: Metadata = {
  title: 'NPTELPrep - Free NPTEL Practice Questions & Study Materials',
  description:
    'Master NPTEL courses with our comprehensive learning platform. Access free practice quizzes, study materials, video lectures, discussion forums, and mock tests for all NPTEL courses.',
  keywords: [
    'NPTEL practice',
    'NPTEL quiz',
    'NPTEL study materials',
    'NPTEL mock test',
    'NPTEL course preparation',
    'NPTEL exam practice',
    'free NPTEL resources',
    'NPTEL video lectures',
    'NPTEL discussion forum',
    'NPTEL course materials',
  ],
  alternates: {
    canonical: 'https://nptelprep.in',
  },
};

const Logo = () => (
  <div className="flex min-h-[100px] items-center justify-center text-4xl font-bold">
    <span>
      <span>NPTEL</span>
      <span className="bg-gradient-to-tr from-[#253EE0] to-[#27BAEC] bg-clip-text text-transparent">
        Prep
      </span>
    </span>
  </div>
);

export default async function Page() {
  const placeholderStats: Stats = {
    total_courses_from_json: 2987,
    total_assignments: 11212,
    total_questions: 114546,
    total_study_materials: 150750,
  };

  let courses: SearchCourse[] = [];
  let statsData: Stats = placeholderStats;

  try {
    const [coursesData, fetchedStatsData] = await Promise.all([getAllCourses(), getStats()]);

    courses = coursesData.map(course => ({
      course_code: course.course_code,
      course_name: course.course_name || course.title || `Course ${course.course_code}`,
      question_count: course.question_count || 0,
      video_count: course.video_count || 0,
      transcript_count: course.transcript_count || 0,
      weeks: course.weeks
        ? course.weeks
            .filter(week => week && typeof week === 'object')
            .map(week => week.name || `Week ${course.weeks!.indexOf(week) + 1}`)
        : null,
      request_count: Number(course.request_count) || 0,
    }));

    if (
      typeof fetchedStatsData.total_courses_from_json === 'number' &&
      typeof fetchedStatsData.total_assignments === 'number' &&
      typeof fetchedStatsData.total_questions === 'number' &&
      typeof fetchedStatsData.total_study_materials === 'number'
    ) {
      statsData = fetchedStatsData;
    } else {
      console.error('Invalid stats data format. Using placeholder stats.');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    courses = [];
    statsData = placeholderStats;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 text-gray-100">
      {/* <ParticleBackground /> */}
      <div className="z-10 w-full max-w-6xl">
        <div className="mb-12 text-center">
          <Logo />
          <p className="mt-4 text-xl text-blue-300"></p>
        </div>

        <SearchComponent courses={courses} />

        {statsData && (
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={<Book className="h-10 w-10 text-blue-400" />}
              title="Total Courses"
              value={statsData.total_courses_from_json}
            />
            <StatCard
              icon={<FileText className="h-10 w-10 text-green-400" />}
              title="Total Study Materials"
              value={statsData.total_study_materials}
            />
            <StatCard
              icon={<HelpCircle className="h-10 w-10 text-yellow-400" />}
              title="Total Questions"
              value={statsData.total_questions}
            />
          </div>
        )}

        <div className="mt-16 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-3xl font-bold text-transparent"></h2>
          {/* <p className="text-xl text-blue-300 mb-8">
            Choose a course, take quizzes, and enhance your learning experience
          </p> */}
          <div className="flex flex-col items-center">
            <Link href="/courses">
              <Button className="mb-8 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors duration-300 hover:bg-blue-700 hover:shadow-blue-500/50">
                Explore Courses
              </Button>
            </Link>

            <Link href="/about">
              <Button
                variant="ghost"
                className="text-blue-300 hover:bg-blue-800/30 hover:text-blue-100"
              >
                About
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
