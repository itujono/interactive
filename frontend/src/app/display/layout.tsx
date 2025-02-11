import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Display',
  description: 'Scene Display',
};

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
