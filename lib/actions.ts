'use server'

/**
 * Server actions for fetching course data
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nptelprep.in';

// Default fallback courses for when API is down
const FALLBACK_COURSES = [
  {
    title: "Data Structures and Algorithms",
    course_name: "Data Structures and Algorithms",
    course_code: "DSA101",
    request_count: 150,
    question_count: 240,
    weeks: [
      {
        name: "Week 1: Introduction",
        questions: []
      },
      {
        name: "Week 2: Arrays and Linked Lists",
        questions: []
      }
    ]
  },
  {
    title: "Machine Learning",
    course_name: "Machine Learning",
    course_code: "ML202",
    request_count: 200,
    question_count: 180,
    weeks: [
      {
        name: "Week 1: Basics",
        questions: []
      },
      {
        name: "Week 2: Linear Regression",
        questions: []
      }
    ]
  },
  {
    title: "Web Development",
    course_name: "Web Development",
    course_code: "WEB303",
    request_count: 175,
    question_count: 160,
    weeks: [
      {
        name: "Week 1: HTML & CSS",
        questions: []
      },
      {
        name: "Week 2: JavaScript",
        questions: []
      }
    ]
  }
];

// Default stats for when API is down
const FALLBACK_STATS = {
  total_courses_from_json: 987,
  total_assignments: 4500,
  total_questions: 35000
};

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
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${courseCode}`, { 
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch course ${courseCode}, using fallback`);
      // Return a fallback course with the requested code
      const fallbackCourse = FALLBACK_COURSES.find(c => c.course_code === courseCode) || {
        title: `Course ${courseCode}`,
        course_name: `Course ${courseCode}`,
        course_code: courseCode,
        request_count: 0,
        question_count: 0,
        weeks: []
      };
      return fallbackCourse;
    }
    
    return res.json();
  } catch (error) {
    console.error(`Error fetching course ${courseCode}:`, error);
    // Return a fallback course with the requested code
    const fallbackCourse = FALLBACK_COURSES.find(c => c.course_code === courseCode) || {
      title: `Course ${courseCode}`,
      course_name: `Course ${courseCode}`,
      course_code: courseCode,
      request_count: 0,
      question_count: 0,
      weeks: []
    };
    return fallbackCourse;
  }
}

/**
 * Fetch all courses
 */
export async function getAllCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/courses`, { 
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!res.ok) {
      console.warn('Failed to fetch courses, using fallback data');
      return FALLBACK_COURSES;
    }
    
    const data = await res.json();
    return Array.isArray(data.courses) ? data.courses : FALLBACK_COURSES;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return FALLBACK_COURSES;
  }
}

/**
 * Fetch app statistics
 */
export async function getStats(): Promise<Stats> {
  try {
    const res = await fetch(`${API_BASE_URL}/counts`, { 
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!res.ok) {
      console.warn('Failed to fetch stats, using fallback data');
      return FALLBACK_STATS;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return FALLBACK_STATS;
  }
} 