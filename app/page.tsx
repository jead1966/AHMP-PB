import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Activity, Medal, ChevronRight, Send, Mail, Play, Quote, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-grow">
      {/* Seção Hero */}
      <section className="relative w-full flex items-center justify-center overflow-hidden h-[400px]">
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span className="bg-secondary-container text-on-secondary-fixed-variant px-3 py-1 rounded-full font-label-bold uppercase tracking-wider mb-4 border border-secondary-fixed font-black text-[64px]">AHMP</span>
          <h1 className="font-headline-xl text-headline-xl mb-6 drop-shadow-lg text-[#FF8C00]">Associação de Handebol Master da Paraíba</h1>
          <p className="font-body-lg mb-8 max-w-2xl mx-auto text-primary-container font-bold text-2xl">Elevando o esporte, unindo atletas. Junte-se à maior comunidade de handebol da região e participe de competições de alto nível.</p>
        </div>
      </section>

      {/* Divulgação */}
      <section className="py-xl px-gutter max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-10">
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

      {/* Notícias */}
      <section className="py-xl px-gutter max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Notícias</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Últimas atualizações e destaques do campeonato.</p>
          </div>
          <Link href="#" className="hidden md:flex font-label-bold text-label-bold text-secondary-container hover:text-secondary items-center gap-1 transition-colors">
            Ver Todas <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
          <div className="md:col-span-2 md:row-span-2 relative rounded-lg overflow-hidden group cursor-pointer bg-surface-container border border-outline-variant hover:border-primary-container transition-all shadow-sm hover:shadow-md">
            <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfDpes7rTGoTYFRd26lzmQv8rb6UV7oUFZOo5Y-9MkjDsvUx4rUY_XUXrP9BaqGUdKUxeZApKK7VWythjuXAUWKe3fgV4qJpOuSBxEybOIQlclxqk9gZFdZUZqml1JDp9s9rlRPXXq6eQuQHgoK7nmW1bqX9IvYyRm_Li8AKC5b796Xw5I3UO9A_nLaXAA8MdOfopRaXpzW_dGvt8AWxNR-8oLvaJyeFhB1VXEf6Woklsz04Kq6bVUU9cm8RUB0ecFsrtb2YjAOnQ" alt="Notícia" className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="inline-block bg-secondary-container text-on-secondary px-2 py-1 rounded text-xs font-label-bold mb-3">Campeonato</span>
              <h3 className="font-headline-md text-headline-md text-on-primary mb-2 line-clamp-2">Campeonato Estadual Começa Próximo Mês com Novas Regras</h3>
              <p className="font-body-md text-body-md text-inverse-primary line-clamp-2">A comissão técnica anunciou mudanças significativas para a temporada de 2024, visando aumentar a dinâmica das partidas.</p>
            </div>
          </div>
          <div className="col-span-1 row-span-1 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary-container transition-all shadow-sm hover:shadow-md flex flex-col cursor-pointer group">
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
          <div className="col-span-1 row-span-1 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary-container transition-all shadow-sm hover:shadow-md flex flex-col cursor-pointer group">
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
          <div className="md:col-span-2 row-span-1 bg-primary text-on-primary rounded-lg border border-primary-container overflow-hidden p-8 flex items-center justify-between relative shadow-sm">
            <div className="relative z-10 max-w-sm">
              <h4 className="font-headline-md text-headline-md mb-2">Boletim Informativo</h4>
              <p className="font-body-md text-body-md text-inverse-primary mb-4">Receba as últimas notícias diretamente no seu e-mail.</p>
              <div className="flex gap-2">
                <input className="bg-surface/10 border-surface-tint text-on-primary placeholder-outline focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-DEFAULT px-4 py-2 w-full font-body-md text-body-md" placeholder="Seu e-mail" type="email" />
                <button className="bg-secondary-container text-on-secondary px-4 py-2 rounded-DEFAULT font-label-bold text-label-bold border-2 border-transparent hover:bg-secondary transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <Mail className="w-32 h-32 text-surface-tint opacity-20 absolute right-8 bottom-[-20px] pointer-events-none transform -rotate-12" />
          </div>
        </div>
      </section>

      {/* Vídeos */}
      <section className="py-xl px-gutter max-w-[1400px] mx-auto bg-surface-container-low rounded-xl mb-xl mt-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Vídeos</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Melhores momentos e jogadas da semana.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative rounded-lg overflow-hidden group cursor-pointer aspect-video bg-black shadow-md border border-outline-variant">
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
          <div className="flex flex-col gap-6">
            <div className="relative rounded-lg overflow-hidden group cursor-pointer aspect-video bg-black shadow-sm border border-outline-variant">
              <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEJ5s03k5riRfHa7Pq8JYch8CJQtA5QsbY1RSqP3BMHoY9D_lKcdplEd7bo7dsp-ihCh198T7WW6WXzCoUfSaXhvK1MNQKjq4a2isdQcIXMDbJhrDMZMi-HSJKof6joqj27Fi4L1tpW4PRoBmHgKZlNC_A6jraou9lFSDbKHUF8FKKBt9vERNsTFdcg1LGMYoccNxTdSc6immZOAQnMvP6LtRy6GbHq60RxkX1_zPAOdUxahjfqRY5x2-qghsVdwvHMACgwDcYD8c" alt="Vídeo 1" className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center group-hover:bg-secondary-container group-hover:border-transparent transition-all duration-300">
                  <Play fill="currentColor" className="text-white w-6 h-6 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h4 className="font-label-bold text-label-bold text-on-primary">Top 10 Defesas da Rodada</h4>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden group cursor-pointer aspect-video bg-black shadow-sm border border-outline-variant">
              <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4G_w5U7mBJgtNi1epYmy1rlkCsfwTvRlAMMDzKuv7KaeLa4agMglXAMtnFi32p09KIGI3PgxOReYe0bUay7KNqlsP856fVLrjbkrpDHaH7vFFO4FRLG1Z4E3Ljcesp09jG63n-ZzLEtN6zCXqRBJ8csruzQcQQVAqYtZ8G414VxZAFzKyI83QoN478V7AVoNr2szzIwVpP3qaTxnRzwgH_0I8_T_kpHnPeqYsQH9eL_WGP7sSItKCf8eUy0WI2TqvKv3xM_tgtQ0" alt="Vídeo 2" className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center group-hover:bg-secondary-container group-hover:border-transparent transition-all duration-300">
                  <Play fill="currentColor" className="text-white w-6 h-6 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h4 className="font-label-bold text-label-bold text-on-primary">Entrevista: Técnico da Seleção</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entrevista */}
      <section className="py-xl relative overflow-hidden bg-primary text-on-primary">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-surface-tint opacity-20 transform rotate-12 blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-secondary-container opacity-10 transform -rotate-12 blur-3xl"></div>
        <div className="max-w-[1400px] mx-auto px-gutter relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-square max-w-md mx-auto rounded-xl overflow-hidden border-4 border-surface-tint/30 shadow-2xl relative">
              <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhkjgb5hsCUipZ7C4Baas3ksvbhsXZBXEA0-U-dgh5Do1ZJknOYT7ZbqjXcSIYkyy3I2D_K14EB0ftxeh2i45EYy35oKW9_1XPKmETOyWfcZyJtw66XxyadqK1QClhxkLN82kDCboUelLvyTfuAW9UeMiGHBpuFE9yj1Ga-yIhrJoePqW5MMroxPp3S9NZobNYnFU2fg54FVE2CLgfn12ncdouJZMWTfmc2s01PGCKt1E6mZkMaxH5apIgJh4DutnIuiOcXcs_4xU" alt="Entrevistado" className="object-cover" referrerPolicy="no-referrer" />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-primary to-transparent">
                <h3 className="font-headline-md text-headline-md text-on-primary">Carlos &apos;Muralha&apos; Silva</h3>
                <p className="font-body-md text-body-md text-inverse-primary">Ex-Goleiro & Técnico Estadual</p>
              </div>
            </div>
            <Quote className="w-32 h-32 text-secondary-container absolute top-[-20px] left-[-20px] opacity-50 z-[-1]" fill="currentColor" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="font-headline-lg text-headline-lg text-secondary-fixed mb-6">Entrevista da Semana</h2>
            <blockquote className="font-headline-md text-headline-md font-light leading-relaxed mb-8 italic text-inverse-primary border-l-4 border-secondary-container pl-6 py-2 bg-white/5 backdrop-blur-sm rounded-r-lg">
              &quot;O handebol não é apenas força bruta; é sobre a inteligência tática, a leitura do jogo em frações de segundo e a união inquebrável da equipe dentro da quadra.&quot;
            </blockquote>
            <Link href="#" className="inline-flex items-center gap-2 font-label-bold text-label-bold text-secondary-container hover:text-secondary-fixed-dim transition-colors group self-start">
              Ler Entrevista Completa
              <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
