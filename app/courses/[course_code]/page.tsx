import QuizPortal from '@/components/QuizPortal';

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

export default async function CoursePage({ params }: { params: { course_code: string } }) {
  const { course_code } = params;

  const res = await fetch(`https://api.nptelprep.in/courses/${course_code}`, { cache: 'no-store' });

  if (!res.ok) {
    return <p>Course not found</p>;
  }

  const course: Course = await res.json();

  return <QuizPortal course={course} course_code={course_code} />;
}
