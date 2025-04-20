import { Metadata } from 'next';
import { getCourse } from '@/lib/actions/actions';
import StudyPlannerClient from './study-planner-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course_code: string }>;
}): Promise<Metadata> {
  const { course_code } = await params;
  const courseData = await getCourse(course_code);

  return {
    title: `${courseData?.title || courseData?.course_name || 'Course'} Study Planner - NPTELPrep`,
    description: `Create a personalized study plan for ${courseData?.title || courseData?.course_name || 'this course'}. Organize your learning and track your progress.`,
  };
}

export default async function StudyPlannerPage({
  params,
}: {
  params: Promise<{ course_code: string }>;
}) {
  const { course_code } = await params;
  const courseData = await getCourse(course_code);

  if (!courseData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <div className="rounded-lg bg-gray-800 bg-opacity-50 p-8 backdrop-blur-md">
          <h1 className="mb-4 text-2xl font-bold">Course Not Found</h1>
          <p>Sorry, the course you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <StudyPlannerClient
      courseCode={course_code}
      courseName={courseData.title || courseData.course_name}
    />
  );
}
