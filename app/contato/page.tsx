import Image from 'next/image';
import { MapPin, Phone, Mail, Camera, Users, MessageCircle } from 'lucide-react';

export default function Contato() {
  return (
    <main className="flex-grow pt-[56px]">
      {/* Hero Section */}
      <section className="relative h-[250px] min-h-[200px] flex items-center justify-center bg-primary-container overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKoVwbH_SHUWECGr1FshkMKK3ep35GKAB8LfYbKJFmDQ8OTUcAfdgvC-jyV6dKRFkGA4vfc0AxsUigClJXgEq7YxejsNCtzDyxzEmkLwEC-yOKOAj13mFCDUxGboPUn8j4HBe0F9TyAqI5AdVKNPaPJ-ANLtpIk7WElK4GN_i_U1XtpMqsUu9wdB-Q59SzemPzmK0QigIoHdn0TyYax79BPP2rbK4wUn9qCQGNrkJRLi01wMZiCoruFbbE2RtBy9KMzqF_GiDSRK4')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container to-transparent opacity-80"></div>
        <div className="relative z-10 text-center px-gutter">
          <h1 className="font-headline-xl text-headline-xl text-on-primary uppercase text-white drop-shadow-lg">Entre em Contato</h1>
          <p className="font-body-lg text-body-lg text-primary-fixed mt-2 max-w-2xl mx-auto">Estamos aqui para responder suas dúvidas sobre a Associação, campeonatos, e como se envolver.</p>
        </div>
      </section>

      {/* Contact Layout */}
      <section className="max-w-[1400px] mx-auto px-gutter py-8 -mt-[40px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 glass-card rounded-xl p-6 sm:p-6">
            <h2 className="font-headline-md text-headline-md text-primary-container mb-2 uppercase">Envie uma Mensagem</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Preencha o formulário abaixo e retornaremos o mais breve possível.</p>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-label-bold text-label-bold text-primary-container mb-1 uppercase text-xs" htmlFor="name">Nome</label>
                  <input className="rounded-DEFAULT border-2 border-surface-variant bg-surface-container-lowest text-on-surface p-3 focus:border-primary-container focus:ring-0 transition-colors font-body-md outline-none" id="name" placeholder="Seu nome completo" type="text" />
                </div>
                <div className="flex flex-col">
                  <label className="font-label-bold text-label-bold text-primary-container mb-1 uppercase text-xs" htmlFor="email">E-mail</label>
                  <input className="rounded-DEFAULT border-2 border-surface-variant bg-surface-container-lowest text-on-surface p-3 focus:border-primary-container focus:ring-0 transition-colors font-body-md outline-none" id="email" placeholder="seu@email.com" type="email" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-label-bold text-label-bold text-primary-container mb-1 uppercase text-xs" htmlFor="subject">Assunto</label>
                <input className="rounded-DEFAULT border-2 border-surface-variant bg-surface-container-lowest text-on-surface p-3 focus:border-primary-container focus:ring-0 transition-colors font-body-md outline-none" id="subject" placeholder="Ex: Informações sobre torneios" type="text" />
              </div>
              <div className="flex flex-col">
                <label className="font-label-bold text-label-bold text-primary-container mb-1 uppercase text-xs" htmlFor="message">Mensagem</label>
                <textarea className="rounded-DEFAULT border-2 border-surface-variant bg-surface-container-lowest text-on-surface p-3 focus:border-primary-container focus:ring-0 transition-colors font-body-md resize-none outline-none" id="message" placeholder="Como podemos ajudar?" rows={5}></textarea>
              </div>
              <button className="w-full sm:w-auto bg-secondary-container text-on-secondary px-8 py-3 rounded-DEFAULT font-label-bold text-label-bold uppercase tracking-wider hover:bg-secondary transition-colors mt-4 shadow-sm hover:shadow-md" type="submit">Enviar Mensagem</button>
            </form>
          </div>

          {/* Right Column: Info & Socials */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Info Cards */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_2px_10px_-4px_rgba(0,35,102,0.05)] border-t-4 border-t-primary-container">
              <h3 className="font-headline-md text-headline-md text-primary-container mb-8 uppercase">Informações de Contato</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-fixed-dim text-primary-container p-3 rounded-full flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-label-bold text-label-bold text-on-surface uppercase">Endereço</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">Rua do Handebol, 123<br />João Pessoa, PB - 58000-000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary-fixed-dim text-primary-container p-3 rounded-full flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-label-bold text-label-bold text-on-surface uppercase">Telefone</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">+55 11 1234-5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary-fixed-dim text-primary-container p-3 rounded-full flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-label-bold text-label-bold text-on-surface uppercase">E-mail</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">ahmp1969@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-primary-container rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex-grow flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container rounded-full opacity-20 -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-fixed rounded-full opacity-10 -ml-12 -mb-12"></div>
              <div className="relative z-10 text-center">
                <h3 className="font-headline-md text-headline-md mb-3 uppercase tracking-tight">Siga-nos</h3>
                <p className="font-body-md text-body-md text-primary-fixed-dim mb-8 text-sm">Acompanhe as últimas notícias e bastidores em nossas redes.</p>
                <div className="flex justify-center gap-6">
                  <a aria-label="Instagram" className="bg-white/10 hover:bg-secondary-container text-white p-3 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center w-12 h-12" href="#">
                    <Camera className="w-6 h-6" />
                  </a>
                  <a aria-label="Facebook" className="bg-white/10 hover:bg-secondary-container text-white p-3 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center w-12 h-12" href="#">
                    <Users className="w-6 h-6" />
                  </a>
                  <a aria-label="Twitter" className="bg-white/10 hover:bg-secondary-container text-white p-3 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center w-12 h-12" href="#">
                    <MessageCircle className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full h-[300px] bg-surface-variant relative overflow-hidden">
        <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgt59dyX6St9bZDxtUOY2cj6w5U4Yjr7WEWQgttWzuHBnnPDKTT1GKybLxGS-E2yfAMTNBhB-DGEI5wWuHEo1ujVv-TeKdcMaM1NynIcW8X_g9XXXJ7GE5FksCGLA2XgufxngzuFp8_SadPqvCfNxPGkmyWEgOz8i__D19gfqwopH1OAfubwPj0WJiaRjU0F90gmcHpiVmENQOp43DRlV2DwgichSrHZiz7KkMANeaMwBz1t9RXl4wCgVlvS5ODEpt9d2W0zJORds" alt="Map View" className="object-cover opacity-60 grayscale" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-primary-container mix-blend-color opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-secondary-container text-on-secondary p-2 rounded-full shadow-lg mb-2">
            <MapPin className="text-3xl w-8 h-8" />
          </div>
          <div className="bg-white px-4 py-1 rounded-DEFAULT shadow-md font-label-bold text-label-bold text-primary-container border border-outline-variant text-sm">
            Sede da Associação
          </div>
        </div>
      </section>
    </main>
  );
}
