import type { Metadata } from 'next';
import { EditorToaster } from './EditorToaster';

export const metadata: Metadata = {
  title: 'Editor Visual - Rural Commerce',
  description: 'Sistema de edição visual de páginas',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
      <EditorToaster />
    </div>
  );
}
