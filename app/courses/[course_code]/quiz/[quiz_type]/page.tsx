import QuizClientProvider from '@/components/QuizClientProvider';
import { QuizType, ProcessedQuestion } from '@/types/quiz';
import { useSearchParams } from 'next/navigation';

interface Course {
  title: string;
  request_count: string;
  weeks: {
    name: string;
    questions: {
      question: string;
      options: string[];
      answer: string[];
    }[];
  }[];
}

interface QuizPageProps {
  params: {
    course_code: string;
    quiz_type: QuizType;
  };
  searchParams: {
    quizTime?: string;
    numQuestions?: string;
  };
}

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { course_code, quiz_type } = params;
  const { quizTime, numQuestions } = searchParams;

  const res = await fetch(`https://api.examcooker.in/courses/${course_code}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch course data');
  }

  const course: Course = await res.json();

  const processedQuestions: ProcessedQuestion[] = shuffleArray(
    course.weeks.flatMap(week =>
      week.questions.map(question => {
        const answerIndices = question.answer.map(ans => {
          const label = ans.toUpperCase();
          const index = question.options.findIndex(opt => opt.startsWith(`Option ${label}`));
          return index !== -1 ? index : -1;
        }).filter(idx => idx !== -1);

        const shuffledOptions = shuffleArray([...question.options]);

        const shuffledAnswerIndices = answerIndices
          .map(originalIndex => {
            if (originalIndex === -1 || originalIndex >= question.options.length) return -1;
            const option = question.options[originalIndex];
            return shuffledOptions.findIndex(opt => opt === option);
          })
          .filter(idx => idx !== -1);

        const cleanedQuestion = question.question.replace(/^Option [A-Z]:\s*/, '');
        const cleanedShuffledOptions = shuffledOptions.map(opt => opt.replace(/^Option [A-Z]:\s*/, ''));

        return {
          question: cleanedQuestion,
          options: question.options,
          answer: question.answer,
          shuffledOptions: cleanedShuffledOptions,
          answerIndices: shuffledAnswerIndices,
        };
      })
    )
  );

  return (
    <QuizClientProvider
      courseName={course.title}
      course_code={course_code}
      quiz_type={quiz_type}
      processedQuestions={processedQuestions}
      quizTime={quizTime ? parseInt(quizTime, 10) : null}
      numQuestions={numQuestions ? parseInt(numQuestions, 10) : null}
    />
  );
}