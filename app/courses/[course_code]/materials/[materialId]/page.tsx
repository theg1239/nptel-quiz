import { Metadata, ResolvingMetadata } from 'next'
import { getCourse, getCourseMaterials } from '@/lib/actions'
import MaterialViewClient from './material-view-client'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ course_code: string, materialId: string }> 
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code, materialId } = await params;
    
    const [materialType, resourceId] = materialId.split('-');
    
    const course = await getCourse(course_code);
    let materialTitle = '';
    
    switch (materialType) {
      case 'lecture':
        materialTitle = 'Video Lecture';
        break;
      case 'transcript':
        materialTitle = 'Lecture Transcript';
        break;
      case 'book':
        materialTitle = 'Course Book';
        break;
      case 'audio':
        materialTitle = 'Audio Lecture';
        break;
      default:
        materialTitle = 'Study Material';
    }
    
    const title = `${materialTitle} - ${course.title || course.course_name}`;
    const description = `Access and study ${materialTitle.toLowerCase()} for ${course.title || course.course_name} course material.`;

    return {
      title: `${title} | NPTELPrep`,
      description,
      keywords: [
        course.course_name,
        materialTitle,
        `${course.title} ${materialTitle.toLowerCase()}`,
        `${course.course_name} ${materialTitle.toLowerCase()}`,
        `${course.course_code} resources`,
        "NPTEL course materials",
        "educational resources"
      ],
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://nptelprep.in/courses/${course_code}/materials/${materialId}`,
      },
    };
  } catch (error) {
    return {
      title: "Study Material | NPTELPrep",
      description: "Access course materials to enhance your learning experience.",
    };
  }
}

export default async function MaterialPage({ params }: { params: { course_code: string; materialId: string } }) {
  const { course_code, materialId } = params;
  const materials = await getCourseMaterials(course_code);
  const material = materials.find(m => m.id === materialId);

  if (!material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-indigo-300 mb-4">Material Not Found</h1>
          <p className="text-gray-300 mb-6">We couldn't find the requested study material.</p>
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

  return <MaterialViewClient courseCode={course_code} materialId={materialId} />;
}