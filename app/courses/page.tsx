import { getAllCourses } from '@/lib/actions';
import CourseListClient from './courses-client';

export default async function CoursesPage() {
  try {
    const courses = await getAllCourses();
    
    const sortedCourses = [...courses].sort(
      (a, b) => Number(b.request_count) - Number(a.request_count)
    );
    
    return <CourseListClient initialCourses={sortedCourses} />;
  } catch (error) {
    console.error('Error in courses page:', error);
    return <CourseListClient initialCourses={[]} />;
  }
}
