import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  className = "" 
}) => {
  if (count === 0) return null;

  return (
    <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-semibold ${className}`}>
      {count > 99 ? '99+' : count}
    </div>
  );
};