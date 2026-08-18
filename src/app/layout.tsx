import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoKnowledge',
  description:
    'Scrape a company website and turn it into a structured, editable knowledge base.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

// note: maybe remove antialiased based on UI/UX of moflo
