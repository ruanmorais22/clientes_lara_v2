import React from 'react';

interface CardBadgeProps {
  text: string;
}

export function CardBadge({ text }: CardBadgeProps) {
  return (
    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
      {text}
    </span>
  );
}