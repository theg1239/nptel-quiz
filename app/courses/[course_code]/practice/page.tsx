import { Metadata, ResolvingMetadata } from 'next'
import { getCourse } from '@/lib/actions'
import PracticeClient from './practice-client'

export async function generateMetadata({ 
  params 
}: { 
  params: { course_code: string }
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code } = params;
    
    const course = await getCourse(course_code);
    
    const totalQuestions = course.weeks.reduce(
      (sum, week) => sum + (week.questions?.length || 0),
      0
    );

    const title = `Practice ${course.title || course.course_name} Questions`;
    const description = `Practice ${totalQuestions}+ questions for ${course.title || course.course_name}. Interactive practice mode with week-by-week progression and read-aloud feature.`;

    return {
      title: `${title} | NPTELPrep`,
      description,
      keywords: [
        course.title,
        course.course_name,
        `${course.title} practice`,
        `${course.course_name} questions`,
        `${course.course_code} practice mode`,
        `NPTEL ${course.course_name} practice`,
        "NPTEL practice questions",
        "NPTEL exam preparation",
        "interactive practice mode"
      ],
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://nptelprep.in/courses/${course_code}/practice`,
      },
    };
  } catch (error) {
    return {
      title: "NPTEL Practice Questions | NPTELPrep",
      description: "Practice NPTEL course questions in an interactive, week-by-week format. Prepare for your exams effectively.",
    };
  }
}

export default function PracticePage({ params }: { params: { course_code: string } }) {
  return <PracticeClient courseCode={params.course_code} />;
}
