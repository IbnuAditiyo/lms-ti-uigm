import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`
        relative bg-white 
        rounded-2xl 
        shadow-soft             /* Ganti border keras dengan shadow lembut */
        border border-transparent /* Hilangkan border abu-abu */
        transition-all duration-300
        ${onClick ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''} 
        ${className}
      `} 
      onClick={onClick}
    >
      {/* Dekorasi Garis Atas (Opsional) - Memberi aksen Emerald tanpa dominan */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 transition-opacity group-hover:opacity-100 rounded-t-2xl"></div>
      
      {children}
    </div>
  );
};

// Update CardHeader agar tidak ada garis pembatas kaku
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 pb-3 ${className}`}> {/* Hapus border-b */}
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <h3 className={`card-title text-primary-900 ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`card-description text-gray-500 ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`card-content ${className}`}>
      {children}
    </div>
  );
};

// Update CardFooter
export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 pt-3 bg-gray-50/50 rounded-b-2xl border-t border-gray-50 ${className}`}>
      {children}
    </div>
  );
};