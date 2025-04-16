import { MetadataRoute } from 'next'
import { getAllCourses } from '@/lib/actions'

interface Course {
  course_code: string
  course_name: string
  question_count: number
  request_count: string | number
  title?: string
}

const MAX_URLS_PER_SITEMAP = 45000;

const FALLBACK_SITEMAP: MetadataRoute.Sitemap = [
  {
    url: process.env.SITE_URL || 'https://nptelprep.in',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  },
  {
    url: `${process.env.SITE_URL || 'https://nptelprep.in'}/courses`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const courses = await getAllCourses();
    
    if (!courses || courses.length === 0) {
      console.warn('No courses available for sitemap, using fallback');
      return FALLBACK_SITEMAP;
    }
    
    const baseUrl = process.env.SITE_URL || 'https://nptelprep.in'
    
    const routes = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/courses`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ]

    const courseRoutes = courses.map(course => ({
      url: `${baseUrl}/courses/${course.course_code}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const studyRoutes = courses.flatMap(course => [
      {
        url: `${baseUrl}/courses/${course.course_code}/materials`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/courses/${course.course_code}/videos`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/courses/${course.course_code}/study-planner`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    ])
    
    const quizRoutes = courses
      .filter(course => course.question_count && course.question_count > 0)
      .flatMap(course => [
        {
          url: `${baseUrl}/courses/${course.course_code}/practice`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/courses/${course.course_code}/quiz/practice`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/courses/${course.course_code}/quiz/timed`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/courses/${course.course_code}/quiz/quick`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
      ])

    const allRoutes = [...routes, ...courseRoutes, ...studyRoutes, ...quizRoutes];
    
    if (allRoutes.length <= MAX_URLS_PER_SITEMAP) {
      return allRoutes;
    }
    
    const priorityRoutes = [...routes, ...courseRoutes, ...studyRoutes];
    
    const sortedQuizRoutes = quizRoutes.sort((a, b) => {
      const codeA = a.url.split('/')[4];
      const codeB = b.url.split('/')[4];
      
      const courseA = courses.find(c => c.course_code === codeA);
      const courseB = courses.find(c => c.course_code === codeB);
      
      const countA = courseA ? Number(courseA.request_count) || 0 : 0;
      const countB = courseB ? Number(courseB.request_count) || 0 : 0;
      
      return countB - countA;
    });
    
    const remainingSlots = MAX_URLS_PER_SITEMAP - priorityRoutes.length;
    
    return [...priorityRoutes, ...sortedQuizRoutes.slice(0, remainingSlots)];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return FALLBACK_SITEMAP;
  }
} 