import { getAllCourses } from '@/lib/actions';
import CourseListClient from './courses-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All NPTEL Courses | NPTELPrep - Free Practice',
  description:
    'Browse our comprehensive collection of NPTEL courses with practice questions, quizzes, and interactive learning resources. Prepare for your NPTEL exams with our practice platform.',
  keywords: [
    'NPTEL courses',
    'NPTEL practice questions',
    'NPTEL exam preparation',
    'NPTEL course list',
    'NPTEL mock tests',
    'free NPTEL practice',
    'NPTEL course catalog',
    'NPTEL study resources',
  ],
  openGraph: {
    title: 'All NPTEL Courses | NPTELPrep',
    description:
      'Browse all available NPTEL courses with practice questions and quizzes to prepare for your exams.',
    type: 'website',
    url: 'https://nptelprep.in/courses',
  },
};

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
