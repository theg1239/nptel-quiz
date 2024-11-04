// app/courses/[course_code]/quiz/[quiz_type]/page.tsx

import InteractiveQuizWrapper from '@/components/InteractiveQuizWrapper';
import { QuizType, ProcessedQuestion } from '@/types/quiz';

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
}

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

export default async function QuizPage({ params }: QuizPageProps) {
  const { course_code, quiz_type } = params;

  const res = await fetch(`https://api.examcooker.in/courses/${course_code}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch course data');
  }

  const course: Course = await res.json();

  const processedQuestions: ProcessedQuestion[] = shuffleArray(
    course.weeks.flatMap(week =>
      week.questions.map(question => {
        // Calculate the original indices of the answers in the options array
        const answerIndices = question.answer.map(ans => {
          const label = ans.toUpperCase();
          const index = question.options.findIndex(opt => opt.startsWith(`Option ${label}`));
          return index !== -1 ? index : -1;
        }).filter(idx => idx !== -1);

        // Shuffle the options
        const shuffledOptions = shuffleArray([...question.options]);

        // Map the answer indices to the shuffled options
        const shuffledAnswerIndices = answerIndices
          .map(originalIndex => {
            if (originalIndex === -1 || originalIndex >= question.options.length) return -1;
            const option = question.options[originalIndex];
            return shuffledOptions.findIndex(opt => opt === option);
          })
          .filter(idx => idx !== -1);

        // Optional: Clean up the question and options text
        const cleanedQuestion = question.question.replace(/^Option [A-Z]:\s*/, '');
        const cleanedShuffledOptions = shuffledOptions.map(opt => opt.replace(/^Option [A-Z]:\s*/, ''));

        return {
          question: cleanedQuestion,
          options: question.options, // Original options as required by ProcessedQuestion
          answer: question.answer, // Original answer as required by ProcessedQuestion
          shuffledOptions: cleanedShuffledOptions,
          answerIndices: shuffledAnswerIndices,
        };
      })
    )
  );

  return (
    <InteractiveQuizWrapper
      courseName={course.title}
      course_code={course_code}
      quiz_type={quiz_type}
      processedQuestions={processedQuestions}
    />
  );
}
