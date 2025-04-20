import { getServerSideSitemap } from 'next-sitemap';
import { getAllCourses, getCourseMaterials } from '@/lib/actions/actions';

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

export async function GET(request: Request) {
  const baseUrl = 'https://nptelprep.in';

  try {
    const courses = await getAllCourses();
    const urlSet: SitemapEntry[] = [];

    const chunkSize = 5;
    for (let i = 0; i < courses.length; i += chunkSize) {
      const chunk = courses.slice(i, i + chunkSize);

      const chunkPromises = chunk.map(async course => {
        const entries: SitemapEntry[] = [];

        try {
          const materials = await getCourseMaterials(course.course_code);
          materials.forEach(material => {
            entries.push({
              loc: `${baseUrl}/courses/${course.course_code}/materials/${material.id}`,
              lastmod: new Date().toISOString(),
              changefreq: 'weekly',
              priority: 0.7,
            });
          });
        } catch (error) {
          console.error(`Error getting materials for course ${course.course_code}:`, error);
        }

        return entries;
      });

      const chunkResults = await Promise.all(chunkPromises);
      urlSet.push(...chunkResults.flat());
    }

    return getServerSideSitemap(urlSet);
  } catch (error) {
    console.error('Error generating server-side sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
