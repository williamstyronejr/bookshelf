import { ReactNode } from 'react';

export default function Section({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`max-w-6xl mx-auto ${className}`}>{children}</section>
  );
}
