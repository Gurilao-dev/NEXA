import React, { useState } from 'react';
import { GlassCard } from '@nexa/ui';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O número virtual recebe SMS ou ligações de operadoras reais?',
      a: 'Não. Os números virtuais no formato brasileiro (+55 DD 9XXXX-XXXX) são identificadores exclusivos e internos ao ecossistema NEXA. Eles não possuem conexão com o Sistema de Telefonia Pública Comutada (STFC) nem recebem SMS de validação de bancos reais.',
    },
    {
      q: 'O Pix da NEXA Pay utiliza dinheiro verdadeiro?',
      a: 'Não. O NEXA Pay é um banco fictício de demonstração tecnológica. Nenhum saldo tem valor monetário e nenhuma transação trafega pelo SPI do Banco Central do Brasil. Os créditos são concedidos para fins de teste da plataforma.',
    },
    {
      q: 'Preciso fornecer CPF ou cartão de crédito para comprar?',
      a: 'Nunca. Em conformidade com a LGPD e o princípio de minimização de dados, não coletamos documentos fiscais, senhas bancárias ou dados de cartões.',
    },
    {
      q: 'As chamadas de áudio e vídeo funcionam entre usuários reais?',
      a: 'Sim! As chamadas utilizam a tecnologia WebRTC P2P (Peer-to-Peer) estabelecida diretamente entre os navegadores através de sinalização em tempo real via Socket.IO.',
    },
    {
      q: 'Minhas linhas compradas continuam salvas se eu sair do site?',
      a: 'Sim. A propriedade das suas linhas virtuais é associada permanentemente ao seu identificador único do Google no Cloud Firestore do backend.',
    },
  ];

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center gap-3 mb-14">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-sky-400">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
          Perguntas Frequentes
        </h2>
        <p className="text-sm text-slate-300 max-w-md leading-relaxed">
          Transparência técnica total sobre o funcionamento e os limites do ambiente de demonstração.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;

          return (
            <GlassCard
              key={idx}
              className="p-5 cursor-pointer transition-all border border-white/10 hover:border-white/20"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-white tracking-tight">{faq.q}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 text-sky-400' : ''
                  }`}
                />
              </div>

              {isOpen && (
                <p className="text-xs text-slate-300 leading-relaxed pt-3 border-t border-white/[0.06] mt-3 animate-in fade-in duration-200">
                  {faq.a}
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
};
