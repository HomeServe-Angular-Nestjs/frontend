/**
 * HomeServe Analytics design tokens.
 * Single source of truth for the analytics UI system.
 */

export type AnalyticsChartHeight = 'small' | 'standard' | 'large';

/** Semantic ECharts color palette. Keeps the emerald brand identity. */
export const ANALYTICS_COLORS = {
    provider: '#10B981',       // emerald-500  – primary provider series
    providerStrong: '#059669', // emerald-600  – emphasis / gradient end
    providerDeep: '#065F46',   // emerald-800  – strong accents
    providerSoft: '#6EE7B7',   // emerald-300  – secondary provider line
    platform: '#94A3B8',       // slate-400    – benchmark / platform
    platformSoft: '#CBD5E1',   // slate-300    – dashed benchmark line
    positive: '#10B981',       // emerald-500  – positive growth
    negative: '#EF4444',       // red-500      – negative growth (semantic only)
    warning: '#F59E0B',        // amber-500    – warnings
    neutral: '#64748B',        // slate-500    – neutral series
    newCustomers: '#34D399',   // emerald-400  – new customers
    returning: '#059669',      // emerald-600  – returning customers
    grid: '#F1F5F9',           // slate-100    – grid lines
    axis: '#CBD5E1',           // slate-300    – axis lines / ticks
    text: '#334155',           // slate-700    – axis labels
};

/** Ordered multi-series palette (emerald family + semantic accents). */
export const ANALYTICS_SERIES: string[] = [
    '#10B981', // emerald-500
    '#34D399', // emerald-400
    '#059669', // emerald-600
    '#6EE7B7', // emerald-300
    '#0D9488', // teal-600
    '#22C55E', // green-500
    '#F59E0B', // amber-500
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#EF4444', // red-500
];

/** Height classes used by analytics-chart-card. */
export const CHART_HEIGHT_CLASS: Record<AnalyticsChartHeight, string> = {
    small: 'h-[320px]',
    standard: 'h-[400px]',
    large: 'h-[500px]',
};

/** Shared card chrome. */
export const CARD_CLASS = 'bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm';