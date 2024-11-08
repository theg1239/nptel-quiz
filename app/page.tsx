// app/page.tsx

import { Metadata } from 'next'
import { Book, FileText, HelpCircle } from 'lucide-react'
import ParticleBackground from '@/components/ParticleBackground'
import Logo from '@/components/Logo'
import SearchComponent from '@/components/SearchComponent'
import StatCard from '@/components/StatCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import MotionDivWrapper from '@/components/MotionDivWrapper'

interface Stats {
  total_courses_from_json: number
  total_assignments: number
  total_questions: number
}

interface Course {
  course_code: string
  course_name: string
  question_count: number
  weeks: string[] | null
  request_count: number
}

export const metadata: Metadata = {
  title: 'NPTEL Prep',
  description: 'Prepare for NPTEL courses with quizzes and assignments.',
}

export default async function Page() {
  // Placeholder stats in case of error
  const placeholderStats: Stats = {
    total_courses_from_json: 2987,
    total_assignments: 11212,
    total_questions: 114546,
  }

  let courses: Course[] = []
  let statsData: Stats = placeholderStats

  try {
    // Fetch courses and counts with ISR: revalidate every 60 seconds
    const [coursesRes, statsRes] = await Promise.all([
      fetch('https://api.nptelprep.in/courses', { next: { revalidate: 60 } }),
      fetch('https://api.nptelprep.in/counts', { next: { revalidate: 60 } }),
    ])

    if (!coursesRes.ok) {
      throw new Error(`Failed to fetch courses: ${coursesRes.status}`)
    }

    if (!statsRes.ok) {
      throw new Error(`Failed to fetch stats: ${statsRes.status}`)
    }

    const coursesData: { courses: Course[] } = await coursesRes.json()
    const fetchedStatsData: any = await statsRes.json()

    // Validate coursesData
    courses = Array.isArray(coursesData.courses) ? coursesData.courses : []

    // Validate fetchedStatsData has required fields
    if (
      typeof fetchedStatsData.total_courses_from_json === 'number' &&
      typeof fetchedStatsData.total_assignments === 'number' &&
      typeof fetchedStatsData.total_questions === 'number'
    ) {
      statsData = {
        total_courses_from_json: fetchedStatsData.total_courses_from_json,
        total_assignments: fetchedStatsData.total_assignments,
        total_questions: fetchedStatsData.total_questions,
      }
    } else {
      console.error('Invalid stats data format. Using placeholder stats.')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    // Use placeholderStats
    courses = []
    statsData = placeholderStats
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="w-full max-w-6xl z-10">
        {/* Animated Header */}
        <MotionDivWrapper
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Logo />
          <p className="mt-4 text-xl text-blue-300">
            {/* Optional subtitle or description */}
          </p>
        </MotionDivWrapper>

        {/* Search Component */}
        <SearchComponent courses={courses} />

        {/* Statistics Section */}
        {statsData && (
          <MotionDivWrapper
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <StatCard
              icon={<Book className="h-10 w-10 text-blue-400" />}
              title="Total Courses"
              value={statsData.total_courses_from_json}
            />
            <StatCard
              icon={<FileText className="h-10 w-10 text-green-400" />}
              title="Total Assignments"
              value={statsData.total_assignments}
            />
            <StatCard
              icon={<HelpCircle className="h-10 w-10 text-yellow-400" />}
              title="Total Questions"
              value={statsData.total_questions}
            />
          </MotionDivWrapper>
        )}

        {/* Call-to-Action Section */}
        <MotionDivWrapper
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            {/* Optional heading */}
          </h2>
          <p className="text-xl text-blue-300 mb-8">
            Choose a course, take quizzes, and enhance your learning experience
          </p>
          <Link href="/courses">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-blue-500/50"
            >
              Explore Courses
            </Button>
          </Link>
        </MotionDivWrapper>
      </div>
    </div>
  )
}
