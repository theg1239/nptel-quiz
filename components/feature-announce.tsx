'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureAnnounceProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  buttonText?: string;
  maxViews?: number;
  onClose?: () => void;
}

const FeatureAnnounce: React.FC<FeatureAnnounceProps> = ({
  id,
  title,
  description,
  icon,
  buttonText = 'Got it',
  maxViews = 2,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const announcements = JSON.parse(localStorage.getItem('feature-announcements') || '{}');
    const viewCount = announcements[id] || 0;

    if (viewCount < maxViews) {
      announcements[id] = viewCount + 1;
      localStorage.setItem('feature-announcements', JSON.stringify(announcements));
      setIsOpen(true);
    }
  }, [id, maxViews]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="mx-4 w-full max-w-sm overflow-hidden rounded-3xl bg-purple-900 text-white shadow-xl">
        <div className="flex justify-end px-4 pt-4">
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="rounded-full p-1 text-purple-300 transition-colors hover:bg-purple-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-8 pb-8 pt-2 text-center">
          <div className="mb-5 flex justify-center">
            <div className="rounded-full border-2 border-purple-600 bg-purple-700 p-4 shadow-inner">
              {icon || (
                <svg className="h-9 w-9 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
              )}
            </div>
          </div>

          <h4 className="mb-2 text-2xl font-medium text-white">{title}</h4>
          <p className="mb-8 text-purple-200">{description}</p>

          <Button
            onClick={handleClose}
            className="w-full rounded-full bg-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-purple-500"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeatureAnnounce;
