import { mockPromiseBasedMethods } from './mockUtils';

const mock = mockPromiseBasedMethods([
    'getAccess',
    'login',
    'register'
]);

export default jest.fn(() => mock);
