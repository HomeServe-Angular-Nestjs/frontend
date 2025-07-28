const domainName = 'http://localhost:5000/api';

export const production = false;

export const API_ENV = {
    signupAuth: `${domainName}/signup`,
    loginAuth: `${domainName}/login`,
    auth: `${domainName}/auth`,
    admin: `${domainName}/admin`,
    customer: `${domainName}`,
    provider: `${domainName}/provider`,
    payment: `${domainName}/payment`,
    schedule: `${domainName}/schedule`,
    chat: `${domainName}/chat`,
    message: `${domainName}/messages`,
    plans: `${domainName}/plans`,
    subscription: `${domainName}/subscription`,
    uploads: `${domainName}/uploads`,
}

export const API_KEY = {
    mapbox: 'pk.eyJ1Ijoic2FqaWRtdWhhbW1lZCIsImEiOiJjbTl3b25hZDMxMHB0Mmlwc3ZlcnV3MmMwIn0.zMhfdAfDTgodZvIu0tbglw',
    razorpay: 'rzp_test_OZVJGxiPWQgDaM',
    openCageApi: '891b320be91d49d0861fc8b1592cc0b5',
}

export const OPEN_CAGE_URL = 'https://api.opencagedata.com/geocode/v1/json';

export const SOCKET_URL = 'http://localhost:5000';

export const REGEXP_ENV = {
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: /^[6-9]\d{9}$/,
    decimals: /^\d+(\.\d{1,2})?$/,
    integers: /^\d+$/,

}