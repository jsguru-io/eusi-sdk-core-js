import { mockPromiseBasedMethods } from './mockUtils';

const mock = mockPromiseBasedMethods([
    'getAccess',
    'login',
    'register'
]);

export const getTokenLinkedAPI = (api = {}) => api;

export default jest.fn(() => mock);
