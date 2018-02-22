export const commonHeadersMock = {
    Authorization: 'mockedToken'
};
export const getCommonHeaders = jest.fn(() => commonHeadersMock).mockName('getCommonHeaders');

export const checkAccessToken = jest.fn().mockName('checkAccessToken');

export default {
    commonHeadersMock,
    getCommonHeaders,
    checkAccessToken
};
