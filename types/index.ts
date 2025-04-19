export interface Course {
  course_code: string;
  course_name: string;
  question_count: number;
  request_count: number;
  video_count: number;
  transcript_count: number;
}

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
