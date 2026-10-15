# DESIGN SYSTEM — NEXA LIQUID GLASS

Este documento define a linguagem visual, os tokens de estilo, as aproximações físicas de refração e as diretrizes de acessibilidade para todo o ecossistema NEXA.

---

## 1. Direção Artística e Conceito "Liquid Glass"

O design do NEXA Ecosystem é inspirado na clareza óptica, profundidade material e precisão de interfaces contemporâneas de alto padrão, combinando:
- **Translucidez óptica:** Materiais com dispersão de luz e saturação adaptativa.
- **Borda cáustica e especular:** Realce assimétrico e reflexos direcionais de luz.
- **Volume orgânico:** Sombreamento multicamadas suave combinado a brilho interno delicado.
- **Tipografia editorial:** Hierarquia nítida, respiros amplos e legibilidade impecável sobre superfícies com transparência.

> **Princípio de Sobriedade Visual:**  
> O efeito Liquid Glass expressivo é reservado para superfícies flutuantes, barras de navegação, docks, modais e controles interativos. Superfícies de leitura densa e listas de conversas utilizam materiais com menor dispersão e opacidade mais alta para evitar cansaço visual e garantir conformidade com as normas WCAG AA.

---

## 2. Aproximação Física do Efeito Glass na Web

Como a refração física pura é um recurso de renderização nativo e pesado, implementamos uma **aproximação de alta fidelidade multicamadas** em CSS moderno com aceleração de hardware:

1. **Backdrop Filtrado:** `backdrop-filter: blur(var(--glass-blur)) saturate(160%) brightness(105%)`.
2. **Borda Óptica Assimétrica:** Gradiente linear fino (1px) simulando luz incidente superior-esquerda:  
   `border-image: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%) 1`.
3. **Volume e Profundidade:** Duas camadas de sombra externa suave combinadas a um `box-shadow: inset 0 1px 1px 0 rgba(255,255,255,0.2)`.
4. **Tint Adaptativo:** Uso de `color-mix(in srgb, var(--surface-base), transparent 30%)` para ajuste automático a fundos dinâmicos.
5. **Degradação Acessível:** Em navegadores sem suporte a `backdrop-filter` ou quando o usuário ativar `prefers-reduced-transparency`, o sistema automaticamente ativa a classe de fallback com fundo sólido fosco de alto contraste.

---

## 3. Tokens Fundamentais de Design (CSS Variables)

```css
:root {
  /* Liquid Glass Tokens */
  --glass-blur-sm: 8px;
  --glass-blur-md: 16px;
  --glass-blur-lg: 28px;
  --glass-blur-hero: 40px;

  --glass-opacity-clear: 0.12;
  --glass-opacity-regular: 0.28;
  --glass-opacity-dense: 0.55;
  --glass-opacity-solid: 0.88;

  --glass-border-subtle: rgba(255, 255, 255, 0.12);
  --glass-border-prominent: rgba(255, 255, 255, 0.25);
  --glass-highlight-specular: rgba(255, 255, 255, 0.45);
  
  --glass-shadow-soft: 0 8px 32px 0 rgba(0, 0, 0, 0.18);
  --glass-shadow-deep: 0 20px 50px 0 rgba(0, 0, 0, 0.35);
  --glass-shadow-inset: inset 0 1px 1px 0 rgba(255, 255, 255, 0.22);

  --glass-radius-sm: 10px;
  --glass-radius-md: 18px;
  --glass-radius-lg: 26px;
  --glass-radius-pill: 9999px;

  /* Motion & Spring Dynamics */
  --motion-instant: 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
  --motion-interactive: 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --motion-standard: 340ms cubic-bezier(0.16, 1, 0.3, 1);
  --motion-cinematic: 650ms cubic-bezier(0.16, 1, 0.3, 1);

  /* Typography */
  --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 4. Identidade Visual por Aplicação

Cada produto do ecossistema possui uma paleta temática primária especializada, preservando os mesmos componentes e mecânicas do design system:

| Aplicação | Tom Principal | Base do Fundo | Acentos | Sensação Visual |
| :--- | :--- | :--- | :--- | :--- |
| **NEXA Pay** | Navy Glacial | `#030712` a `#0A192F` | `#38BDF8` (Sky) e `#0284C7` | Segurança bancária, sofisticação de private bank, precisão |
| **NEXA Mobile** | Prata Perolado & Índigo | `#0B0F19` com camadas `#F8FAFC` | `#6366F1` (Índigo) e `#818CF8` | Cinematográfico, espacial, aspiracional, ultra-moderno |
| **NEXA Chat** | Grafite & Iris Mudo | `#090D16` a `#111827` | `#A855F7` (Púrpura) e `#60A5FA` | Foco na leitura, intimista, balões legíveis, acolhedor |

---

## 5. Biblioteca de Componentes Glass

1. **`GlassSurface`:** Elemento base polimórfico com suporte a variantes `clear`, `regular`, `dense` e `card`.
2. **`GlassButton`:** Botão com microcompressão em `active`, highlight especular que acompanha o hover e feedback tátil por spring physics.
3. **`GlassCard`:** Cartão de conteúdo com opacidade reforçada para preservar contraste WCAG sobre qualquer plano de fundo.
4. **`GlassDock` / `GlassNav`:** Barra de navegação inferior flutuante (mobile) ou superior (desktop) com indicador deslizante tipo pastilha elástica.
5. **`GlassModal`:** Modal centralizado com backdrop blur expansivo e controle acessível de foco via Radix UI.
6. **`GlassInput`:** Campo de formulário com anel de foco em gradiente neon suave e rótulo flutuante.
7. **`ColdStartOverlay`:** Tela full-screen com spinner de anel líquido refrativo para notificar o despertar do Render.

---

## 6. Acessibilidade e Degradação Graciosa

- **Contraste WCAG 2.1 AA:** Todas as fontes mantêm contraste mínimo de 4.5:1 em relação à superfície com opacidade computada.
- **`prefers-reduced-motion`:** Quando ativo, animações complexas, parallax de scroll e transições elásticas são desativadas ou simplificadas para fades diretos de 100ms.
- **`prefers-reduced-transparency`:** Remove `backdrop-filter` e eleva a opacidade das superfícies para 95% com fundo fosco sólido.
- **Sem Emojis como Ícones de UI:** Todos os ícones do sistema são vetoriais (Lucide Icons), mantendo semântica e legibilidade por leitores de tela. Emojis são permitidos unicamente dentro de mensagens e reações digitadas pelo usuário.
