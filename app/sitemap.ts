import { MetadataRoute } from 'next'
import { getAllCourses } from '@/lib/actions'

// Maximum URLs per sitemap as per protocol guidelines
const MAX_URLS_PER_SITEMAP = 45000;

// Basic fallback sitemap for when API is down
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
    // Get all courses to generate dynamic routes
    const courses = await getAllCourses();
    
    // If courses is empty (which means we got fallbacks), return basic sitemap
    if (!courses || courses.length === 0) {
      console.warn('No courses available for sitemap, using fallback');
      return FALLBACK_SITEMAP;
    }
    
    // Base URL for your site
    const baseUrl = process.env.SITE_URL || 'https://nptelprep.in'
    
    // Static routes
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

    // Add dynamic routes for each course
    const courseRoutes = courses.map(course => ({
      url: `${baseUrl}/courses/${course.course_code}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    
    // Add practice and quiz pages for courses that have questions
    const quizRoutes = courses
      .filter(course => course.question_count > 0)
      .flatMap(course => [
        // Practice page for each course
        {
          url: `${baseUrl}/courses/${course.course_code}/practice`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
        // Quiz types for each course
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

    // Combine all routes
    const allRoutes = [...routes, ...courseRoutes, ...quizRoutes];
    
    // Check if we're within the URL limit
    if (allRoutes.length <= MAX_URLS_PER_SITEMAP) {
      return allRoutes;
    }
    
    // If we exceed the max URLs, prioritize and limit
    // First include all static routes and course routes
    const priorityRoutes = [...routes, ...courseRoutes];
    
    // Fill remaining slots with quiz routes, prioritized by course request_count if available
    const sortedQuizRoutes = quizRoutes.sort((a, b) => {
      // Extract course code from the URL
      const codeA = a.url.split('/')[4];
      const codeB = b.url.split('/')[4];
      
      // Find corresponding courses
      const courseA = courses.find(c => c.course_code === codeA);
      const courseB = courses.find(c => c.course_code === codeB);
      
      // Sort by request_count if available
      const countA = courseA ? Number(courseA.request_count) || 0 : 0;
      const countB = courseB ? Number(courseB.request_count) || 0 : 0;
      
      return countB - countA;
    });
    
    // Calculate remaining slots
    const remainingSlots = MAX_URLS_PER_SITEMAP - priorityRoutes.length;
    
    // Add as many quiz routes as will fit
    return [...priorityRoutes, ...sortedQuizRoutes.slice(0, remainingSlots)];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic sitemap on error
    return FALLBACK_SITEMAP;
  }
} 