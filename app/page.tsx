import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Activity, Medal, ChevronRight, Send, Mail, Play, Quote, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-grow pt-16">
      {/* Seção Hero */}
      <section className="relative w-full flex items-center justify-center overflow-hidden h-[300px]">
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-headline-xl text-headline-xl mb-6 drop-shadow-lg text-[#FF8C00]">Associação de Handebol Master da Paraíba - AHMP</h1>
          <p className="font-body-lg mb-8 max-w-2xl mx-auto text-primary-container font-bold text-2xl">Elevando o esporte, unindo atletas. Junte-se à maior comunidade de handebol da região e participe de competições de alto nível.</p>
        </div>
      </section>

      {/* Notícias */}
      <section className="py-12 px-gutter max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Notícias</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Últimas atualizações e destaques do campeonato.</p>
          </div>
          <Link href="#" className="hidden md:flex font-label-bold text-label-bold text-secondary-container hover:text-secondary items-center gap-1 transition-colors">
            Ver Todas <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[300px]">
          <div className="md:col-span-2 md:row-span-2 relative rounded-lg overflow-hidden group cursor-pointer bg-surface-container border border-outline-variant hover:border-primary-container transition-all shadow-sm hover:shadow-md">
            <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfDpes7rTGoTYFRd26lzmQv8rb6UV7oUFZOo5Y-9MkjDsvUx4rUY_XUXrP9BaqGUdKUxeZApKK7VWythjuXAUWKe3fgV4qJpOuSBxEybOIQlclxqk9gZFdZUZqml1JDp9s9rlRPXXq6eQuQHgoK7nmW1bqX9IvYyRm_Li8AKC5b796Xw5I3UO9A_nLaXAA8MdOfopRaXpzW_dGvt8AWxNR-8oLvaJyeFhB1VXEf6Woklsz04Kq6bVUU9cm8RUB0ecFsrtb2YjAOnQ" alt="Notícia" className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="inline-block bg-secondary-container text-on-secondary px-2 py-1 rounded text-xs font-label-bold mb-3">Campeonato</span>
              <h3 className="font-headline-md text-headline-md text-on-primary mb-2 line-clamp-2">Campeonato Estadual Começa Próximo Mês com Novas Regras</h3>
              <p className="font-body-md text-body-md text-inverse-primary line-clamp-2">A comissão técnica anunciou mudanças significativas para a temporada de 2024, visando aumentar a dinâmica das partidas.</p>
            </div>
          </div>
          <div className="col-span-1 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary-container transition-all shadow-sm hover:shadow-md flex flex-col cursor-pointer group">
            <div className="h-40 relative overflow-hidden">
              <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi3dY-3ZRR6rjcRgTHJbPA0pFVV3MOvZmHM-qUYS8WCZfFT54sGMOGl-oGGCFokqJUzGCNoCLPA_M02nxlTBvnZv320B_iHqe6IagKEmvuIw4HKhTG0kpZsyJVFcxUsrVt5MY_ZStxPY7oGEFLw0CszGMLGuyNM0zE6zv-TYBo6ZuktyS8S-4600QXsPufT_8XWL4FQ3Up3bamoFF5Zgzuz4Sn15scTfjSm8eUhTI7u6PTa_AIAgCYAg5dJdnsruvgZPqlV7JXpd4" alt="Notícia" className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            </div>
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-xs font-label-bold text-outline mb-2 block">12 Out 2023</span>
                <h4 className="font-label-bold text-label-bold text-on-surface line-clamp-2 hover:text-primary-container transition-colors">Inscrições Abertas para a Liga Juvenil</h4>
              </div>
            </div>
          </div>
          <div className="col-span-1 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary-container transition-all shadow-sm hover:shadow-md flex flex-col cursor-pointer group">
            <div className="h-40 relative overflow-hidden">
              <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5SvxBxBC8GDTlkzemZo-1lgMnPUvnQ9_thz312IDRmiUI2xlVibfibxD5e7xDaNpql63Qm2ETIFYUq4ZEyQKe7ViU1Qui72fizDQ10tnqD833pac7nlF6tlqIhK12axr_qUfhOD3ELAoH7capsoV1a3QCrbL4L8Aqqj3aI7yRaWP0DOt0yMXmwr-TXjMIGJ7igNd6h6ub19JFKKMe35RavIIW0zbRw7_6zvxk3uk_yKn4N2bouwMwNV4nOuUrSF4UGAuB4wwN_8I" alt="Notícia" className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            </div>
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-xs font-label-bold text-outline mb-2 block">10 Out 2023</span>
                <h4 className="font-label-bold text-label-bold text-on-surface line-clamp-2 hover:text-primary-container transition-colors">Clínica de Arbitragem: Atualização de Regras</h4>
              </div>
            </div>
          </div>

          {/* Card Entrevista (integrado nas Notícias) */}
          <div className="md:col-span-3 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary-container transition-all shadow-sm flex flex-col md:flex-row group cursor-pointer mt-2">
            <div className="w-full md:w-[300px] h-64 md:h-full relative overflow-hidden flex-shrink-0">
              <Image fill src="/ze.jpg" alt="Ricardo Oliveira" className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs px-2 py-1 rounded font-label-bold z-10 shadow-sm">Entrevista da Semana</div>
            </div>
            <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
              <h3 className="font-headline-md text-headline-md text-primary mb-1">Wellington Souza de Lima</h3>
              <p className="font-body-sm text-on-surface-variant font-bold uppercase mb-4 tracking-wider">Técnico da AHMP</p>
              <blockquote className="font-body-md text-on-surface italic border-l-4 border-secondary-container pl-4 mb-6 relative">
                &quot;O handebol não é apenas força bruta; é sobre a inteligência tática, a leitura do jogo em frações de segundo e a união inquebrável da equipe dentro da quadra.&quot;
              </blockquote>
              <Link href="#" className="inline-flex items-center gap-2 font-label-bold text-label-bold text-primary hover:text-secondary-container transition-colors mt-auto">
                Ler Entrevista Completa <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Vídeos */}
      <section className="py-12 px-gutter max-w-[1400px] mx-auto bg-surface-container-low rounded-xl mb-12 mt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Vídeos</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Melhores momentos e jogadas da semana.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-lg overflow-hidden group cursor-pointer aspect-video bg-black shadow-md border border-outline-variant">
            <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvj3vHRNc8Zfq5C0ORM3Uqgq_QLiysW30JBfoDlb3SxxxFzj7tXXdvM5bCoatN9ky5zDWJybjoblFjYQ38lk7VJcAkf75hPWsvxqagLQCVh0rYyScj6jQxxvdXeZkM-UMM0BaCiSm6zzp-R-IeEr7jwgra0yHZSvgLC-Ca1hVXvbMukgNy7rBcBUiiQZO8Tk5K-PuKsNzXbzAgbxpc7TPV6Tu1Jqu9vjylOfMsaB-EpLvKBKpQSQ8apPp-8bToOsnx3PTIktC2qv8" alt="Vídeo principal" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Play fill="currentColor" className="text-on-secondary w-8 h-8 ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
              <span className="bg-primary/80 text-on-primary text-xs px-2 py-1 rounded font-label-bold mb-2 inline-block backdrop-blur-sm">Melhores Momentos</span>
              <h3 className="font-headline-md text-headline-md text-on-primary">Final do Campeonato Regional 2023</h3>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden group cursor-pointer aspect-video bg-black shadow-sm border border-outline-variant">
            <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEJ5s03k5riRfHa7Pq8JYch8CJQtA5QsbY1RSqP3BMHoY9D_lKcdplEd7bo7dsp-ihCh198T7WW6WXzCoUfSaXhvK1MNQKjq4a2isdQcIXMDbJhrDMZMi-HSJKof6joqj27Fi4L1tpW4PRoBmHgKZlNC_A6jraou9lFSDbKHUF8FKKBt9vERNsTFdcg1LGMYoccNxTdSc6immZOAQnMvP6LtRy6GbHq60RxkX1_zPAOdUxahjfqRY5x2-qghsVdwvHMACgwDcYD8c" alt="Vídeo 1" className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center group-hover:bg-secondary-container group-hover:border-transparent transition-all duration-300">
                <Play fill="currentColor" className="text-white w-8 h-8 ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="font-headline-md text-headline-md text-on-primary">Top 10 Defesas da Rodada</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Divulgação */}
      <section className="py-12 px-gutter max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Divulgação de Competições</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Próximos torneios e ligas ativas da temporada.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-on-primary w-12 h-12" />
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-label-bold px-3 py-1 rounded-full mb-3 uppercase">Inscrições Abertas</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Copa Verão 2024</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">O maior torneio regional de abertura de temporada para todas as categorias.</p>
            <Link href="#" className="mt-auto w-full py-3 px-6 bg-primary text-on-primary rounded-DEFAULT font-label-bold text-label-bold hover:bg-primary-container transition-colors">Saiba Mais</Link>
          </div>
          <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mb-4">
              <Activity className="text-on-primary w-12 h-12" />
            </div>
            <span className="bg-orange-100 text-orange-800 text-xs font-label-bold px-3 py-1 rounded-full mb-3 uppercase">Em Andamento</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Liga Escolar Sub-17</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Competição focada no desenvolvimento de novos talentos nas escolas parceiras.</p>
            <Link href="#" className="mt-auto w-full py-3 px-6 bg-primary text-on-primary rounded-DEFAULT font-label-bold text-label-bold hover:bg-primary-container transition-colors">Saiba Mais</Link>
          </div>
          <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-24 h-24 bg-tertiary-container rounded-full flex items-center justify-center mb-4">
              <Medal className="text-on-tertiary-container w-12 h-12" />
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-label-bold px-3 py-1 rounded-full mb-3 uppercase">Em Breve</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Torneio dos Campeões</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">O confronto final entre os vencedores das ligas regionais do último ano.</p>
            <Link href="#" className="mt-auto w-full py-3 px-6 bg-primary text-on-primary rounded-DEFAULT font-label-bold text-label-bold hover:bg-primary-container transition-colors">Saiba Mais</Link>
          </div>
        </div>
      </section>


    </main>
  );
}
