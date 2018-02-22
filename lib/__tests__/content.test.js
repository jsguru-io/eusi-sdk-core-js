import Content from '../content';
import filterParser from '../filterParser';
import mockedUtils, { checkAccessToken } from '../utils';

jest.mock('../filterParser.js');
jest.mock('../utils.js');

const mockedBucketKey = 'mockedKey';
const mockedHttpService = {
    get: jest.fn()
};

const mockedBaseUrl = 'https://mockedUrl.io';

const testModule = Content({
    bucketKey: mockedBucketKey,
    httpService: mockedHttpService,
    baseUrl: mockedBaseUrl
});

const apiMethodNames = [
    'get',
    'getByName',
    'getByType',
    'getById',
    'getByTaxonomyName',
    'getByTaxonomyId',
    'getByTaxonomyPath',
    'getByField'
];

test('API should consists of correct methods', () => {
    apiMethodNames.forEach(method => {
        expect(typeof testModule[method]).toBe('function');
    });
});

const testApiMethod = (methodName) => {
    const someMockedQuery = {};
    const mockedToken = '333sfskdfs3344kl;kgdhfgjkkdfgl';
    const mockedPagination = {
        pageNumber: 5,
        pageSize: 30
    };

    const EXPECTED_CONTENT_API_URL = `${mockedBaseUrl}/${mockedBucketKey}/items`;

    const expectedCallsToFilterParser = {
        get: someMockedQuery,
        getByName: {
            name: someMockedQuery
        },
        getByType: {
            type: someMockedQuery
        },
        getByTaxonomyName: {
            taxonomyName: someMockedQuery
        },
        getByTaxonomyId: {
            taxonomyId: someMockedQuery
        },
        getByTaxonomyPath: {
            taxonomyPath: someMockedQuery
        },
        getByField: {
            field: someMockedQuery
        }
    };

    describe(`when ${methodName} method is called`, () => {
        beforeEach(() => {
            testModule[methodName](someMockedQuery, {
                token: mockedToken,
                ...mockedPagination
            });
        });


        test('it should parse the input query', () => {
            expect(filterParser).toHaveBeenCalledWith(expectedCallsToFilterParser[methodName]);
        });

        test('it should call the httpService get method with correctly parsed filter and access token', () => {
            expect(mockedHttpService.get).toHaveBeenCalledWith(EXPECTED_CONTENT_API_URL, {
                params: {
                    ...filterParser.mockedResult,
                    number: mockedPagination.pageSize,
                    page: mockedPagination.pageNumber
                },
                headers: mockedUtils.commonHeadersMock
            });
        });

        test('when pagination data is not set it should use default value of pageSize 20 and pageNumber: 1', () => {
            testModule[methodName](someMockedQuery, {
                token: mockedToken
            });

            expect(mockedHttpService.get).toHaveBeenCalledWith(EXPECTED_CONTENT_API_URL, {
                params: {
                    ...filterParser.mockedResult,
                    number: 20,
                    page: 1
                },
                headers: mockedUtils.commonHeadersMock
            });
        });


        test('it should check if access token is passed', () => {
            expect(checkAccessToken).toHaveBeenCalledWith(mockedToken);
        });


        afterEach(() => {
            filterParser.mockClear();
            mockedHttpService.get.mockClear();
            checkAccessToken.mockClear();
        });
    });
};

apiMethodNames.filter(methodName => methodName !== 'getById').forEach(testApiMethod);

// TODO: write separate test suite for getById method

