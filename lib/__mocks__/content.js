import { mockPromiseBasedMethods } from './mockUtils';

const mock = mockPromiseBasedMethods([
    'get',
    'getById',
    'getByName',
    'getByType',
    'getByTaxonomyId',
    'getByTaxonomyName',
    'getByTaxonomyPath',
    'getByFields'
]);

export default jest.fn(() => mock);
