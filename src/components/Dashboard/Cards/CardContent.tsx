import React from 'react';
import { CardBadge } from './CardBadge';

interface CardContentProps {
  title: string;
  description: string;
  project?: string;
}

export function CardContent({ title, description, project }: CardContentProps) {
  return (
    <div className="p-3">
      <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      {project && (
        <div className="flex items-center gap-2 mb-2">
          <CardBadge text={project} />
        </div>
      )}
      <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
    </div>
  );
}