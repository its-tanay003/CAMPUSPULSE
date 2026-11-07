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
      className={`glass-card rounded-3xl p-6 relative overflow-hidden ${
        hoverable ? 'hover-lift hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-950/50 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
