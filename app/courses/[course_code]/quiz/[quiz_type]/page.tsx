import InteractiveQuiz from '@/components/InteractiveQuiz';
import { QuizType } from '@/types/quiz';
import { getCourse } from '@/lib/actions';

interface QuizPageProps {
  params: Promise<{
    course_code: string;
    quiz_type: QuizType;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  // Await params before accessing properties
  const { course_code, quiz_type } = await params;

  try {
    const course = await getCourse(course_code);

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
  } catch (error) {
    throw new Error('Failed to fetch course data');
  }
}
