'use client';

import { Book, FileText, HelpCircle } from 'lucide-react'
import SearchComponent from '@/components/SearchComponent'
import StatCard from '@/components/StatCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Stats } from '@/lib/actions'
import { useParams } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { useTranslator } from '@/hooks/useTranslator';
import { TranslatedText, TranslatedTitle, TranslatedParagraph } from '@/components/TranslatedText';
// import { Logo } from '@/components/Logo';

interface SearchCourse {
  course_code: string
  course_name: string
  question_count: number
  video_count: number
  transcript_count: number
  weeks: string[] | null
  request_count: number
}

const LogoHeader = () => (
  <div className="flex justify-center items-center min-h-[100px] text-4xl font-bold">
    <span>
      <span>NPTEL</span>
      <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#253EE0] to-[#27BAEC]">
        Prep
      </span>
    </span>
  </div>
)

export default function IndexClient({ 
  courses,
  statsData 
}: { 
  courses: SearchCourse[], 
  statsData: Stats 
}) {
  const params = useParams();
  const { locale } = useTranslator();

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-6xl z-10">
          <div className="text-center mb-12">
            <LogoHeader />
            <TranslatedParagraph 
              text="Index.subtitle" 
              className="mt-4 text-xl text-blue-300"
            />
          </div>

          <SearchComponent courses={courses} />

          {statsData && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                icon={<Book className="h-10 w-10 text-blue-400" />}
                title={<TranslatedText text="Index.stats.totalCourses" />}
                value={statsData.total_courses_from_json}
              />
              <StatCard
                icon={<FileText className="h-10 w-10 text-green-400" />}
                title={<TranslatedText text="Index.stats.totalStudyMaterials" />}
                value={statsData.total_study_materials}
              />
              <StatCard
                icon={<HelpCircle className="h-10 w-10 text-yellow-400" />}
                title={<TranslatedText text="Index.stats.totalQuestions" />}
                value={statsData.total_questions}
              />
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="flex flex-col items-center">
              <Link href={`/${locale}/courses`}>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-300 shadow-lg hover:shadow-blue-500/50 mb-8"
                >
                  <TranslatedText text="Index.exploreCoursesButton" />
                </Button>
              </Link>
              
              <Link href={`/${locale}/about`}>
                <Button variant="ghost" className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/30">
                  <TranslatedText text="Index.aboutButton" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}