'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import InteractiveQuiz from '@/components/InteractiveQuiz';
import { QuizType, ProcessedQuestion } from '@/types/quiz';

interface InteractiveQuizWrapperProps {
  courseName: string;
  course_code: string;
  quiz_type: QuizType;
  processedQuestions: ProcessedQuestion[];
}

const InteractiveQuizWrapper: React.FC<InteractiveQuizWrapperProps> = ({
  courseName,
  course_code,
  quiz_type,
  processedQuestions,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Define the exit path as the course's main page
  const handleExit = () => {
    router.push(`/courses/${course_code}`);
  };

  // Set quizTime and numQuestions based on the quiz type
  const quizTimeParam = searchParams.get('quiz_time');
  const numQuestionsParam = searchParams.get('num_questions');
  const quizTime = quiz_type === 'timed' || quiz_type === 'quick' ? parseInt(quizTimeParam ?? '0', 10) : undefined;
  const numQuestions = quiz_type === 'timed' || quiz_type === 'quick' ? parseInt(numQuestionsParam ?? '0', 10) : undefined;

  return (
    <InteractiveQuiz
      courseName={courseName}
      questions={processedQuestions}
      quizType={quiz_type}
      courseCode={course_code}
      quizTime={quizTime}
      numQuestions={numQuestions}
    />
  );
};

export default InteractiveQuizWrapper;
