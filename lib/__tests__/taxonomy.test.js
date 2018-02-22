import Taxonomy from '../taxonomy';
import commonMocks from '../__mocks__/commonMocks';
import mockedUtils from '../utils';

jest.mock('../utils.js');
const testModule = Taxonomy({
    baseUrl: commonMocks.baseUrl,
    httpService: commonMocks.httpService,
    bucketSecret: commonMocks.bucketSecret,
    bucketKey: commonMocks.bucketKey
});

const expectedTaxonomyUrl = `${commonMocks.baseUrl}/${commonMocks.bucketKey}/taxonomy`;

test('it should have correct API defined', () => {
    ['getTaxonomy'].forEach(methodName => {
        expect(typeof testModule[methodName]).toBe('function');
    });
});

describe('when getTaxonomy method is called', () => {
    const mockedTaxonomyKeyOrId = 'taxonomyKeyOrId';
    beforeEach(() => {
        testModule.getTaxonomy(mockedTaxonomyKeyOrId, {
            token: commonMocks.token
        });
    });

    test('it should call correct endpoint', () => {
        const [url] = commonMocks.httpService.get.mock.calls[0];
        expect(url).toBe(`${expectedTaxonomyUrl}/${mockedTaxonomyKeyOrId}`);
    });

    test('should send bucket secret as part of request body to remote endpoint', () => {
        // eslint-disable-next-line
        const [url, options] = commonMocks.httpService.get.mock.calls[0];
        expect(options.headers).toEqual(mockedUtils.commonHeadersMock);
    });

    afterEach(() => {
        commonMocks.httpService.post.mockReset();
    });
});
