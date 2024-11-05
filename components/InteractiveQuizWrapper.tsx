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
      quizTime={quizTime} // Only passed if applicable
      numQuestions={numQuestions} // Only passed if applicable
    />
  );
};

export default InteractiveQuizWrapper;
