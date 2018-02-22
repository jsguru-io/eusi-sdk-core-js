import { mockPromiseBasedMethods } from './mockUtils';

const mock = mockPromiseBasedMethods([
    'getTaxonomy'
]);

export default jest.fn(() => mock);
