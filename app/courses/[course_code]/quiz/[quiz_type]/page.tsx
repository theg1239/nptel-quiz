import { Metadata } from 'next'
import { getCourse } from '@/lib/actions'
import InteractiveQuiz from '@/components/InteractiveQuiz'
import { initializeQuestionsWithFixedOrder } from '@/lib/quizUtils'
import { QuizType } from '@/types/quiz'

export interface Question {
  question: string
  options: string[]
  answer: string[]
}

export async function generateMetadata({ params }: { params: Promise<{ course_code: string }> }): Promise<Metadata> {
  const { course_code } = await params
  
  try {
    const course = await getCourse(course_code)
    const title = `${course.title || course.course_name} Quiz`
    const description = `Test your knowledge of ${course.title || course.course_name} with our interactive quiz.`
    
    return {
      title: `${title} | NPTELPrep`,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://nptelprep.in/courses/${course_code}/quiz/practice`,
      },
    }
  } catch (error) {
    return {
      title: 'Quiz | NPTELPrep',
      description: 'Test your knowledge with our interactive quiz.',
    }
  }
}

export default async function QuizPage({ 
  params 
}: { 
  params: Promise<{ course_code: string; quiz_type: string }> 
}) {
  const { course_code, quiz_type } = await params;
  
  // Validate quiz type
  if (!['practice', 'timed', 'quick', 'progress'].includes(quiz_type)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-indigo-300 mb-4">Invalid Quiz Type</h1>
          <p className="text-gray-300 mb-6">The requested quiz type is not valid.</p>
          <a 
            href={`/courses/${course_code}`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Course
          </a>
        </div>
      </div>
    );
  }

  try {
    const course = await getCourse(course_code);
    
    // Get all questions from all assignments
    const questions = course.assignments?.reduce<Question[]>((allQuestions, assignment) => {
      if (assignment.questions && Array.isArray(assignment.questions)) {
        // Transform questions to match the expected format
        const transformedQuestions = assignment.questions.map(q => ({
          question: q.question_text,
          options: q.options.map(opt => opt.option_text),
          answer: [q.correct_option]
        }));
        return [...allQuestions, ...transformedQuestions];
      }
      return allQuestions;
    }, []) || [];

    // If no valid questions found
    if (questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
            <h1 className="text-2xl font-bold text-indigo-300 mb-4">No Questions Available</h1>
            <p className="text-gray-300 mb-6">This course does not have any practice questions yet.</p>
            <a 
              href={`/courses/${course_code}`}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Return to Course
            </a>
          </div>
        </div>
      );
    }

    // Initialize questions with fixed order
    const shuffledQuestions = initializeQuestionsWithFixedOrder(questions);
    
    return (
      <InteractiveQuiz 
        questions={shuffledQuestions} 
        courseCode={course_code}
        courseName={course.title || course.course_name}
        quizType={quiz_type as QuizType}
      />
    );
  } catch (error) {
    console.error('Error loading quiz page:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-indigo-300 mb-4">Error Loading Quiz</h1>
          <p className="text-gray-300 mb-6">Sorry, we couldn&apos;t load the quiz questions. Please try again later.</p>
          <a 
            href={`/courses/${course_code}`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Course
          </a>
        </div>
      </div>
    );
  }
}
