import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, Camera, FileText, Gavel, BookOpen, Shield, Download } from 'lucide-react';

export default function Institucional() {
  return (
    <main className="flex-grow pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[350px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-primary-container">
          <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuClv1-rFYgyIBZ95jY9nj08tjqMJWH-BHfLJFou3zi-UJ_gWGXBnxE0hMAiw5didxv2Z9hbSnDFStu_Sjk7HmyEnDrDQoPpjR76IuSGzYArEi7X285b7_2M_gPUHlUoZZrmfz_fNPV2mvot_bp24k5h9G0lS1-3JMbhF42NFrpLDttxrbBSuMrsKtljrrKZqhbZwSsqO3o-Zld9lZiwW_QsOj8sw057SgeDW3HE8hj0Ixjrx9HWwseo2BnBCpj8MeNQWaE6mvmS4Z8" alt="Handball Hero" className="object-cover opacity-40" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent opacity-80"></div>
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-12">
          <div className="text-white max-w-3xl">
            <span className="inline-block py-1 px-3 bg-secondary-container text-on-secondary-container rounded font-label-bold mb-4 uppercase tracking-wider text-sm">DESDE 2021</span>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight uppercase italic drop-shadow-md">Nossa História</h1>
            <p className="text-lg md:text-xl opacity-90 leading-relaxed mb-8">
              Fundada com o propósito de elevar o desporto nacional, a nossa associação tem sido o pilar do handebol de elite. Nossa missão é fomentar o talento, garantir a integridade competitiva e inspirar as novas gerações através da excelência técnica e do espírito esportivo inabalável.
            </p>
            <div className="flex gap-4">
              <button className="bg-secondary-container hover:bg-on-secondary-fixed-variant text-white px-lg py-sm rounded-lg font-label-bold transition-all flex items-center gap-2">
                Saiba Mais <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Diretoria */}
      <section className="py-12 px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center mb-6 text-center">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Liderança e Governança</h2>
          <div className="h-1.5 w-24 bg-secondary-container rounded-full mb-6"></div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Os profissionais dedicados que conduzem o destino do handebol profissional com transparência e paixão.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Presidente */}
          <div className="md:col-span-2 bg-white border border-outline-variant p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-48 h-48 relative flex-shrink-0">
              <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7BgUTAJ8vtK881rWaZmlRiWsVsxL2kAlQABTN_ZympL5qz28gwX4W0UjZOXWolibMDBARZloMhAN0cghrPt890wawcSYVJrD9SuEgX7WWV7raZzl2pBSDVKdE0OYXLBtCB5zr25h9NwnnwPcsayYMQcA91oKT7tfkp4Xl6kewOM4xQdA6R7quK9gN-zjpqfpE4ALUe6PTf67gsVtKNWGR9robGKZ7cVE3R4SBBX1dw-WvJ2hveIW-z5LuyRl5lu0XFHYIoAEfqKs" alt="Presidente" className="object-cover rounded-lg grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="text-secondary font-label-bold uppercase tracking-wider text-sm">Presidente</span>
              <h3 className="font-headline-md text-headline-md text-primary mt-1">Josaniel Andrade</h3>
              <p className="font-body-md text-on-surface-variant mt-2">Ex-atleta olímpico e gestor esportivo com mais de 25 anos de experiência na estruturação de ligas profissionais.</p>
              <div className="flex gap-4 mt-6">
                <Mail className="text-primary cursor-pointer w-6 h-6" />
                <Camera className="text-primary cursor-pointer w-6 h-6" />
              </div>
            </div>
          </div>
          {/* Vice */}
          <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
            <div className="w-32 h-32 relative mb-6">
              <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7zPhH9j_cPObYadhs3WhdU-swvWn28X7eWysA9VzBfN-fcTxAy6i28T4RrssSA2mdHHKlczNsf_tkd_wJPCewQSbcpbyfeSFeX9AnCQz3ipf8iEIfX6LKA058Mx62JqA8nZySy4AF7lfxZPntfmMlzWJh8Xe4QhChrDM6kcx8B2BB34dhg_K1pR64rIpVgF8hUSIPufrLX7pqAqDYF_F4aWdaNH6sYWUroDC9CZE42JU7jXmKGIyJwZ6HGjiq-1g_DW6vnIifkoI" alt="Vice-Presidente" className="object-cover rounded-full border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
            </div>
            <span className="text-secondary font-label-bold uppercase tracking-wider text-xs">Vice-Presidente</span>
            <h3 className="font-headline-md text-headline-md text-primary mt-1 text-xl">Rômulo Ramos</h3>
            <p className="font-body-md text-on-surface-variant text-sm mt-2 px-2">Especialista em marketing esportivo e relações institucionais.</p>
          </div>
          {/* Diretor Técnico */}
          <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
            <div className="w-32 h-32 relative mb-6">
              <Image fill src="/ahmpNormando.png" alt="Diretor Técnico - Normando Filho" className="object-cover rounded-full border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
            </div>
            <span className="text-secondary font-label-bold uppercase tracking-wider text-xs">Diretor Técnico</span>
            <h3 className="font-headline-md text-headline-md text-primary mt-1 text-xl">Normando Filho</h3>
            <p className="font-body-md text-on-surface-variant text-sm mt-2 px-2">Responsável pela coordenação técnica de todas as categorias nacionais.</p>
          </div>
          {/* Diretor Financeiro */}
          <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
            <div className="w-32 h-32 relative mb-6">
              <Image fill src="/ahmpCristhiano.png" alt="Diretor Financeiro - Cristhiano Furlaneto" className="object-cover rounded-full border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
            </div>
            <span className="text-secondary font-label-bold uppercase tracking-wider text-xs">Diretor Financeiro</span>
            <h3 className="font-headline-md text-headline-md text-primary mt-1 text-xl">Cristhiano Furlaneto</h3>
            <p className="font-body-md text-on-surface-variant text-sm mt-2 px-2">Gestão de recursos e transparência administrativa.</p>
          </div>
          {/* Diretor Comunicação */}
          <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
            <div className="w-32 h-32 relative mb-6">
              <Image fill src="/ahmpGaldino.png" alt="Comunicação - José Galdino" className="object-cover rounded-full border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
            </div>
            <span className="text-secondary font-label-bold uppercase tracking-wider text-xs">Comunicação</span>
            <h3 className="font-headline-md text-headline-md text-primary mt-1 text-xl">José Galdino</h3>
            <p className="font-body-md text-on-surface-variant text-sm mt-2 px-2">Estratégias de mídia e cobertura de eventos oficiais.</p>
          </div>
        </div>
      </section>

      {/* Seção Estatutos e Documentos */}
      <section className="bg-primary py-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase italic">Estatutos e Documentos</h2>
              <p className="text-lg text-on-primary-container leading-relaxed">Acesse toda a base normativa que rege o funcionamento da nossa associação e garante a transparência institucional.</p>
            </div>
            <button className="bg-white text-primary px-6 py-3 rounded-lg font-label-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors">
              <FileText className="w-5 h-5" /> Arquivo Completo
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Doc 1 */}
            <div className="bg-primary-container border-2 border-on-tertiary-container/30 p-6 rounded-lg group hover:border-secondary-container transition-all">
              <div className="flex justify-between items-start mb-6">
                <Gavel className="text-secondary-container w-10 h-10" />
                <span className="text-on-primary-container font-label-bold text-xs uppercase bg-primary px-2 py-1">PDF 2.4MB</span>
              </div>
              <h4 className="font-headline-md text-white mb-2 text-xl">Estatuto Social</h4>
              <p className="font-body-md text-on-primary-container text-sm mb-6">Regimento principal contendo as normas de fundação, direitos e deveres dos associados.</p>
              <button className="w-full border-2 border-secondary-container text-secondary-container py-2 rounded font-label-bold hover:bg-secondary-container hover:text-white transition-all flex justify-center items-center gap-2">
                <Download className="w-5 h-5" /> BAIXAR
              </button>
            </div>
            {/* Doc 2 */}
            <div className="bg-primary-container border-2 border-on-tertiary-container/30 p-6 rounded-lg group hover:border-secondary-container transition-all">
              <div className="flex justify-between items-start mb-6">
                <BookOpen className="text-secondary-container w-10 h-10" />
                <span className="text-on-primary-container font-label-bold text-xs uppercase bg-primary px-2 py-1">PDF 1.8MB</span>
              </div>
              <h4 className="font-headline-md text-white mb-2 text-xl">Regulamento Geral</h4>
              <p className="font-body-md text-on-primary-container text-sm mb-6">Conjunto de regras técnicas e disciplinares que governam todas as competições oficiais.</p>
              <button className="w-full border-2 border-secondary-container text-secondary-container py-2 rounded font-label-bold hover:bg-secondary-container hover:text-white transition-all flex justify-center items-center gap-2">
                <Download className="w-5 h-5" /> BAIXAR
              </button>
            </div>
            {/* Doc 3 */}
            <div className="bg-primary-container border-2 border-on-tertiary-container/30 p-6 rounded-lg group hover:border-secondary-container transition-all">
              <div className="flex justify-between items-start mb-6">
                <Shield className="text-secondary-container w-10 h-10" />
                <span className="text-on-primary-container font-label-bold text-xs uppercase bg-primary px-2 py-1">PDF 0.9MB</span>
              </div>
              <h4 className="font-headline-md text-white mb-2 text-xl">Código de Ética</h4>
              <p className="font-body-md text-on-primary-container text-sm mb-6">Diretrizes de conduta para atletas, técnicos e oficiais, visando o fair-play absoluto.</p>
              <button className="w-full border-2 border-secondary-container text-secondary-container py-2 rounded font-label-bold hover:bg-secondary-container hover:text-white transition-all flex justify-center items-center gap-2">
                <Download className="w-5 h-5" /> BAIXAR
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
