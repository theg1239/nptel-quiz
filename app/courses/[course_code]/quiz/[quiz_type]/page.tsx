import InteractiveQuiz from '@/components/InteractiveQuiz';
import { QuizType } from '@/types/quiz';
import { getCourse } from '@/lib/actions';
import { Metadata, ResolvingMetadata } from 'next';

interface QuizPageProps {
  params: Promise<{
    course_code: string;
    quiz_type: QuizType;
  }>;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ course_code: string; quiz_type: QuizType }>
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code, quiz_type } = await params;
    
    const course = await getCourse(course_code);
    
    const quizTypeLabel = quiz_type.charAt(0).toUpperCase() + quiz_type.slice(1);
    
    const totalQuestions = course.weeks.reduce(
      (sum, week) => sum + (week.questions?.length || 0),
      0
    );

    const quizTitles = {
      practice: `Practice Quiz for ${course.title || course.course_name}`,
      timed: `Timed Quiz for ${course.title || course.course_name}`,
      quick: `Quick Review Quiz for ${course.title || course.course_name}`,
      progress: `Progress Test for ${course.title || course.course_name}`,
    };

    const quizDescriptions = {
      practice: `Unlimited time practice quiz with all ${totalQuestions}+ questions for ${course.title || course.course_name}. Master NPTEL concepts at your own pace.`,
      timed: `Timed quiz with selected questions from ${course.title || course.course_name}. Test your knowledge under exam conditions.`,
      quick: `Quick 10-question review quiz for ${course.title || course.course_name}. Perfect for a rapid refresher before exams.`,
      progress: `Track your progress in ${course.title || course.course_name} with this targeted quiz focusing on your weak areas.`,
    };

    const title = quizTitles[quiz_type] || `${quizTypeLabel} Quiz for ${course.title || course.course_name}`;
    const description = quizDescriptions[quiz_type] || `Interactive ${quiz_type} quiz for ${course.title || course.course_name}. Practice NPTEL exam questions and improve your score.`;

    return {
      title: `${title} | NPTELPrep`,
      description,
      keywords: [
        course.title,
        course.course_name,
        `${course.title} quiz`,
        `${course.course_name} ${quiz_type} test`,
        `${course.course_code} practice questions`,
        `NPTEL ${course.course_name} quiz`,
        `${quiz_type} quiz NPTEL`,
        "NPTEL practice tests",
        "NPTEL exam preparation",
      ],
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://nptelprep.in/courses/${course_code}/quiz/${quiz_type}`,
      },
    };
  } catch (error) {
    return {
      title: "NPTEL Quiz | NPTELPrep",
      description: "Practice with interactive quizzes for NPTEL courses. Prepare for your exams effectively.",
    };
  }
}

export default async function QuizPage({ params }: QuizPageProps) {
  try {
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
