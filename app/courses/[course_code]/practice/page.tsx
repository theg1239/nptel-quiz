import { Metadata, ResolvingMetadata } from 'next';
import { getCourse } from '@/lib/actions/actions';
import PracticeClient from './practice-client';

type Params = { params: Promise<{ course_code: string }> };

export async function generateMetadata(
  { params }: Params,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { course_code } = await params;
    const course = await getCourse(course_code);

    const sortedWeeks = [...course.weeks].sort((a, b) => {
      const aIndex = typeof a.name === 'number' ? a.name : Number(a.name);
      const bIndex = typeof b.name === 'number' ? b.name : Number(b.name);
      return aIndex - bIndex;
    });

    const totalQuestions = sortedWeeks.reduce(
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
        'free NPTEL quiz',
      ],
      alternates: {
        canonical: `https://nptelprep.in/courses/${course_code}/practice`,
      },
      openGraph: {
        title: `Practice ${course.title || course.course_name} - Interactive NPTEL Quiz Portal`,
        description: `📚 Master ${course.title || course.course_name} with ${totalQuestions}+ practice questions. Personalized feedback, progress tracking, and comprehensive explanations. Start practicing now!`,
        type: 'article',
        url: `https://nptelprep.in/courses/${course_code}/practice`,
        images: [
          {
            url: '/og-image.png',
            width: 1200,
            height: 630,
            alt: `Practice ${course.title || course.course_name} NPTEL Quiz`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Practice ${course.title || course.course_name} NPTEL Quiz`,
        description: `✨ Interactive practice mode with ${totalQuestions}+ questions. Master your NPTEL course with our comprehensive quiz platform.`,
      },
    };
  } catch (error) {
    return {
      title: 'NPTEL Practice Questions | NPTELPrep',
      description:
        'Practice NPTEL course questions in an interactive, week-by-week format. Get instant feedback and track your progress. Prepare effectively for your NPTEL exams.',
    };
  }
}

export default async function PracticePage({ params }: Params) {
  const { course_code } = await params;
  const course = await getCourse(course_code);

  const sortedWeeks = [...course.weeks].sort((a, b) => {
    const aIndex = typeof a.name === 'number' ? a.name : Number(a.name);
    const bIndex = typeof b.name === 'number' ? b.name : Number(b.name);
    return aIndex - bIndex;
  });

  const totalQuestions = sortedWeeks.reduce((sum, week) => sum + (week.questions?.length || 0), 0);

  if (totalQuestions === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="rounded-lg bg-gray-800 bg-opacity-50 p-8 text-center backdrop-blur-md">
          <h1 className="mb-4 text-2xl font-bold text-indigo-300">No Questions Available</h1>
          <p className="mb-6 text-gray-300">
            This course does not have any practice questions yet.
          </p>
          <a
            href={`/courses/${course_code}`}
            className="inline-block rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Return to Course
          </a>
        </div>
      </div>
    );
  }

  return <PracticeClient courseCode={course_code} />;
}
