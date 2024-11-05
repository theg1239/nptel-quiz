'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import InteractiveQuizWrapper from './InteractiveQuizWrapper';
import { QuizType, ProcessedQuestion } from '@/types/quiz';

interface QuizClientProviderProps {
  courseName: string;
  course_code: string;
  quiz_type: QuizType;
  processedQuestions: ProcessedQuestion[];
}

const QuizClientProvider: React.FC<QuizClientProviderProps> = ({
  courseName,
  course_code,
  quiz_type,
  processedQuestions,
}) => (
  <Provider store={store}>
    <InteractiveQuizWrapper
      courseName={courseName}
      course_code={course_code}
      quiz_type={quiz_type}
      processedQuestions={processedQuestions}
    />
  </Provider>
);

export default QuizClientProvider;