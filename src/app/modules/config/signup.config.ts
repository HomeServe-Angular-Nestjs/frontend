export interface ISignupConfig {
    type: 'customer' | 'provider';
    title: string;
    subtitle: string;
    description: string;
    features?: {
        icon: string;
        title: string;
        description: string;
    }[];
    whyChooseUs?: {
        title: string;
        description: string;
    };
    logoColor: string;
    backgroundImage: string;
    trustIndicators?: {
        icon: string;
        text: string;
    }[];
    socialAuth: {
        google?: boolean;
        facebook?: boolean;
    },
}

export const SIGNUP_CONFIGS: {
    customer: ISignupConfig,
    provider: ISignupConfig
} = {
    customer: {
        type: 'customer',
        title: 'Welcome to HomeServe',
        subtitle: 'Your Trusted Home Service Partner',
        description: 'Experience hassle-free home services with verified professionals and transparent pricing',
        logoColor: '#312e81',
        backgroundImage: 'assets/images/bg-signup.jpg',
        features: [
            {
                icon: 'fas fa-certificate',
                title: 'Expert Services',
                description: 'All professionals are verified, trained, and highly rated by customers'
            },
            {
                icon: 'fas fa-bolt',
                title: 'Quick Response',
                description: 'Get instant quotes and book services within minutes'
            },
            {
                icon: 'fas fa-shield-alt',
                title: '100% Secure',
                description: 'Guaranteed service quality with money-back assurance'
            },
            {
                icon: 'fas fa-tag',
                title: 'Best Pricing',
                description: 'Competitive rates with no hidden charges'
            }
        ],
        whyChooseUs: {
            title: 'Why Choose Us?',
            description: 'Join thousands of satisfied customers who trust us for their home service needs. Enjoy seamless booking, transparent pricing, and professional service delivery.'
        },
        trustIndicators: [
            { icon: 'fas fa-check-circle', text: 'Trusted by 10,000+ customers' },
            { icon: 'fas fa-lock', text: 'Secure & encrypted' },
            { icon: 'fas fa-headset', text: '24/7 customer support' }
        ],
        socialAuth: {
            google: true,
            facebook: false
        }
    },
    provider: {
        type: 'provider',
        title: 'Join Our Professional Network',
        subtitle: 'Grow Your Business With Us',
        description: 'Connect with customers looking for your services and grow your business',
        logoColor: '#14532D',
        backgroundImage: 'assets/images/bg-signup.jpg',
        features: [
            {
                icon: 'fas fa-users',
                title: 'Availability',
                description: 'Access thousands of potential customers'
            },
            {
                icon: 'fas fa-calendar-check',
                title: 'Flexible Scheduling',
                description: 'Manage your availability and bookings easily'
            },
            {
                icon: 'fas fa-chart-line',
                title: 'Business Growth',
                description: 'Tools to help you expand your services'
            },
            {
                icon: 'fas fa-money-bill-wave',
                title: 'Fast Payments',
                description: 'Get paid quickly and securely'
            }
        ],
        whyChooseUs: {
            title: 'Why Join Us?',
            description: 'Become part of a trusted network of professionals. We handle marketing, bookings, and payments so you can focus on your craft.'
        },
        trustIndicators: [
            { icon: 'fas fa-chart-line', text: 'Grow your business by 200%' },
            { icon: 'fas fa-clock', text: 'Save 10+ hours weekly' },
            { icon: 'fas fa-dollar-sign', text: 'Competitive earnings' }
        ],
        socialAuth: {
            google: true,
            facebook: false
        }
    }
}
