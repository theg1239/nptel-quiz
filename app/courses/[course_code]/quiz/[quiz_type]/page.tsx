import { Metadata } from 'next';
import { getCourse } from '@/lib/actions/actions';
import InteractiveQuiz from '@/components/interactive-quiz';
import { Question as QuizQuestion, QuizType } from '@/types/quiz';
import { Question as UtilsQuestion, normalizeQuestion } from '@/lib/utils/quizUtils';

interface Assignment {
  questions: Array<{
    question_text: string;
    options: Array<{ option_number: string; option_text: string }>;
    correct_option: string;
  }>;
  week_number: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course_code: string }>;
}): Promise<Metadata> {
  const { course_code } = await params;

  try {
    const course = await getCourse(course_code);
    const title = `${course.title || course.course_name} Quiz`;
    const description = `Test your knowledge of ${course.title || course.course_name} with our interactive quiz.`;

    return {
      title: `${title} | NPTELPrep`,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://nptelprep.in/courses/${course_code}/quiz/practice`,
      },
    };
  } catch (error) {
    return {
      title: 'Quiz | NPTELPrep',
      description: 'Test your knowledge with our interactive quiz.',
    };
  }
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ course_code: string; quiz_type: string }>;
}) {
  const { course_code, quiz_type } = await params;

  if (!['practice', 'timed', 'quick', 'progress', 'weekly'].includes(quiz_type)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="rounded-lg bg-gray-800 bg-opacity-50 p-8 text-center backdrop-blur-md">
          <h1 className="mb-4 text-2xl font-bold text-indigo-300">Invalid Quiz Type</h1>
          <p className="mb-6 text-gray-300">The requested quiz type is not valid.</p>
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

  try {
    const course = await getCourse(course_code);

    let questions: QuizQuestion[] = [];

    if (quiz_type === 'weekly') {
      questions = course.weeks.reduce((allQuestions, week) => {
        if (week?.questions && Array.isArray(week.questions)) {
          const validQuestions = week.questions.filter(
            (q: any) =>
              q &&
              ((q.question &&
                q.answer &&
                Array.isArray(q.answer) &&
                q.answer.length > 0 &&
                q.options &&
                Array.isArray(q.options) &&
                q.options.length >= 2) ||
                (q.content_type === 'text' && q.question && q.question_text))
          );

          const questionsWithWeekName = validQuestions.map((q: any) => ({
            ...q,
            week_name: week.name,
          }));

          return [...allQuestions, ...questionsWithWeekName];
        }
        return allQuestions;
      }, [] as QuizQuestion[]);
    } else {
      questions = course.weeks.reduce((allQuestions, week) => {
        if (week?.questions && Array.isArray(week.questions)) {
          const validQuestions = week.questions.filter(
            (q: any) =>
              q &&
              ((q.question &&
                q.answer &&
                Array.isArray(q.answer) &&
                q.answer.length > 0 &&
                q.options &&
                Array.isArray(q.options) &&
                q.options.length >= 2) ||
                (q.content_type === 'text' && q.question && q.question_text))
          );
          return [...allQuestions, ...validQuestions];
        }
        return allQuestions;
      }, [] as QuizQuestion[]);
    }

    if (!questions || questions.length === 0) {
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

    const normalizedQuestions: UtilsQuestion[] = questions.map(q => {
      let normalizedOptions = Array.isArray(q.options)
        ? q.options.map(opt => {
            if (typeof opt === 'string') {
              const labelMatch = opt.match(/^([A-Z])[).:-]/i);
              const label = labelMatch ? labelMatch[1].toUpperCase() : '';
              const text = opt.replace(/^[A-Z][).:-]\s*/i, '').trim();
              return {
                option_number: label,
                option_text: text,
              };
            } else if (
              opt &&
              typeof opt === 'object' &&
              'option_number' in opt &&
              'option_text' in opt
            ) {
              return opt;
            }
            return {
              option_number: '',
              option_text: String(opt),
            };
          })
        : [];

      return {
        question: q.question,
        question_text: q.question_text || '',
        options: normalizedOptions,
        answer: Array.isArray(q.answer) ? q.answer : [],
        content_type: q.content_type || 'mcq',
        week_name: (q as any).week_name,
      } as UtilsQuestion;
    });

    return (
      <InteractiveQuiz
        questions={normalizedQuestions}
        courseCode={course_code}
        courseName={course.title || course.course_name}
        quizType={quiz_type as QuizType}
      />
    );
  } catch (error) {
    console.error('Error loading quiz page:', error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="rounded-lg bg-gray-800 bg-opacity-50 p-8 text-center backdrop-blur-md">
          <h1 className="mb-4 text-2xl font-bold text-indigo-300">Error Loading Quiz</h1>
          <p className="mb-6 text-gray-300">
            Sorry, we couldn&apos;t load the quiz questions. Please try again later.
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
}
