import { Metadata, ResolvingMetadata } from 'next'
import { getCourse } from '@/lib/actions'
import StudyMaterialsClient from './materials-client'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ course_code: string }> 
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code } = await params;
    const course = await getCourse(course_code);
    const courseName = course.title || course.course_name;
    
    const title = `${courseName} NPTEL Study Materials - Video Lectures & Resources`;
    const description = `Access comprehensive study materials for ${courseName}. Watch video lectures, download transcripts, lecture notes, and reference materials. Enhance your NPTEL course learning experience.`;

    const materialKeywords = [
      courseName,
      course.course_name,
      `${courseName} study materials`,
      `${courseName} video lectures`,
      `${courseName} lecture notes`,
      `${courseName} transcripts`,
      `${course.course_code} resources`,
      `${courseName} reference materials`,
      `${courseName} course materials`,
      `NPTEL ${courseName} lectures`,
      'NPTEL course materials',
      'NPTEL video lectures',
      'NPTEL lecture notes',
      'NPTEL study resources',
      'free NPTEL materials'
    ];

    return {
      title,
      description,
      keywords: materialKeywords,
      alternates: {
        canonical: `https://nptelprep.in/courses/${course_code}/materials`
      },
      openGraph: {
        title: `${courseName} - NPTEL Study Materials & Lectures`,
        description: `Access free video lectures, transcripts, and study materials for ${courseName}. Comprehensive NPTEL course resources to enhance your learning.`,
        type: 'article',
        url: `https://nptelprep.in/courses/${course_code}/materials`,
        images: [{
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${courseName} NPTEL Study Materials`
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${courseName} NPTEL Study Materials`,
        description: `Access video lectures and study materials for ${courseName}. Get comprehensive NPTEL course resources.`
      }
    };
  } catch (error) {
    return {
      title: "NPTEL Study Materials | NPTELPrep",
      description: "Access comprehensive NPTEL course materials including video lectures, transcripts, and reference materials.",
      keywords: [
        'NPTEL study materials',
        'NPTEL video lectures',
        'NPTEL course resources',
        'NPTEL lecture notes',
        'free NPTEL materials'
      ]
    };
  }
}

export default async function MaterialsPage({ params }: { params: Promise<{ course_code: string }> }) {
  const { course_code } = await params;
  
  try {
    const course = await getCourse(course_code);
    return <StudyMaterialsClient courseCode={course_code} courseName={course.title || course.course_name} />;
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-indigo-300 mb-4">Course Not Found</h1>
          <p className="text-gray-300 mb-6">We couldn't find the materials for this course.</p>
          <a 
            href="/courses" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Courses
          </a>
        </div>
      </div>
    );
  }
}