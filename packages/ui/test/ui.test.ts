import { describe, it, expect } from 'vitest';
import { cn } from '../src/utils.js';
import { BrandLogo } from '../src/BrandLogo.js';
import { GlassSurface } from '../src/GlassSurface.js';
import { GlassButton } from '../src/GlassButton.js';
import { GlassCard } from '../src/GlassCard.js';
import { ColdStartOverlay } from '../src/ColdStartOverlay.js';

describe('@nexa/ui Component Library', () => {
  it('cn should merge classnames cleanly without duplicates', () => {
    const merged = cn('p-4 text-white', 'p-6 text-slate-200');
    expect(merged).toContain('p-6');
    expect(merged).toContain('text-slate-200');
    expect(merged).not.toContain('p-4');
  });

  it('All exported UI components should be defined as valid React components', () => {
    expect(BrandLogo).toBeDefined();
    expect(GlassSurface).toBeDefined();
    expect(GlassButton).toBeDefined();
    expect(GlassCard).toBeDefined();
    expect(ColdStartOverlay).toBeDefined();
  });
});
