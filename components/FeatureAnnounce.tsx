import React, { useState } from 'react';

const FlashcardsAnnouncement = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-purple-900 rounded-3xl shadow-xl w-full max-w-sm mx-4 text-white overflow-hidden">
        <div className="flex justify-end px-4 pt-4">
          <button 
            onClick={() => setIsOpen(false)}
            className="text-purple-300 hover:text-white transition-colors rounded-full p-1 hover:bg-purple-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-8 pb-8 pt-2 text-center">
          <div className="flex justify-center mb-5">
            <div className="bg-purple-700 p-4 rounded-full shadow-inner border-2 border-purple-600">
              <svg className="w-9 h-9 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
              </svg>
            </div>
          </div>
          
          <h4 className="text-2xl font-medium text-white mb-2">New Flashcards</h4>
          <p className="text-purple-200 mb-8">
            Now available in Practice Mode
          </p>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-full transition-colors shadow-lg"
          >
            Try it now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsAnnouncement;