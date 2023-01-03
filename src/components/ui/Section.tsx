import { ReactNode } from 'react';

export default function Section({ children }: { children: ReactNode }) {
  return <section className="max-w-6xl mx-auto">{children}</section>;
}
