'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Activity, Medal, ChevronRight, Play, ArrowRight, Loader2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [competicoes, setCompeticoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNews, setSelectedNews] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: news } = await supabase.from('noticias').select('*').order('date', { ascending: false });
        const { data: vids } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
        const { data: comps } = await supabase.from('competicoes').select('*').order('created_at', { ascending: false });
        
        if (news) setNoticias(news);
        if (vids) setVideos(vids);
        if (comps) setCompeticoes(comps);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Activity': return <Activity className="text-on-primary w-12 h-12" />;
      case 'Medal': return <Medal className="text-on-primary w-12 h-12" />;
      default: return <Trophy className="text-on-primary w-12 h-12" />;
    }
  };

  return (
    <main className="flex-grow pt-16">
      {/* Seção Hero */}
      <section className="relative w-full flex items-center justify-center overflow-hidden h-[300px]">
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-headline-xl mb-6 drop-shadow-lg text-[#FF8C00]">Associação de Handebol Master da Paraíba - AHMP</h1>
          <p className="font-body-lg mb-8 max-w-2xl mx-auto text-primary-container font-bold text-lg sm:text-xl md:text-2xl">Elevando o esporte, unindo atletas. Junte-se à maior comunidade de handebol da região e participe de competições de alto nível.</p>
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
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {noticias.length > 0 ? (
              <>
                {/* Destaque Principal */}
                <div 
                  onClick={() => setSelectedNews(noticias[0])}
                  className="md:col-span-2 md:row-span-2 relative rounded-lg overflow-hidden group cursor-pointer bg-surface-container border border-outline-variant hover:border-primary-container transition-all shadow-sm hover:shadow-md h-[400px] md:h-auto"
                >
                  <Image 
                    fill 
                    src={noticias[0].image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"} 
                    alt={noticias[0].title} 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                      <span className="inline-block bg-secondary-container text-on-secondary px-2 py-1 rounded text-xs font-label-bold mb-3 uppercase tracking-wider">{noticias[0].category}</span>
                      <h3 className="font-headline-md text-headline-md text-on-primary mb-2 line-clamp-2">{noticias[0].title}</h3>
                      <p className="font-body-md text-body-md text-inverse-primary line-clamp-3">{noticias[0].description || noticias[0].content}</p>
                    </div>
                  </div>
                  
                  {/* Outras notícias */}
                  {noticias.slice(1, 3).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedNews(item)}
                      className="col-span-1 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary-container transition-all shadow-sm hover:shadow-md flex flex-col cursor-pointer group"
                    >
                      <div className="h-40 relative overflow-hidden">
                        <Image 
                          fill 
                          src={item.image_url || "https://images.unsplash.com/photo-1510051646601-996027be280b?auto=format&fit=crop&q=80"} 
                          alt={item.title} 
                          className="object-cover transition-transform duration-500 group-hover:scale-105" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-label-bold text-outline mb-2 block">{new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <h4 className="font-label-bold text-label-bold text-on-surface line-clamp-3 hover:text-primary-container transition-colors">{item.title}</h4>
                          <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{item.description || item.content?.substring(0, 100)}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Exemplo de card de entrevista se houver uma notícia na categoria entrevista */}
                {noticias.find(n => n.category === 'Entrevista') && (
                  <div 
                    onClick={() => setSelectedNews(noticias.find(n => n.category === 'Entrevista'))}
                    className="md:col-span-3 bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary-container transition-all shadow-sm flex flex-col md:flex-row group cursor-pointer mt-2"
                  >
                    <div className="w-full md:w-[300px] h-64 md:h-full relative overflow-hidden flex-shrink-0">
                      <Image 
                        fill 
                        src={noticias.find(n => n.category === 'Entrevista').image_url} 
                        alt="Entrevista" 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs px-2 py-1 rounded font-label-bold z-10 shadow-sm">Entrevista em Destaque</div>
                    </div>
                    <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
                      <h3 className="font-headline-md text-headline-md text-primary mb-1">{noticias.find(n => n.category === 'Entrevista').title}</h3>
                      <p className="font-body-md text-on-surface line-clamp-3 italic mb-6">
                        &quot;{noticias.find(n => n.category === 'Entrevista').description}&quot;
                      </p>
                      <button className="inline-flex items-center gap-2 font-label-bold text-label-bold text-primary hover:text-secondary-container transition-colors mt-auto text-left">
                        Ver Mais <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl py-20 text-center text-slate-400">
                Adicione notícias no painel administrativo para elas aparecerem aqui.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal de Detalhes da Notícia */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="relative h-64 shrink-0">
              <Image 
                fill 
                src={selectedNews.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"} 
                alt={selectedNews.title} 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {selectedNews.category}
                </span>
              </div>
            </div>
            <div className="p-6 md:p-10 overflow-y-auto">
              <div className="text-xs text-slate-400 mb-2 font-medium">
                {new Date(selectedNews.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <h2 className="text-2xl md:text-3xl font-headline-lg text-primary mb-6 leading-tight">
                {selectedNews.title}
              </h2>
              <div className="prose prose-slate max-w-none">
                {selectedNews.content ? (
                  <div className="whitespace-pre-wrap text-on-surface-variant leading-relaxed">
                    {selectedNews.content}
                  </div>
                ) : (
                  <p className="text-on-surface-variant italic">
                    {selectedNews.description}
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vídeos */}
      <section className="py-12 px-gutter max-w-[1400px] mx-auto bg-surface-container-low rounded-xl mb-12 mt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Vídeos</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Melhores momentos e jogadas da semana.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.length > 0 ? (
            videos.slice(0, 2).map((vid) => (
              <Link 
                key={vid.id} 
                href={vid.video_url || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative rounded-lg overflow-hidden group cursor-pointer aspect-video bg-black shadow-md border border-outline-variant block"
              >
                <Image 
                  fill 
                  src={vid.thumbnail_url || "https://images.unsplash.com/photo-1510051646601-996027be280b?auto=format&fit=crop&q=80"} 
                  alt={vid.title} 
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Play fill="currentColor" className="text-on-secondary w-8 h-8 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <span className="bg-primary/80 text-on-primary text-[10px] px-2 py-0.5 rounded font-bold mb-2 inline-block backdrop-blur-sm uppercase tracking-wide">{vid.category}</span>
                  <h3 className="font-bold text-lg md:text-xl">{vid.title}</h3>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 bg-white/50 border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-400">
              Nenhum vídeo disponível no momento.
            </div>
          )}
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
          {competicoes.length > 0 ? (
            competicoes.map((comp) => (
              <div key={comp.id} className="bg-surface-container-low rounded-xl border border-outline-variant p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-4 text-white">
                  {getIcon(comp.icon_type)}
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full mb-3 uppercase ${
                  comp.status.includes('Inscrições') ? 'bg-green-100 text-green-800' :
                  comp.status.includes('Andamento') ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {comp.status}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{comp.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">{comp.description}</p>
                <Link 
                  href={comp.link_url || "#"} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full py-3 px-6 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors text-center"
                >
                  Saiba Mais
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-400">
              Novas competições serão listadas em breve.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
