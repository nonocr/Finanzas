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

// Las categorías guardan una clave de color (c1…c10). En la «tarjeta negra» son tintes de baja saturación (bronce,
// salvia, acero…) que viven en el trazo del ícono y en los gráficos; no compiten con el ámbar y rojo del presupuesto.
export const CATEGORY_HEX: Record<string, string> = {
  c1: '#b28c62', // bronce
  c2: '#93a893', // salvia
  c3: '#8497ab', // acero azul
  c4: '#a08f7e', // topo
  c5: '#bcaa7a', // champán
  c6: '#ab8289', // palo de rosa
  c7: '#9187a6', // lavanda
  c8: '#73909e', // pizarra
  c9: '#83a7a3', // pátina
  c10: '#85858b', // grafito
};
// Los mismos valores sirven para CSS, SVG y Recharts.
export const CATEGORY_COLORS = CATEGORY_HEX;
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
