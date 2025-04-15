import { Metadata, ResolvingMetadata } from 'next'
import { getCourse } from '@/lib/actions'
import MaterialViewClient from './material-view-client'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ course_code: string, materialId: string }> 
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code, materialId } = await params;
    
    // Extract material type and resource identifier
    const [materialType, resourceId] = materialId.split('-');
    
    const course = await getCourse(course_code);
    let materialTitle = '';
    
    // Set title based on material type
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
        course.title,
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

export default async function MaterialViewPage({ 
  params 
}: { 
  params: Promise<{ course_code: string, materialId: string }> 
}) {
  const { course_code, materialId } = await params;
  return <MaterialViewClient courseCode={course_code} materialId={materialId} />;
}