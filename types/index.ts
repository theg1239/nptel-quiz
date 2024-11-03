export interface Question {
    id: string;
    questionText: string;
    options: string[];
    correctOption: number;
  }
  
  export interface Quiz {
    id: string;
    title: string;
    courseCode: string;
    questions: Question[];
  }
  