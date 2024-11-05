export type QuizType = 'practice' | 'timed' | 'quick' | 'progress';

export interface ProcessedQuestion {
    question: string;
    options: string[];
    answer: string[]; // Array to support multiple correct answers
    shuffledOptions: string[]; // Optional, used after shuffling
    answerIndices: number[];    // Optional, indices of correct answers in shuffledOptions
  }
  export interface InteractiveQuizProps {
    quizType: QuizType;
    courseName: string;
    questions: ProcessedQuestion[];
    courseCode: string;
    onExit?: () => void;
    quizTime?: number; // Optional prop for quiz time in seconds
    numQuestions?: number; // Optional prop for the number of questions
  }