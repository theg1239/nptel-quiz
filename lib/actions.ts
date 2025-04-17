'use server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nptelprep.in';

const FALLBACK_COURSES = [
  {
    title: "Data Structures and Algorithms",
    course_name: "Data Structures and Algorithms",
    course_code: "DSA101",
    request_count: 150,
    question_count: 240,
    video_count: 0,
    transcript_count: 0,
    assignments: [],
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
    video_count: 0,
    transcript_count: 0,
    assignments: [],
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
    video_count: 0,
    transcript_count: 0,
    assignments: [],
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

const FALLBACK_STATS = {
  total_courses_from_json: 987,
  total_assignments: 4500,
  total_questions: 35000,
  total_study_materials: 12000,
};

export interface ApiQuestion {
  question_text: string;
  correct_option: string;
  options: {
    option_number: string;
    option_text: string;
  }[];
}

export interface Assignment {
  assignment_id: number;
  week_number: number;
  assignment_title: string;
  questions: ApiQuestion[];
}

export interface Course {
  course_code: string;
  course_name: string;
  question_count: number;
  request_count: number;
  video_count: number;
  transcript_count: number;
  assignments: Assignment[];
  title?: string;
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
  total_study_materials: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'notes' | 'summary' | 'video' | 'transcript' | 'book' | 'audio';
  content: string;
  weekNumber: number | null;
  url?: string;
  mimetype?: string;
  languages?: { language: string; url: string }[];
}

export async function getCourse(courseCode: string): Promise<Course> {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${courseCode}`, { 
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch course ${courseCode}, using fallback`);
      const fallbackCourse = FALLBACK_COURSES.find(c => c.course_code === courseCode) || {
        title: `Course ${courseCode}`,
        course_name: `Course ${courseCode}`,
        course_code: courseCode,
        request_count: 0,
        question_count: 0,
        video_count: 0,
        transcript_count: 0,
        assignments: [],
        weeks: []
      };
      return fallbackCourse;
    }
    
    const data = await res.json();
    
    const weeks = data.assignments?.filter((assignment: Assignment) => 
      assignment && 
      Array.isArray(assignment.questions) && 
      assignment.questions.some((q: ApiQuestion) => q && q.question_text && q.correct_option && q.options)
    ).map((assignment: Assignment) => ({
      name: `Week ${assignment.week_number}`,
      questions: assignment.questions
        .filter((q: ApiQuestion) => q && q.question_text && q.correct_option && q.options)
        .map((q: ApiQuestion) => ({
          question: q.question_text,
          options: q.options
            .filter((opt: { option_number: string; option_text: string }) => opt && opt.option_number && opt.option_text)
            .map((opt: { option_number: string; option_text: string }) => ({
              option_number: opt.option_number,
              option_text: opt.option_text
            })),
          answer: [q.correct_option.toUpperCase()]
        }))
    })) || [];

    const questionCount = data.assignments?.reduce((total: number, assignment: Assignment) => {
      if (!assignment || !Array.isArray(assignment.questions)) return total;
      const validQuestions = assignment.questions.filter((q: ApiQuestion) => 
        q && q.question_text && q.correct_option && q.options &&
        Array.isArray(q.options) && q.options.every((opt: { option_number: string; option_text: string }) => opt && opt.option_number && opt.option_text)
      );
      return total + validQuestions.length;
    }, 0) || 0;

    return {
      ...data,
      weeks,
      title: data.course_name,
      request_count: data.request_count || 0,
      question_count: questionCount
    };
  } catch (error) {
    console.error(`Error fetching course ${courseCode}:`, error);
    const fallbackCourse = FALLBACK_COURSES.find(c => c.course_code === courseCode) || {
      title: `Course ${courseCode}`,
      course_name: `Course ${courseCode}`,
      course_code: courseCode,
      request_count: 0,
      question_count: 0,
      video_count: 0,
      transcript_count: 0,
      assignments: [],
      weeks: []
    };
    return fallbackCourse;
  }
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/courses`, { 
      next: { revalidate: 60 }
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

export async function getStats(): Promise<Stats> {
  try {
    const res = await fetch(`${API_BASE_URL}/counts`, { 
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      console.warn('Failed to fetch stats, using fallback data');
      return FALLBACK_STATS;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return FALLBACK_STATS;
  }
}

export async function getCourseMaterials(courseCode: string): Promise<StudyMaterial[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${courseCode}`, { 
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch course materials for ${courseCode}, using empty array`);
      return [];
    }
    
    const data = await res.json();
    return Array.isArray(data.materials) ? data.materials : [];
  } catch (error) {
    console.error(`Error fetching course materials for ${courseCode}:`, error);
    return [];
  }
}

export interface StudyPlan {
  courseCode: string;
  tasks: Array<{
    id: string;
    materialId: string;
    title: string;
    completed: boolean;
    dueDate: string;
    notes: string;
  }>;
  lastUpdated: string;
}

export async function saveStudyPlan(courseCode: string, tasks: any[]): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      const studyPlan: StudyPlan = {
        courseCode,
        tasks,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`studyPlan_${courseCode}`, JSON.stringify(studyPlan));
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving study plan for ${courseCode}:`, error);
    return false;
  }
}

export async function getStudyPlan(courseCode: string): Promise<StudyPlan | null> {
  try {
    if (typeof window !== 'undefined') {
      const savedPlan = localStorage.getItem(`studyPlan_${courseCode}`);
      
      if (savedPlan) {
        return JSON.parse(savedPlan) as StudyPlan;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error retrieving study plan for ${courseCode}:`, error);
    return null;
  }
}
