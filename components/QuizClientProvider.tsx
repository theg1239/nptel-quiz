'use client';

import { Provider } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { store } from './store';
import InteractiveQuiz from './InteractiveQuiz';

import { ProcessedQuestion, QuizType } from '@/types/quiz';

interface QuizClientProviderProps {
    courseName: string;
    course_code: string;
    quiz_type: QuizType;
    processedQuestions: ProcessedQuestion[];
    quizTime?: number | null;
    numQuestions?: number | null;
  }

function QuizClientProvider({
  courseName,
  course_code,
  quiz_type,
  processedQuestions,
  quizTime = null,
  numQuestions = null,
}: QuizClientProviderProps) {
  // Debugging log
  console.log('Quiz Time:', quizTime, 'Number of Questions:', numQuestions);

  return (
    <Provider store={store}>
      <InteractiveQuiz
        quizType={quiz_type}
        courseName={courseName}
        questions={processedQuestions}
        courseCode={course_code}
        quizTime={quizTime}
        numQuestions={numQuestions}
      />
    </Provider>
  );
}

export default QuizClientProvider;