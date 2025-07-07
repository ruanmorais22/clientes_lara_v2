import React from 'react';

interface CardImageProps {
  src: string | null;
  alt: string;
}

export function CardImage({ src, alt }: CardImageProps) {
  return (
    <img
      src={src || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'}
      alt={alt}
      className="w-full h-32 object-cover"
    />
  );
}