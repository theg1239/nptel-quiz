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
    
    const title = `Study Materials - ${courseName}`;
    const description = `Access lecture videos, transcripts, books, and reference materials for ${courseName}.`;

    return {
      title: `${title} | NPTELPrep`,
      description,
      keywords: [
        courseName,
        course.course_name,
        `${courseName} study materials`,
        `${course.course_name} lectures`,
        `${course.course_code} resources`,
        "NPTEL course materials",
        "lecture videos",
        "course transcripts",
        "educational resources"
      ],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://nptelprep.in/courses/${course_code}/materials`,
      },
    };
  } catch (error) {
    return {
      title: "Study Materials | NPTELPrep",
      description: "Access lecture videos, transcripts, books, and other course materials to enhance your learning experience.",
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