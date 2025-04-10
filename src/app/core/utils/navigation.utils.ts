import { UserType } from "../../modules/shared/models/user.model";

export const loginNavigation = (userType: UserType): string => {
    let url = 'notfound';
    switch (userType) {
        case 'customer':
            url = 'login';
            break;
        case 'provider':
            url = 'provider/login';
            break;
        case 'admin':
            url = 'admin/login';
            break;
        default: url = 'notfound';
    }
    return url;
}

export const navigationAfterLogin = (userType: UserType): string => {
    let url = 'notfound';
    switch (userType) {
        case 'customer':
            url = 'homepage';
            break;
        case 'provider':
            url = 'provider/homepage';
            break;
        case 'admin':
            url = 'admin/dashboard'
            break;
        default: url = 'notfound';
    }
    return url;
}