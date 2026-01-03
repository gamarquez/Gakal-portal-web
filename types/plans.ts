export type PlanId = 'free' | 'bronce' | 'plata' | 'oro';

export interface Plan {
  id: PlanId;
  nombre: string;
  emoji: string;
  precioMensual: number;
  precioAnual: number;
  features: string[];
  destacado: boolean;
}

export const planes: Plan[] = [
  {
    id: 'free',
    nombre: 'Free',
    emoji: '🆓',
    precioMensual: 0,
    precioAnual: 0,
    features: [
      'Registro ilimitado de comidas',
      'Historial de 3 días',
      '3 logros básicos',
      'Gestión de peso e IMC',
      'Con publicidad',
    ],
    destacado: false,
  },
  {
    id: 'bronce',
    nombre: 'Bronce',
    emoji: '🥉',
    precioMensual: 1999,
    precioAnual: 17990,
    features: [
      'Todo lo de Free',
      'Historial de 30 días',
      '12 logros',
      'Estadísticas semanales',
      'Desafíos semanales',
      'Sin publicidad',
    ],
    destacado: false,
  },
  {
    id: 'plata',
    nombre: 'Plata',
    emoji: '🥈',
    precioMensual: 3499,
    precioAnual: 31490,
    features: [
      'Todo lo de Bronce',
      'Historial de 90 días',
      '10 análisis IA/mes',
      '20 logros',
      'Multiplicador XP x1.5',
      'Exportar CSV',
    ],
    destacado: true,
  },
  {
    id: 'oro',
    nombre: 'Oro',
    emoji: '🥇',
    precioMensual: 5499,
    precioAnual: 49490,
    features: [
      'Todo lo de Plata',
      'Historial ilimitado',
      'Análisis IA ilimitados',
      '30+ logros',
      'Multiplicador XP x2',
      'Alimentos personalizados',
      'Medidas corporales',
      'Perfil nutricional completo',
    ],
    destacado: false,
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

export function calcularDescuentoAnual(precioMensual: number, precioAnual: number): number {
  const totalMensual = precioMensual * 12;
  return Math.round(((totalMensual - precioAnual) / totalMensual) * 100);
}
