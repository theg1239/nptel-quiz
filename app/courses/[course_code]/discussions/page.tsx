import { Metadata, ResolvingMetadata } from 'next'
import { getCourse } from '@/lib/actions'
import DiscussionForumClient from './discussions-client'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ course_code: string }> 
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code } = await params;
    
    const course = await getCourse(course_code);
    
    const title = `Discussion Forum - ${course.title || course.course_name}`;
    const description = `Join the discussion forum for ${course.title || course.course_name}. Ask questions, share insights, and collaborate with other students.`;

    return {
      title: `${title} | NPTELPrep`,
      description,
      keywords: [
        course.course_name,
        `${course.title} discussion`,
        `${course.course_name} forum`,
        `${course.course_code} community`,
        "NPTEL student discussions",
        "NPTEL course forum",
        "collaborative learning",
        "peer-to-peer learning"
      ],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://nptelprep.in/courses/${course_code}/discussions`,
      },
    };
  } catch (error) {
    return {
      title: "Discussion Forum | NPTELPrep",
      description: "Ask questions, share insights, and collaborate with fellow students in our discussion forums.",
    };
  }
}

export default async function DiscussionsPage({ params }: { params: Promise<{ course_code: string }> }) {
  const { course_code } = await params;
  
  try {
    const course = await getCourse(course_code);
    return <DiscussionForumClient courseCode={course_code} courseName={course.title || course.course_name} />;
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-indigo-300 mb-4">Course Not Found</h1>
          <p className="text-gray-300 mb-6">We couldn't find the discussion forum for this course.</p>
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