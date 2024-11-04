// InteractiveQuizWrapper.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import InteractiveQuiz from '@/components/InteractiveQuiz';
import { QuizType, ProcessedQuestion } from '@/types/quiz'; // Correct import path

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
    
  const searchParams = useSearchParams();
  const quizTimeParam = searchParams.get('quiz_time');
  const numQuestionsParam = searchParams.get('num_questions');

  const quizTime = quizTimeParam ? parseInt(quizTimeParam, 10) : undefined;
  const numQuestions = numQuestionsParam ? parseInt(numQuestionsParam, 10) : undefined;

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
