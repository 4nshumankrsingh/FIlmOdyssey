'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AIChatModal } from './AIChatModal';

export function AIWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md group-hover:bg-yellow-400/30 transition-all duration-500 scale-0 group-hover:scale-100" />
        
        {/* Floating Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black shadow-2xl hover:shadow-3xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 flex items-center justify-center border-2 border-amber-300/50"
          size="icon"
          aria-label="Open AI Chat"
        >
          {/* Animated Icon */}
          <div className="relative">
            <svg 
              className="w-7 h-7 transform transition-transform duration-300 group-hover:scale-110" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
              />
            </svg>
            
            {/* Animated Pulsing Dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
            Ask FilmOdyssey AI
            <div className="absolute top-1/2 left-full -mt-2 border-4 border-transparent border-l-gray-900" />
          </div>
        </Button>
      </div>

      <AIChatModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}