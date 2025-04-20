'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';

export async function getPosts(courseCode: string) {
  const posts = await prisma.post.findMany({
    where: {
      courseCode,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return posts;
}

export async function createPost({
  title,
  content,
  weekNumber,
  courseCode,
  tags,
}: {
  title: string;
  content: string;
  weekNumber: number | null;
  courseCode: string;
  tags: string[];
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const post = await prisma.post.create({
    data: {
      title,
      content,
      weekNumber,
      courseCode,
      tags,
      userId: session.user.id,
    },
  });

  revalidatePath(`/courses/${courseCode}/discussions`);
  return post;
}

export async function createReply({
  content,
  postId,
  courseCode,
}: {
  content: string;
  postId: string;
  courseCode: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const reply = await prisma.reply.create({
    data: {
      content,
      postId,
      userId: session.user.id,
    },
  });

  revalidatePath(`/courses/${courseCode}/discussions`);
  return reply;
}

export async function togglePostLike(postId: string, courseCode: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const existingLike = await prisma.postLike.findUnique({
    where: {
      postId_userId: {
        userId: session.user.id,
        postId,
      },
    },
  });

  if (existingLike) {
    await prisma.postLike.delete({
      where: {
        id: existingLike.id,
      },
    });
  } else {
    await prisma.postLike.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });
  }

  revalidatePath(`/courses/${courseCode}/discussions`);
}

export async function toggleReplyLike(replyId: string, courseCode: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const existingLike = await prisma.replyLike.findUnique({
    where: {
      replyId_userId: {
        userId: session.user.id,
        replyId,
      },
    },
  });

  if (existingLike) {
    await prisma.replyLike.delete({
      where: {
        id: existingLike.id,
      },
    });
  } else {
    await prisma.replyLike.create({
      data: {
        userId: session.user.id,
        replyId,
      },
    });
  }

  revalidatePath(`/courses/${courseCode}/discussions`);
}

export async function updatePost({
  postId,
  title,
  content,
  courseCode,
}: {
  postId: string;
  title: string;
  content: string;
  courseCode: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(session.user.email || '');

  if (!post || (!isAdmin && post.userId !== session.user.id)) {
    throw new Error('Unauthorized');
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
    },
  });

  revalidatePath(`/courses/${courseCode}/discussions`);
  return updatedPost;
}

export async function updateReply({
  replyId,
  content,
  courseCode,
}: {
  replyId: string;
  content: string;
  courseCode: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: { userId: true },
  });

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(session.user.email || '');

  if (!reply || (!isAdmin && reply.userId !== session.user.id)) {
    throw new Error('Unauthorized');
  }

  const updatedReply = await prisma.reply.update({
    where: { id: replyId },
    data: {
      content,
    },
  });

  revalidatePath(`/courses/${courseCode}/discussions`);
  return updatedReply;
}

export async function deletePost(postId: string, courseCode: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(session.user.email || '');

  if (!post || (!isAdmin && post.userId !== session.user.id)) {
    throw new Error('Unauthorized');
  }

  await prisma.$transaction([
    prisma.postLike.deleteMany({
      where: { postId },
    }),
    prisma.replyLike.deleteMany({
      where: {
        reply: {
          postId,
        },
      },
    }),
    prisma.reply.deleteMany({
      where: { postId },
    }),
    prisma.post.delete({
      where: { id: postId },
    }),
  ]);

  revalidatePath(`/courses/${courseCode}/discussions`);
}

export async function deleteReply(replyId: string, courseCode: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: { userId: true },
  });

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(session.user.email || '');

  if (!reply || (!isAdmin && reply.userId !== session.user.id)) {
    throw new Error('Unauthorized');
  }

  await prisma.$transaction([
    prisma.replyLike.deleteMany({
      where: { replyId },
    }),
    prisma.reply.delete({
      where: { id: replyId },
    }),
  ]);

  revalidatePath(`/courses/${courseCode}/discussions`);
}
