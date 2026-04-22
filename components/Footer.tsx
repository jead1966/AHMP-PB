import Link from 'next/link';
import { Mail, Share2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t-4 border-orange-500 bg-blue-900 dark:bg-black fade-in transition-opacity mt-auto">
      <div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center max-w-[1400px] mx-auto gap-8 md:gap-0">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="text-xl font-bold text-white uppercase tracking-tight mb-2">Handball Pro</div>
          <p className="font-body-md text-xs tracking-wide text-blue-200/70">
            © 2024 Associação Internacional de Handebol. Momento Controlado.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6">
          <Link href="#" className="font-body-md text-xs tracking-wide text-blue-200/70 hover:text-white hover:underline decoration-orange-500 decoration-2 underline-offset-4 transition-all">Política de Privacidade</Link>
          <Link href="#" className="font-body-md text-xs tracking-wide text-blue-200/70 hover:text-white hover:underline decoration-orange-500 decoration-2 underline-offset-4 transition-all">Termos de Serviço</Link>
          <Link href="#" className="font-body-md text-xs tracking-wide text-blue-200/70 hover:text-white hover:underline decoration-orange-500 decoration-2 underline-offset-4 transition-all">Antidopagem</Link>
          <Link href="#" className="font-body-md text-xs tracking-wide text-blue-200/70 hover:text-white hover:underline decoration-orange-500 decoration-2 underline-offset-4 transition-all">Patrocínios</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-blue-200/70 hover:text-orange-500 transition-colors bg-white/5 p-2 rounded-full border border-white/10 hover:border-orange-500/50">
            <Mail className="w-5 h-5" />
          </Link>
          <Link href="#" className="text-blue-200/70 hover:text-orange-500 transition-colors bg-white/5 p-2 rounded-full border border-white/10 hover:border-orange-500/50">
            <Share2 className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
