export interface ICategoryIdentity {
    icon: string;
    image: string;
    color: string;
}

export interface ILandingFeature {
    icon: string;
    title: string;
    description: string;
}

export interface ILandingFAQ {
    question: string;
    answer: string;
}

const CATEGORY_IMAGES: Record<string, string> = {
    cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    plumbing: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
    electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    painting: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    repair: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    carpenter: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    'pest control': 'https://images.unsplash.com/photo-1616627987854-571bc63347ec?auto=format&fit=crop&w=800&q=80',
    moving: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
};

export const CATEGORY_DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80';

const CATEGORY_ICONS: Record<string, string> = {
    cleaning: 'fa-broom',
    plumbing: 'fa-wrench',
    electrical: 'fa-bolt',
    painting: 'fa-paint-roller',
    repair: 'fa-screwdriver-wrench',
    carpenter: 'fa-hammer',
    'pest control': 'fa-bug',
    moving: 'fa-truck-moving',
    appliance: 'fa-plug',
    salon: 'fa-scissors',
};

const CATEGORY_COLORS: Record<string, string> = {
    cleaning: '#0ea5e9',
    plumbing: '#2563eb',
    electrical: '#f59e0b',
    painting: '#8b5cf6',
    carpentry: '#d97706',
    default: '#2563eb',
};

/** Map a category name to a stable icon + image + accent color. */
export function getCategoryIdentity(name?: string | null, id?: string | null): ICategoryIdentity {
    const key = (name || '').toLowerCase().trim();
    const icon = CATEGORY_ICONS[key] ?? CATEGORY_ICONS[id ?? ''] ?? 'fa-toolbox';
    const color = CATEGORY_COLORS[key] ?? CATEGORY_COLORS['default'];
    return { icon, color, image: CATEGORY_IMAGES[key] ?? CATEGORY_DEFAULT_IMAGE };
}

export const LANDING_SECTIONS = [
    { id: 'services', label: 'Services' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'providers', label: 'Providers' },
    { id: 'safety', label: 'Safety' },
    { id: 'faq', label: 'FAQ' },
];

export const WHY_CHOOSE_FEATURES: ILandingFeature[] = [
    {
        icon: 'fa-user-shield',
        title: 'Background Verified Professionals',
        description: 'Every provider passes ID verification and reference checks before joining our trusted network.',
    },
    {
        icon: 'fa-tags',
        title: 'Transparent Pricing',
        description: 'Upfront, fixed quotes before any work begins. No surprise charges, ever.',
    },
    {
        icon: 'fa-comment-dots',
        title: 'Verified Reviews',
        description: 'Authentic ratings from confirmed bookings, so you know exactly who you are hiring.',
    },
    {
        icon: 'fa-lock',
        title: 'Secure Online Payments',
        description: 'Pay safely through the platform with encrypted, protected checkout.',
    },
    {
        icon: 'fa-calendar-check',
        title: 'Flexible Scheduling',
        description: 'Pick the date and time that suits you and reschedule easily whenever life changes.',
    },
    {
        icon: 'fa-headset',
        title: 'Reliable Customer Support',
        description: 'A dedicated support team is with you before, during, and after every booking.',
    },
];

export const HOW_IT_WORKS_STEPS: ILandingFeature[] = [
    {
        icon: 'fa-magnifying-glass',
        title: 'Search',
        description: 'Browse services and categories to find exactly what your home needs.',
    },
    {
        icon: 'fa-user-tie',
        title: 'Compare',
        description: 'Compare background-verified pros by reviews, ratings, and pricing.',
    },
    {
        icon: 'fa-calendar-check',
        title: 'Schedule',
        description: 'Choose a time slot that fits your day with transparent pricing.',
    },
    {
        icon: 'fa-credit-card',
        title: 'Pay',
        description: 'Confirm securely online with no hidden fees, protected checkout.',
    },
    {
        icon: 'fa-house-circle-check',
        title: 'Relax',
        description: 'Your pro arrives on time and completes the job—tracked end to end.',
    },
];

export const SAFETY_ITEMS: ILandingFeature[] = [
    {
        icon: 'fa-id-card',
        title: 'Identity Verification',
        description: 'Providers are ID-checked and have their professional documents reviewed before approval.',
    },
    {
        icon: 'fa-lock',
        title: 'Secure Payments',
        description: 'All transactions are encrypted and processed through trusted payment gateways.',
    },
    {
        icon: 'fa-shield-halved',
        title: 'Booking Protection',
        description: 'Every job is logged on the platform so support can step in whenever needed.',
    },
    {
        icon: 'fa-comment-dots',
        title: 'Verified Reviews',
        description: 'Only customers who complete a booking can review a provider.',
    },
    {
        icon: 'fa-life-ring',
        title: '24/7 Customer Support',
        description: 'Reach a real person for help with any booking, payment, or provider issue.',
    },
    {
        icon: 'fa-file-contract',
        title: 'Clear Cancellation Policy',
        description: 'Flexible cancellation rules and transparent refunds if plans change.',
    },
];

export const PROVIDER_BENEFITS: ILandingFeature[] = [
    {
        icon: 'fa-calendar-alt',
        title: 'Flexible Schedule',
        description: 'Set your own availability and work when it suits you best.',
    },
    {
        icon: 'fa-user-group',
        title: 'More Customers',
        description: 'Get discovered by thousands of customers searching for pros like you.',
    },
    {
        icon: 'fa-chart-column',
        title: 'Business Dashboard',
        description: 'Track bookings, earnings, and performance all in one place.',
    },
    {
        icon: 'fa-credit-card',
        title: 'Secure Payments',
        description: 'Get paid reliably through the platform with transparent payouts.',
    },
    {
        icon: 'fa-chart-line',
        title: 'Growth Opportunities',
        description: 'Build your reputation with verified reviews and grow your business.',
    },
];

export const LANDING_FAQS: ILandingFAQ[] = [
    {
        question: 'How does booking work?',
        answer: 'Search for a service, compare verified providers, pick your professional, choose a time slot, and pay securely. The provider confirms and completes your job—all tracked through the platform.',
    },
    {
        question: 'How are providers verified?',
        answer: 'Every provider submits identity and professional documents that are reviewed before they are approved. Only verified professionals can offer services on HomeServe.',
    },
    {
        question: 'Can I cancel bookings?',
        answer: 'Yes. You can request a cancellation from your bookings page. Refunds depend on the cancellation timing relative to the appointment and follow our clear cancellation policy.',
    },
    {
        question: 'How are payments handled?',
        answer: 'Payments are made securely through the platform via trusted gateways. Your funds are protected and the provider is paid only once the service is completed.',
    },
    {
        question: 'How do refunds work?',
        answer: 'If a booking is cancelled under the eligible window, a refund is processed automatically to your original payment method. Approved refunds are transparent and quick.',
    },
    {
        question: 'How do providers get paid?',
        answer: 'Once you complete and confirm your service, the provider receives payment through the platform. Earnings are tracked in their business dashboard.',
    },
];