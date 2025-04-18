'use client'

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/Button";

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
  buttonText = "Got it",
  maxViews = 2,
  onClose
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-purple-900 rounded-3xl shadow-xl w-full max-w-sm mx-4 text-white overflow-hidden">
        <div className="flex justify-end px-4 pt-4">
          <Button 
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-purple-300 hover:text-white transition-colors rounded-full p-1 hover:bg-purple-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="px-8 pb-8 pt-2 text-center">
          <div className="flex justify-center mb-5">
            <div className="bg-purple-700 p-4 rounded-full shadow-inner border-2 border-purple-600">
              {icon || (
                <svg className="w-9 h-9 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
              )}
            </div>
          </div>
          
          <h4 className="text-2xl font-medium text-white mb-2">{title}</h4>
          <p className="text-purple-200 mb-8">
            {description}
          </p>
          
          <Button 
            onClick={handleClose}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-full transition-colors shadow-lg"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeatureAnnounce;