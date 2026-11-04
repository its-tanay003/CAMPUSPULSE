import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-card rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${
        hoverable ? 'hover:border-indigo-500/40 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-950/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

