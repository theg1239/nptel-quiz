import QuizPortal from '@/components/QuizPortal';
import { getCourse, Course } from '@/lib/actions';

export default async function CoursePage({ params }: { params: Promise<{ course_code: string }> }) {
  // Await params before accessing properties
  const { course_code } = await params;

  try {
    const course = await getCourse(course_code);
    return <QuizPortal course={course} course_code={course_code} />;
  } catch (error) {
    return <p>Course not found</p>;
  }
}
