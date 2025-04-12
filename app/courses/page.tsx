import { getAllCourses } from '@/lib/actions';
import CourseListClient from './courses-client';

export default async function CoursesPage() {
  const courses = await getAllCourses();
  
  // Sort courses by request_count
  const sortedCourses = [...courses].sort(
    (a, b) => Number(b.request_count) - Number(a.request_count)
  );
  
  return <CourseListClient initialCourses={sortedCourses} />;
}
