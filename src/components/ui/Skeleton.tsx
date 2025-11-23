import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const baseStyles = 'animate-pulse bg-neutral-200';

  const variantStyles = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1em' : '40px'),
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;

// Skeleton Group Components
export const SkeletonProductCard: React.FC = () => (
  <div className="space-y-3">
    <Skeleton variant="rectangular" height={300} />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="40%" />
  </div>
);

export const SkeletonProductDetail: React.FC = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    <div className="space-y-4">
      <Skeleton variant="rectangular" height={500} />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={100} />
        ))}
      </div>
    </div>
    <div className="space-y-6">
      <Skeleton variant="text" width="70%" height={40} />
      <Skeleton variant="text" width="30%" height={30} />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rectangular" height={50} />
      <Skeleton variant="rectangular" height={50} />
    </div>
  </div>
);