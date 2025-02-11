import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Control',
  description: 'Scene Control',
};

export default function ControlLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
