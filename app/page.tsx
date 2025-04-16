import { Metadata } from 'next'
import { Book, FileText, HelpCircle, Users, Video, Calendar, Trophy, Sparkles } from 'lucide-react'
import ParticleBackground from '@/components/ParticleBackground'
import SearchComponent from '@/components/SearchComponent'
import StatCard from '@/components/StatCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllCourses, getStats } from '@/lib/actions'
import { Stats } from '@/lib/actions'

interface SearchCourse {
  course_code: string
  course_name: string
  question_count: number
  weeks: string[] | null
  request_count: number
}

export const metadata: Metadata = {
  title: 'NPTELPrep',
  description: 'A comprehensive learning platform for NPTEL courses with quizzes, study materials, discussion forums, and more.',
}

const Logo = () => (
  <div className="flex justify-center items-center min-h-[100px] text-4xl font-bold">
    <span>
      <span>NPTEL</span>
      <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#253EE0] to-[#27BAEC]">
        Prep
      </span>
    </span>
  </div>
)

export default async function Page() {
  const placeholderStats: Stats = {
    total_courses_from_json: 2987,
    total_assignments: 11212,
    total_questions: 114546,
    total_study_materials: 150750,
  }

  let courses: SearchCourse[] = []
  let statsData: Stats = placeholderStats

  try {
    const [coursesData, fetchedStatsData] = await Promise.all([
      getAllCourses(),
      getStats()
    ])

    courses = coursesData.map(course => ({
      course_code: course.course_code,
      course_name: course.course_name || course.title || `Course ${course.course_code}`,
      question_count: course.question_count || 0,
      weeks: course.weeks 
        ? course.weeks
            .filter(week => week && typeof week === 'object')
            .map(week => week.name || `Week ${course.weeks!.indexOf(week) + 1}`)
        : null,
      request_count: Number(course.request_count) || 0
    }))
    
    if (
      typeof fetchedStatsData.total_courses_from_json === 'number' &&
      typeof fetchedStatsData.total_assignments === 'number' &&
      typeof fetchedStatsData.total_questions === 'number' &&
      typeof fetchedStatsData.total_study_materials === 'number'
    ) {
      statsData = fetchedStatsData
    } else {
      console.error('Invalid stats data format. Using placeholder stats.')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    courses = []
    statsData = placeholderStats
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="w-full max-w-6xl z-10">
        <div className="text-center mb-12">
          <Logo />
          <p className="mt-4 text-xl text-blue-300">
          </p>
        </div>

        <SearchComponent courses={courses} />

        {statsData && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          </h2>
          {/* <p className="text-xl text-blue-300 mb-8">
            Choose a course, take quizzes, and enhance your learning experience
          </p> */}
          <Link href="/courses">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-300 shadow-lg hover:shadow-blue-500/50"
            >
              Explore Courses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
