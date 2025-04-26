import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const REQUIRE_AUTH_FOR_REPORTING =
  process.env.REQUIRE_AUTH_FOR_REPORTING === 'true';

const MAX_QUESTION_TEXT_LENGTH = 2000;
const MAX_REASON_LENGTH = 1000;
const MAX_COURSE_CODE_LENGTH = 50;

function sanitizeString(input: unknown, maxLength: number): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : null;
}

export async function POST(request: Request) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    return NextResponse.json(
      { message: 'Failed to verify session.' },
      { status: 500 }
    );
  }

  if (REQUIRE_AUTH_FOR_REPORTING && !session?.user?.email) {
    return NextResponse.json(
      { message: 'Authentication required.' },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON in request body.' },
      { status: 400 }
    );
  }

  const question_text = sanitizeString(body.question_text, MAX_QUESTION_TEXT_LENGTH);
  const reason        = sanitizeString(body.reason,        MAX_REASON_LENGTH);
  const course_code   = sanitizeString(body.course_code,   MAX_COURSE_CODE_LENGTH);

  if (!question_text) {
    return NextResponse.json(
      { message: 'Invalid question_text: must be a non-empty string.' },
      { status: 400 }
    );
  }
  if (!reason) {
    return NextResponse.json(
      { message: 'Invalid reason: must be a non-empty string.' },
      { status: 400 }
    );
  }
  if (!course_code) {
    return NextResponse.json(
      { message: 'Invalid course_code: must be a non-empty string.' },
      { status: 400 }
    );
  }

  const reported_by = session?.user?.email ?? 'anonymous';

  let externalResponse: Response;
  try {
    externalResponse = await fetch('http://localhost:4000/report-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': reported_by,
      },
      body: JSON.stringify({ question_text, reason, course_code }),
    });
  } catch (err) {
    console.error('Network error calling external API:', err);
    return NextResponse.json(
      { message: 'Failed to connect to reporting service.', success: false },
      { status: 502 }
    );
  }

  if (externalResponse.status === 409) {
    return NextResponse.json(
      { message: 'You have already reported this question for this course.', success: false },
      { status: 409 }
    );
  }
  if (!externalResponse.ok) {
    console.error(
      `External API error: ${externalResponse.status} ${externalResponse.statusText}`
    );
    return NextResponse.json(
      { message: 'Reporting service returned an error.', success: false },
      { status: 502 }
    );
  }

  let externalData: any = null;
  try {
    externalData = await externalResponse.json();
  } catch {
    console.warn('External API returned invalid JSON; using fallback payload.');
  }

  return NextResponse.json(
    externalData ?? {
      message: 'Report submitted successfully.',
      success: true,
      report: {
        question_text,
        reason,
        course_code,
        reported_by,
        reported_at: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}
