import { getCommonHeaders } from './utils';

export const getTokenLinkedAPI = (authAPI, token) => ({
    // there is only one method from AUTH API which requires token
    getUser: () => authAPI.getUser({ token })
});

export default ({ bucketKey, bucketSecret, httpService, baseUrl }) => {
    const getAccess = () => httpService.post(`${baseUrl}/${bucketKey}/authorize`, {
        body: {
            secret: bucketSecret
        }
    });

    const execute = (url, body) => getAccess().then(response => {
        const headers = getCommonHeaders(response.token);
        return httpService.post(url, {
            headers,
            body
        });
    });

    const login = (email, password) => execute(`${baseUrl}/${bucketKey}/login`, {
        email, password
    });

    const register = ({ email, password, firstName, lastName }) => execute(`${baseUrl}/${bucketKey}/register`, {
        email,
        password,
        first_name: firstName,
        last_name: lastName
    });

    const getUser = ({ token }) => httpService.get(`${baseUrl}/${bucketKey}/me`, {
        headers: getCommonHeaders(token)
    });

    return {
        getAccess,
        login,
        register,
        getUser
    };
};
