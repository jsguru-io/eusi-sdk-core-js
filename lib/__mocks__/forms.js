import { mockPromiseBasedMethods } from './mockUtils';

const mock = mockPromiseBasedMethods([
    'getForm',
    'submitForm',
    'testSubmitForm'
]);

export const getTokenLinkedAPI = (api = {}) => api;

export default jest.fn(() => mock);
