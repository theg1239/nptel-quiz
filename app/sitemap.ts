import { MetadataRoute } from 'next';
import { getAllCourses } from '@/lib/actions/actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nptelprep.in';

  const staticRoutes: MetadataRoute.Sitemap = [
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
  ];

  try {
    const courses = await getAllCourses();

    const courseRoutes: MetadataRoute.Sitemap = courses.map(course => ({
      url: `${baseUrl}/courses/${course.course_code}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const sectionRoutes: MetadataRoute.Sitemap = courses.flatMap(course =>
      ['practice', 'discussions', 'materials', 'videos', 'study-planner'].map(section => ({
        url: `${baseUrl}/courses/${course.course_code}/${section}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    );

    return [...staticRoutes, ...courseRoutes, ...sectionRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
