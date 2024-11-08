import InteractiveQuiz from '@/components/InteractiveQuiz';
import { QuizType } from '@/types/quiz';

interface Course {
  title: string;
  request_count: string;
  weeks: {
    name: string;
    questions: {
      question: string;
      options: string[];
      answer: string[]; 
    }[];
  }[];
}

interface QuizPageProps {
  params: {
    course_code: string;
    quiz_type: QuizType;
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { course_code, quiz_type } = params;

  const res = await fetch(`https://api.nptelprep.in/courses/${course_code}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch course data');
  }

  const course: Course = await res.json();

  const questions = course.weeks.flatMap(week => 
    week.questions.map(question => ({
      question: question.question,  
      options: question.options,
      answer: question.answer       
    }))
  );

  return (
    <InteractiveQuiz
      courseName={course.title}  
      questions={questions}
      quizType={quiz_type}
      courseCode={course_code}
    />
  );
}
