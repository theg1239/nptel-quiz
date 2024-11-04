// app/courses/[course_code]/quiz/[quiz_type]/page.tsx

import InteractiveQuiz from '@/components/InteractiveQuiz';
import { QuizType } from '@/types/quiz';

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

interface APIQuestion {
  question: string;
  options: string[];
  answer: string[];
}

interface ProcessedQuestion {
  question: string;
  shuffledOptions: string[];
  answerIndices: number[];
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
        const answerIndices = question.answer.map(ans => {
          const label = ans.toUpperCase();
          const index = question.options.findIndex(opt => opt.startsWith(`Option ${label}`));
          return index !== -1 ? index : -1;
        }).filter(idx => idx !== -1);

        const shuffledOptions = shuffleArray(question.options);
        const shuffledAnswerIndices = answerIndices.map(originalIndex => {
          const option = question.options[originalIndex];
          return shuffledOptions.findIndex(opt => opt === option);
        }).filter(idx => idx !== -1);

        return {
          question: question.question,
          shuffledOptions,
          answerIndices: shuffledAnswerIndices
        };
      })
    )
  );

  return (
    <InteractiveQuiz
      courseName={course.title}  
      questions={processedQuestions}
      quizType={quiz_type}
      courseCode={course_code}
    />
  );
}
