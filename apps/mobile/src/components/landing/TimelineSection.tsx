import React from 'react';
import { GlassSurface } from '@nexa/ui';
import { LogIn, Smartphone, CreditCard, MessageSquare } from 'lucide-react';

export const TimelineSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <LogIn className="w-5 h-5 text-sky-400" />,
      title: 'Login Unificado com Google',
      desc: 'Entre com sua conta Google pelo Firebase Auth em um clique. Uma conta serve para todo o ecossistema.',
    },
    {
      num: '02',
      icon: <Smartphone className="w-5 h-5 text-indigo-400" />,
      title: 'Escolha seu Número Virtual',
      desc: 'Navegue pelo catálogo com números brasileiros realistas e filtre por DDD, padrão ou preço.',
    },
    {
      num: '03',
      icon: <CreditCard className="w-5 h-5 text-amber-400" />,
      title: 'Pague com NEXA Pay',
      desc: 'Conclua o checkout usando os R$ 300,00 de créditos virtuais da sua carteira de demonstração gratuita.',
    },
    {
      num: '04',
      icon: <MessageSquare className="w-5 h-5 text-purple-400" />,
      title: 'Ative o NEXA Chat',
      desc: 'Com o número ativado, abra o mensageiro instantâneo e converse com outros usuários reais.',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center gap-3 mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
          Passo a Passo
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
          Como Funciona o Ecossistema
        </h2>
        <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
          Quatro etapas fluidas que conectam o banco simulado, a operadora e o mensageiro instantâneo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <GlassSurface
            key={idx}
            variant="dense"
            className="p-6 flex flex-col justify-between gap-4 border border-white/10 hover:border-sky-400/30 transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-black text-white/20">{s.num}</span>
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                {s.icon}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">{s.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
            </div>
          </GlassSurface>
        ))}
      </div>
    </section>
  );
};
