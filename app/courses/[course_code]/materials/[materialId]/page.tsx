import { Metadata, ResolvingMetadata } from 'next'
import { getCourse, getCourseMaterials } from '@/lib/actions'
import MaterialViewClient from './material-view-client'

export async function generateMetadata(
  { params }: { params: Promise<{ course_code: string; materialId: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { course_code, materialId } = await params;
    const course = await getCourse(course_code);
    const materials = await getCourseMaterials(course_code);
    const material = materials.find(m => m.id === materialId);
    
    const courseName = course?.title || course?.course_name || 'NPTEL Course';
    const materialTypeName = material?.type ? material.type.charAt(0).toUpperCase() + material.type.slice(1) : 'Study Material';
    const weekInfo = material?.weekNumber ? `Week ${material.weekNumber} - ` : '';
    
    const title = `${weekInfo}${materialTypeName} - ${courseName} NPTEL Course`;
    const description = `Access ${materialTypeName.toLowerCase()} content for ${courseName}. ${
      material?.type === 'video' ? 'Watch video lecture' : 
      material?.type === 'transcript' ? 'Read lecture transcript' : 
      'Study course material'
    } for ${weekInfo}${courseName} NPTEL course.`;

    const materialKeywords = [
      courseName,
      material?.title,
      material?.type ? `${courseName} ${material.type}` : null,
      material?.weekNumber ? `${courseName} week ${material.weekNumber}` : null,
      material?.type ? `NPTEL ${courseName} ${material.type}` : null,
      `${course?.course_code} study material`,
      `${weekInfo}${courseName} content`,
      'NPTEL course materials',
      'NPTEL study resources',
      material?.type ? `free NPTEL ${material.type}s` : null
    ].filter(Boolean) as string[];

    return {
      title,
      description,
      keywords: materialKeywords,
      alternates: {
        canonical: `https://nptelprep.in/courses/${course_code}/materials/${materialId}`
      },
      openGraph: {
        title: `${materialTypeName} - ${courseName} NPTEL Course`,
        description,
        type: 'article',
        url: `https://nptelprep.in/courses/${course_code}/materials/${materialId}`,
        images: [{
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${courseName} NPTEL ${materialTypeName}`
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${materialTypeName} - ${courseName} NPTEL Course`,
        description: `Study ${materialTypeName.toLowerCase()} content for ${weekInfo}${courseName} NPTEL course.`
      }
    };
  } catch (error) {
    return {
      title: "Study Material | NPTELPrep",
      description: "Access NPTEL course study materials to enhance your learning experience.",
      keywords: ['NPTEL study materials', 'NPTEL course content', 'NPTEL resources']
    };
  }
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ course_code: string; materialId: string }>;
}) {
  const { course_code, materialId } = await params;
  const materials = await getCourseMaterials(course_code);
  const material = materials.find(m => m.id === materialId);
  const course = await getCourse(course_code);

  if (!material || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-indigo-300 mb-4">Material Not Found</h1>
          <p className="text-gray-300 mb-6">
            We couldn't find the requested study material.
          </p>
          <a 
            href={`/courses/${course_code}/materials`} 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Materials
          </a>
        </div>
      </div>
    );
  }

  const materialTypeName = material.type.charAt(0).toUpperCase() + material.type.slice(1);
  const courseName = course.title || course.course_name;

  const coursewareSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": `${material.title || 'Study Material'} - ${courseName}`,
    "description": `${materialTypeName} content for ${courseName} NPTEL course${material.weekNumber ? ` Week ${material.weekNumber}` : ''}.`,
    "provider": {
      "@type": "Organization",
      "name": "NPTELPrep",
      "url": "https://nptelprep.in"
    },
    "courseCode": course_code,
    "educationalLevel": "College",
    "learningResourceType": material.type || "StudyResource",
    "teaches": courseName,
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "url": `https://nptelprep.in/courses/${course_code}/materials/${materialId}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(coursewareSchema)
        }}
      />
      <MaterialViewClient courseCode={course_code} materialId={materialId} />
    </>
  );
}
