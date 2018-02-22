export const checkAccessToken = (accessToken) => {
    if (!accessToken) {
        throw new Error(`access token missing! Maybe you forgot to login or register or 
        for anonymous usage you have to obtain the token by calling getAccess method on eusi client object`);
    }
};

export const getCommonHeaders = (token) => ({
    Authorization: `Bearer ${token}`
});

