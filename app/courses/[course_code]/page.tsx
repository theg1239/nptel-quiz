import QuizPortal from '@/components/QuizPortal';
import { getCourse, Course } from '@/lib/actions';
import { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ course_code: string }> 
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code } = await params;
    
    const course = await getCourse(course_code);
    
    const previousMetadata = await parent;
    
    const totalQuestions = course.weeks.reduce(
      (sum, week) => sum + (week.questions?.length || 0),
      0
    );

    const courseKeywords = [
      course.title,
      course.course_name,
      `${course.title} NPTEL`,
      `${course.course_name} course`,
      `${course.course_code} NPTEL`,
      `${course.title} practice questions`,
      `${course.course_name} mock test`,
      `NPTEL ${course.course_name} preparation`,
    ];

    return {
      title: `${course.title || course.course_name} - NPTEL Practice Questions | NPTELPrep`,
      description: `Practice with ${totalQuestions}+ interactive questions for ${course.title || course.course_name}. Prepare for NPTEL exams with our comprehensive quiz portal and boost your grades.`,
      keywords: [
        ...courseKeywords,
        "NPTEL quiz",
        "NPTEL exam preparation",
        "online quizzes",
        "practice tests",
        "NPTEL mock exams",
      ],
      openGraph: {
        title: `Practice Questions for ${course.title || course.course_name} | NPTELPrep`,
        description: `Access ${totalQuestions}+ practice questions for ${course.title || course.course_name}. Take quizzes, track progress, and ace your NPTEL exams.`,
        type: 'article',
        url: `${previousMetadata?.openGraph?.url || 'https://nptelprep.in'}/courses/${course_code}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${course.title || course.course_name} Practice Questions`,
        description: `Access ${totalQuestions}+ practice questions for ${course.title || course.course_name}. Take quizzes, track progress, and ace your NPTEL exams.`,
      },
    };
  } catch (error) {
    return {
      title: "NPTEL Course Practice | NPTELPrep",
      description: "Practice questions for NPTEL courses. Prepare for your exams with our interactive quiz portal.",
    };
  }
}

export default async function CoursePage({ params }: { params: Promise<{ course_code: string }> }) {
  const { course_code } = await params;

  try {
    const course = await getCourse(course_code);
    return <QuizPortal course={course} course_code={course_code} />;
  } catch (error) {
    return <p>Course not found</p>;
  }
}
