import './globals.css';

export const metadata = {
  title: 'Redrob Candidate Intelligence Dashboard',
  description: 'Real candidate shortlist insights and ranked submission output',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}