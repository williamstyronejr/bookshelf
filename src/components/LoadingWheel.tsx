import { FC } from 'react';

const LoadingWheel: FC<{ className?: string }> = ({
  className = 'text-center text-4xl mb-10',
}) => (
  <div className={className}>
    <i className="fas fa-spinner animate-spin" />
  </div>
);

export default LoadingWheel;
