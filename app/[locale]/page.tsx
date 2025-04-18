import { getAllCourses, getStats } from '@/lib/actions';
import IndexClient from '../index-client';

// Transform Course array to SearchCourse array
function transformCourses(courses: any[]) {
  return courses.map(course => ({
    course_code: course.course_code,
    course_name: course.course_name || course.title || `Course ${course.course_code}`,
    question_count: course.question_count || 0,
    video_count: course.video_count || 0,
    transcript_count: course.transcript_count || 0,
    request_count: course.request_count || 0,
    weeks: course.weeks 
      ? course.weeks
          .filter((week: any) => week && typeof week === 'object')
          .map((week: any) => week.name || `Week ${course.weeks.indexOf(week) + 1}`)
      : null,
  }));
}

export default async function Home() {
  const coursesData = await getAllCourses();
  const statsData = await getStats();
  
  // Transform courses to the format expected by IndexClient
  const courses = transformCourses(coursesData);
  
  return <IndexClient courses={courses} statsData={statsData} />;
}