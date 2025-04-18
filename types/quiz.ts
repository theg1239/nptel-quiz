export type QuizType = 'practice' | 'timed' | 'quick' | 'progress' | 'weekly';

export interface Option {
  option_number: string;
  option_text: string;
}

export interface Question {
  question: string;
  question_text?: string;
  content_type?: 'mcq' | 'text';
  options: Array<Option | string>;
  answer: string[];
  shuffledOptions?: Array<Option | string>;
  week_name?: string;
}

export interface QuestionDisplayProps {
  question: string;
  question_text?: string;
  content_type?: 'mcq' | 'text';
  options: string[];
  selectedOptions: number[];
  onOptionSelect: (index: number) => void;
  isAnswerLocked: boolean;
  feedback: { type: 'correct' | 'incorrect' } | null;
}