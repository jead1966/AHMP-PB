import type { Metadata } from 'next';
import { Lexend, Work_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
});

export const metadata: Metadata = {
  title: 'Associação de Handebol Master da Paraíba',
  description: 'Elevando o esporte, unindo atletas. Junte-se à maior comunidade de handebol.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${lexend.variable} ${workSans.variable} bg-background text-on-background antialiased min-h-[1024px] flex flex-col`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
