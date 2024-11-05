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
    quizTime?: number | null; // Allow null
    numQuestions?: number | null;
  }
  export interface UserAnswer {
    selectedOptions: number[];
    correct: boolean;
    locked: boolean;
    timeSpent: number;
  }
  
  export interface PowerUpType {
    type: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    name: string;
    active: boolean;
  }