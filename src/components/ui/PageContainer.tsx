import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  size = 'lg',
  className = ''
}) => {
  const maxSizes = {
    sm: 'max-w-4xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl'
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-8">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxSizes[size]} ${className}`}>
        {children}
      </div>
    </div>
  );
};
