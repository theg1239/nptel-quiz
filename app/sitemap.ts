import { MetadataRoute } from 'next'
import { getAllCourses } from '@/lib/actions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nptelprep.in'
  
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ] as MetadataRoute.Sitemap

  try {
    const courses = await getAllCourses()
    
    for (const course of courses) {
      routes.push({
        url: `${baseUrl}/courses/${course.course_code}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })

      const staticSections = [
        'practice',
        'discussions',
        'materials',
        'videos',
        'study-planner'
      ]

      for (const section of staticSections) {
        routes.push({
          url: `${baseUrl}/courses/${course.course_code}/${section}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}