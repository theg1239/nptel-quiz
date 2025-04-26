'use client';

import { useState, useEffect } from 'react';
import { Flag } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const REQUIRE_AUTH_FOR_REPORTING =
  process.env.NEXT_PUBLIC_REQUIRE_AUTH_FOR_REPORTING === 'true';

interface ReportQuestionProps {
  questionText: string;
  variant?: 'practice' | 'quiz';
  requireAuth?: boolean;      // override per-component
  courseCode?: string;        // optional override
}

export default function ReportQuestion({
  questionText,
  variant = 'practice',
  requireAuth,
  courseCode: propsCourseCode,
}: ReportQuestionProps) {
  const shouldRequireAuth =
    typeof requireAuth === 'boolean'
      ? requireAuth
      : REQUIRE_AUTH_FOR_REPORTING;

  const { data: session } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('incorrect');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedCourseCode, setExtractedCourseCode] = useState<string | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    if (propsCourseCode) {
      setExtractedCourseCode(propsCourseCode);
      return;
    }
    const match = pathname.match(/\/courses\/([^\/]+)/);
    setExtractedCourseCode(match ? match[1] : null);
  }, [pathname, propsCourseCode]);

  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signIn('google', { callbackUrl: window.location.href });
  };

  const handleReport = async () => {
    // only block if we really require auth
    if (shouldRequireAuth && !session) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in with Google to report a question.',
        variant: 'destructive',
      });
      return;
    }

    const finalReason = reason === 'other' ? customReason : reason;
    if (reason === 'other' && !customReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for your report.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/report/report-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: session?.user?.email || 'anonymous',
        },
        body: JSON.stringify({
          question_text: questionText,
          reason: finalReason,
          course_code: extractedCourseCode || 'unknown',
        }),
      });

      if (res.ok) {
        toast({
          title: 'Report submitted',
          description: 'Thank you for your feedback. We will review this question.',
        });
        setOpen(false);
      } else if (res.status === 409) {
        toast({
          title: 'Already reported',
          description: 'You have already reported this question.',
          variant: 'destructive',
        });
      } else {
        throw new Error('Failed to submit report');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="ml-2 inline-flex items-center text-xs hover:opacity-100 transition-opacity duration-200"
          title="Report issue with this question"
        >
          <Flag className="h-3 w-3 mr-1" />
          <span className="sr-only">Report</span>
        </button>
      </DialogTrigger>

      <DialogContent className="border border-gray-700 bg-gray-900 text-gray-100 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Report Question</DialogTitle>
          <DialogDescription className="text-gray-400">
            Help us improve by reporting issues with this question.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-md border border-gray-700 bg-gray-800/50 p-3">
            <p className="text-sm text-gray-300">{questionText}</p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="reason" className="text-sm font-medium text-gray-300">
              Reason for reporting
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason" className="border-gray-700 bg-gray-800 text-gray-200">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-800 text-gray-200">
                <SelectItem value="incorrect">Incorrect answer</SelectItem>
                <SelectItem value="confusing">Confusing question</SelectItem>
                <SelectItem value="duplicate">Duplicate question</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="other">Other (please specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div className="grid gap-2">
              <label htmlFor="customReason" className="text-sm font-medium text-gray-300">
                Please specify the reason
              </label>
              <Textarea
                id="customReason"
                placeholder="Please explain the issue with this question..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="border-gray-700 bg-gray-800/50 text-gray-200 placeholder:text-gray-500"
              />
            </div>
          )}

          {/* only show sign-in prompt if we really require auth */}
          {shouldRequireAuth && !session && (
            <div className="rounded-md bg-blue-900/30 p-4 text-sm text-blue-300 border border-blue-800/50 flex flex-col items-center">
              <p className="mb-3">You need to be signed in to report a question</p>
              <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                Sign in with Google
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-700 hover:bg-gray-800 hover:text-gray-200">
            Cancel
          </Button>
          <Button onClick={handleReport} disabled={isSubmitting || (shouldRequireAuth && !session)} className="bg-blue-600 text-white hover:bg-blue-700">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
