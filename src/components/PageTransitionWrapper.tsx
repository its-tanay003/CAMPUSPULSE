import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

export const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div 
      key={location.pathname} 
      className="animate-page-enter w-full min-h-full"
    >
      {children}
    </div>
  );
};

