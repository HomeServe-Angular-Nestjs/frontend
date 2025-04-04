import { UserType } from "../shared/models/user.model";

export interface ILoginConfig {
    type: UserType;
    title: string;
    subtitle: string;
    backgroundImage: string;
    logoColor: string;
    socialAuth?: {
        google?: boolean;
        facebook?: boolean;
    };
    trustIndicators: {
        icon: string;
        text: string;
    }[];
}

export const LOGIN_CONFIGS: {
    customer: ILoginConfig,
    provider: ILoginConfig,
} = {
    customer: {
        type: 'customer',
        title: 'Welcome to HomeServe',
        subtitle: 'Your one-stop solution for all home services',
        backgroundImage: 'assets/images/bg-auth.jpg',
        logoColor: '#4f46e5',
        socialAuth: {
            google: true,
            facebook: false
        },
        trustIndicators: [
            { icon: 'fas fa-chart-line', text: 'Grow your business by 200%' },
            { icon: 'fas fa-clock', text: 'Save 10+ hours weekly' },
            { icon: 'fas fa-dollar-sign', text: 'Competitive earnings' }
        ],
    },
    provider: {
        type: 'provider',
        title: 'Welcome to HomeServe',
        subtitle: 'Grow Your Service Business',
        backgroundImage: 'assets/images/bg-auth.jpg',
        logoColor: '#16a34a',
        socialAuth: {
            google: true,
            facebook: false
        },
        trustIndicators: [
            { icon: 'fas fa-chart-line', text: 'Grow your business by 200%' },
            { icon: 'fas fa-clock', text: 'Save 10+ hours weekly' },
            { icon: 'fas fa-dollar-sign', text: 'Competitive earnings' }
        ],
    }
};