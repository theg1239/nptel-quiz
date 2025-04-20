import { Metadata } from 'next';
import { getCourse } from '@/lib/actions';
import DiscussionForumClient from './discussions-client';
import { Suspense } from 'react';
import { getPosts } from '@/lib/actions/discussions';
import SpaceLoader from '@/components/space-loader';

interface PageProps {
  params: Promise<{
    course_code: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
        'NPTEL student discussions',
        'NPTEL course forum',
        'collaborative learning',
        'peer-to-peer learning',
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
      title: 'Discussion Forum | NPTELPrep',
      description:
        'Ask questions, share insights, and collaborate with fellow students in our discussion forums.',
    };
  }
}

export default async function DiscussionsPage({ params }: PageProps) {
  const { course_code } = await params;
  const posts = await getPosts(course_code);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
          <SpaceLoader size={100} />
        </div>
      }
    >
      <DiscussionForumClient courseCode={course_code} initialPosts={posts || []} />
    </Suspense>
  );
}
