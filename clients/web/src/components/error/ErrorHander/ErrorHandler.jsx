import errorMessages from '../dataErrors.json';

export const getLoginErrorMessage = (errorCode) => {
    switch(errorCode) {
        case 'invalid_credentials':
            return errorMessages.login.invalidCredentials;
        case 'account_locked':
            return errorMessages.login.accountLocked;
        case 'inactive_account':
            return errorMessages.login.inactiveAccount;
        case 'network_error':
            return errorMessages.common.networkError;
        default:
            return errorMessages.login.serverError;
    }
};

export const getRegisterErrorMessage = (errorCode) => {
    switch(errorCode) {
        case 'username_taken':
            return errorMessages.register.usernameTaken;
        case 'email_taken':
            return errorMessages.register.emailTaken;
        case 'invalid_email':
            return errorMessages.register.invalidEmail;
        case 'password_too_short':
            return errorMessages.register.passwordTooShort;
        case 'password_mismatch':
            return errorMessages.register.passwordMismatch;
        default:
            return errorMessages.register.serverError;
    }
};