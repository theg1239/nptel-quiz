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
          url: '/og-image.jpg',
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
  return <PracticeClient courseCode={course_code} />;
}
