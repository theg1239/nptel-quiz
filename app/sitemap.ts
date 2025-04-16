import { MetadataRoute } from 'next'
import { getAllCourses, getCourseMaterials } from '@/lib/actions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nptelprep.in'
  
  // Static routes
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
    // Get all courses
    const courses = await getAllCourses()
    
    // Add course pages
    for (const course of courses) {
      routes.push({
        url: `${baseUrl}/courses/${course.course_code}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })

      // Add course section pages
      const sections = [
        'materials',
        'videos',
        'practice',
        'discussions',
        'study-planner'
      ]

      for (const section of sections) {
        routes.push({
          url: `${baseUrl}/courses/${course.course_code}/${section}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }

      // Add material pages
      try {
        const materials = await getCourseMaterials(course.course_code)
        for (const material of materials) {
          routes.push({
            url: `${baseUrl}/courses/${course.course_code}/materials/${material.id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
          })
        }
      } catch (error) {
        console.error(`Error fetching materials for course ${course.course_code}:`, error)
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}