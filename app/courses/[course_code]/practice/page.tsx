import { Metadata, ResolvingMetadata } from 'next'
import { getCourse } from '@/lib/actions'
import PracticeClient from './practice-client'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ course_code: string }> 
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code } = await params;
    const course = await getCourse(course_code);
    
    const totalQuestions = course.weeks.reduce(
      (sum, week) => sum + (week.questions?.length || 0),
      0
    );

    const title = `Practice ${course.title || course.course_name} NPTEL Questions & Quiz`;
    const description = `💡 Access ${totalQuestions}+ practice questions for ${course.title || course.course_name}. Interactive weekly quizzes, instant feedback, and personalized progress tracking. Master your NPTEL course with our comprehensive practice platform.`;

    return {
      title,
      description,
      keywords: [
        course.course_name,
        `${course.title} practice`,
        `${course.course_name} quiz`,
        `${course.course_code} practice questions`,
        `NPTEL ${course.course_name} quiz`,
        'NPTEL practice questions',
        'NPTEL exam preparation',
        'NPTEL mock test',
        'NPTEL weekly quiz',
        'NPTEL interactive practice',
        'free NPTEL quiz'
      ],
      alternates: {
        canonical: `https://nptelprep.in/courses/${course_code}/practice`
      },
      openGraph: {
        title: `Practice ${course.title || course.course_name} - Interactive NPTEL Quiz Portal`,
        description: `📚 Master ${course.title || course.course_name} with ${totalQuestions}+ practice questions. Personalized feedback, progress tracking, and comprehensive explanations. Start practicing now!`,
        type: 'article',
        url: `https://nptelprep.in/courses/${course_code}/practice`,
        images: [{
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `Practice ${course.title || course.course_name} NPTEL Quiz`
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `Practice ${course.title || course.course_name} NPTEL Quiz`,
        description: `✨ Interactive practice mode with ${totalQuestions}+ questions. Master your NPTEL course with our comprehensive quiz platform.`
      }
    };
  } catch (error) {
    return {
      title: "NPTEL Practice Questions | NPTELPrep",
      description: "Practice NPTEL course questions in an interactive, week-by-week format. Get instant feedback and track your progress. Prepare effectively for your NPTEL exams.",
    };
  }
}

export default async function PracticePage({ params }: { params: Promise<{ course_code: string }> }) {
  const { course_code } = await params;
  const course = await getCourse(course_code);
  const totalQuestions = course.weeks.reduce((sum, week) => sum + (week.questions?.length || 0), 0);
  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-indigo-300 mb-4">No Questions Available</h1>
          <p className="text-gray-300 mb-6">This course does not have any practice questions yet.</p>
          <a
            href={`/courses/${course_code}`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Course
          </a>
        </div>
      </div>
    );
  }
  return <PracticeClient courseCode={course_code} />;
}
