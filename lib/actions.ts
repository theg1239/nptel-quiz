'use server'

/**
 * Server actions for fetching course data
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nptelprep.in';

export interface Course {
  title: string;
  course_name: string;
  course_code: string;
  request_count: string | number;
  question_count: number;
  weeks: {
    name: string;
    questions: {
      question: string;
      options: string[];
      answer: string[];
    }[];
  }[];
}

export interface Stats {
  total_courses_from_json: number;
  total_assignments: number;
  total_questions: number;
}

/**
 * Fetch a course by its code
 */
export async function getCourse(courseCode: string): Promise<Course> {
  const res = await fetch(`${API_BASE_URL}/courses/${courseCode}`, { 
    cache: 'no-store',
    next: { revalidate: 3600 } // Revalidate every hour
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch course data');
  }
  
  return res.json();
}

/**
 * Fetch all courses
 */
export async function getAllCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE_URL}/courses`, { 
    next: { revalidate: 60 } // Revalidate every minute
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }
  
  const data = await res.json();
  return Array.isArray(data.courses) ? data.courses : [];
}

/**
 * Fetch app statistics
 */
export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE_URL}/counts`, { 
    next: { revalidate: 60 } // Revalidate every minute
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  
  return res.json();
} 