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
  try {
    // Await params before accessing properties
    const { course_code, quiz_type } = await params;

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
    console.error('Error loading quiz page:', error);
    // Return a fallback UI instead of throwing an error that fails the build
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Quiz Unavailable</h1>
          <p className="text-gray-300 mb-6">
            We're experiencing technical difficulties loading this quiz. Please try again later.
          </p>
          <a 
            href="/courses" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Courses
          </a>
        </div>
      </div>
    );
  }
}
