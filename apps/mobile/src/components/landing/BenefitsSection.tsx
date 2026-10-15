import React from 'react';
import { GlassCard } from '@nexa/ui';
import { Shield, Coins, Zap, MessageSquare, Video, Lock } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Shield className="w-6 h-6 text-sky-400" />,
      title: 'Zero Risco de SIM Swap',
      description: 'Como as linhas operam estritamente no namespace seguro do ecossistema, você está 100% imune a golpes de clonagem de chip de operadoras convencionais.',
    },
    {
      icon: <Coins className="w-6 h-6 text-amber-400" />,
      title: 'Pague com Créditos Fictícios',
      description: 'Experimente todo o processo de checkout financeiro utilizando os R$ 300,00 concedidos gratuitamente na carteira de demonstração do NEXA Pay.',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
      title: 'Passaporte para o NEXA Chat',
      description: 'Sua linha virtual é a chave de entrada do mensageiro. Adicione contatos pelo número virtual e converse em tempo real com Socket.IO.',
    },
    {
      icon: <Video className="w-6 h-6 text-emerald-400" />,
      title: 'Chamadas WebRTC P2P',
      description: 'Vídeo e áudio de alta definição transmitidos diretamente entre dispositivos através de conexões ponto a ponto seguras.',
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-400" />,
      title: 'Ativação Atômica Instantânea',
      description: 'Assim que o pagamento no NEXA Pay é confirmado, o backend vincula o número ao seu usuário no Firestore sem esperas.',
    },
    {
      icon: <Lock className="w-6 h-6 text-rose-400" />,
      title: 'Privacidade LGPD por Padrão',
      description: 'Zero coleta de CPF, RG ou dados cadastrais invasivos. Seus dados pertencem a você e podem ser exportados ou excluídos a qualquer momento.',
    },
  ];

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          Por Que Escolher a NEXA Mobile
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
          A Revolução da Operadora Virtual
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Projetada com arquitetura de alta integridade, separação de domínios e a mais sofisticada experiência visual da web moderna.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((b, idx) => (
          <GlassCard
            key={idx}
            interactive={true}
            className="p-7 flex flex-col gap-4 border border-white/10 hover:border-indigo-400/40 transition-all hover:scale-[1.02]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
              {b.icon}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{b.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{b.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};
