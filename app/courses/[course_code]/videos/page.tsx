import { Metadata } from 'next'
import { getCourse } from '@/lib/actions'
import VideosClient from './videos-client'

export async function generateMetadata({ params }: { params: { course_code: string } }): Promise<Metadata> {
  const { course_code } = params
  const courseData = await getCourse(course_code)
  
  return {
    title: `${courseData?.title || 'Course'} Videos - NPTELPrep`,
    description: `Watch video lectures for ${courseData?.title || 'this course'}. Learn at your own pace with comprehensive video explanations.`,
  }
}

export default async function VideosPage({ params }: { params: { course_code: string } }) {
  const { course_code } = params
  const courseData = await getCourse(course_code)
  
  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center text-white">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p>Sorry, the course you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <VideosClient
      courseCode={course_code}
      courseName={courseData.title}
    />
  )
}