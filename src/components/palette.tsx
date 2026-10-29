import {
  Banknote,
  Briefcase,
  Car,
  CreditCard,
  Ellipsis,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  type LucideIcon,
  PawPrint,
  PiggyBank,
  Plane,
  Plus,
  Repeat,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Utensils,
  Zap,
} from 'lucide-react';
import type { AccountType } from '../lib/types';

// Las categorías guardan una clave de color (c1…c10); aquí se traduce a los colores de sistema de iOS.
export const CATEGORY_COLORS: Record<string, string> = {
  c1: 'var(--color-orange)',
  c2: 'var(--color-green)',
  c3: 'var(--color-blue)',
  c4: 'var(--color-brown)',
  c5: 'var(--color-yellow)',
  c6: 'var(--color-pink)',
  c7: 'var(--color-purple)',
  c8: 'var(--color-indigo)',
  c9: 'var(--color-teal)',
  c10: 'var(--color-gray)',
};

// Valores literales para SVG/Recharts, que no siempre resuelven var().
export const CATEGORY_HEX: Record<string, string> = {
  c1: '#ff9f0a',
  c2: '#30d158',
  c3: '#0a84ff',
  c4: '#ac8e68',
  c5: '#ffd60a',
  c6: '#ff375f',
  c7: '#bf5af2',
  c8: '#5e5ce6',
  c9: '#40c8e0',
  c10: '#8e8e93',
};

export const colorOf = (key: string | null | undefined) => CATEGORY_COLORS[key ?? ''] ?? CATEGORY_COLORS.c10;
export const hexOf = (key: string | null | undefined) => CATEGORY_HEX[key ?? ''] ?? CATEGORY_HEX.c10;

export const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  'shopping-cart': ShoppingCart,
  car: Car,
  house: House,
  zap: Zap,
  'heart-pulse': HeartPulse,
  film: Film,
  repeat: Repeat,
  shirt: Shirt,
  ellipsis: Ellipsis,
  briefcase: Briefcase,
  sparkles: Sparkles,
  plus: Plus,
  banknote: Banknote,
  gift: Gift,
  'graduation-cap': GraduationCap,
  plane: Plane,
  'paw-print': PawPrint,
  smartphone: Smartphone,
  'piggy-bank': PiggyBank,
};

export const iconOf = (name: string | null | undefined): LucideIcon => ICONS[name ?? ''] ?? Ellipsis;

export const ACCOUNT_ICONS: Record<AccountType, LucideIcon> = {
  efectivo: Banknote,
  debito: CreditCard,
  credito: CreditCard,
  banco: Landmark,
  ahorro: PiggyBank,
};
