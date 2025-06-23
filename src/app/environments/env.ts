const domainName = 'http://localhost:5000/api';
export const API_ENV = {
    signupAuth: `${domainName}/signup`,
    loginAuth: `${domainName}/login`,
    auth: `${domainName}/auth`,
    admin: `${domainName}/admin`,
    customer: `${domainName}`,
    provider: `${domainName}/provider`,
    payment: `${domainName}/payment`,
    schedule: `${domainName}/schedule`,
    chat: `${domainName}/chat`
}

export const API_KEY = {
    mapbox: 'pk.eyJ1Ijoic2FqaWRtdWhhbW1lZCIsImEiOiJjbTl3b25hZDMxMHB0Mmlwc3ZlcnV3MmMwIn0.zMhfdAfDTgodZvIu0tbglw',
    razorpay: 'rzp_test_OZVJGxiPWQgDaM'
}

export const SOCKET_API = {
    chat: 'http://localhost:5000',
}

export const REGEXP_ENV = {
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: /^[6-9]\d{9}$/
}