import auth from 'solid-auth-client';

export const authProvider = {
    // Not needed with popup based login
    login(params) {
        return auth.login(params.idp);
    },

    logout(params) {
        return auth.logout();
    },

    async checkAuth(params) {
        const session = await auth.currentSession();
        const isLoggedIn = session && session.webId;
        return isLoggedIn ? Promise.resolve() : Promise.reject();
    },

    checkError(error) {
        return Promise.reject();
    },

    getPermissions(params) {
        return Promise.resolve();
    }
};
