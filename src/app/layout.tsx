import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Splt — Split expenses. Stay friends.',
  description: 'Easy expense sharing for friends, roommates and travel groups.',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}