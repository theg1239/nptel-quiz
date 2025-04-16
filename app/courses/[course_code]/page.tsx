import QuizPortal from '@/components/QuizPortal';
import { getCourse, Course } from '@/lib/actions';
import { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ course_code: string }> 
}, parent: ResolvingMetadata): Promise<Metadata> {
  try {
    const { course_code } = await params;
    const course = await getCourse(course_code);
    
    const totalQuestions = course.weeks.reduce(
      (sum, week) => sum + (week.questions?.length || 0),
      0
    );

    const title = `${course.title || course.course_name} NPTEL Course - Free Practice Questions & Materials`;
    const description = `Access ${totalQuestions}+ practice questions for ${course.title || course.course_name}. Get free study materials, video lectures, weekly quizzes, and join discussion forums. Prepare effectively for your NPTEL certification.`;

    const courseKeywords = [
      course.title,
      course.course_name,
      `${course.title} NPTEL course`,
      `${course.course_name} practice questions`,
      `${course.course_code} study materials`,
      `${course.title} video lectures`,
      `${course.course_name} mock test`,
      `${course.title} weekly quiz`,
      `NPTEL ${course.course_name} preparation`,
      `${course.course_code} discussion forum`,
      'NPTEL practice questions',
      'NPTEL exam preparation',
      'free NPTEL resources'
    ].filter(Boolean) as string[];

    return {
      title,
      description,
      keywords: courseKeywords,
      alternates: {
        canonical: `https://nptelprep.in/courses/${course_code}`
      },
      openGraph: {
        title: `${course.title || course.course_name} - NPTEL Course Practice Portal`,
        description: `Access ${totalQuestions}+ practice questions, video lectures, and study materials for ${course.title || course.course_name}. Prepare for your NPTEL certification with our comprehensive learning platform.`,
        type: 'article',
        url: `https://nptelprep.in/courses/${course_code}`,
        images: [{
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Practice ${course.title || course.course_name} NPTEL Course`
        }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `Study ${course.title || course.course_name} on NPTELPrep`,
        description: `Get free practice questions, video lectures, and study materials for ${course.title || course.course_name}. Join our learning community today!`
      }
    };
  } catch (error) {
    return {
      title: "NPTEL Course Practice | NPTELPrep",
      description: "Practice questions and study materials for NPTEL courses. Prepare effectively with our interactive learning platform.",
    };
  }
}

export default async function CoursePage({ params }: { params: Promise<{ course_code: string }> }) {
  const { course_code } = await params;

  try {
    const course = await getCourse(course_code);
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://nptelprep.in"
      }, {
        "@type": "ListItem",
        "position": 2,
        "name": "Courses",
        "item": "https://nptelprep.in/courses"
      }, {
        "@type": "ListItem",
        "position": 3,
        "name": course.title || course.course_name,
        "item": `https://nptelprep.in/courses/${course_code}`
      }]
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        <QuizPortal course={course} course_code={course_code} />
      </>
    );
  } catch (error) {
    return <p>Course not found</p>;
  }
}
