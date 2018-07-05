import Content from '../content';
import filterParser from '../filterParser';
import mockedUtils, { checkAccessToken } from '../utils';

jest.mock('../filterParser.js');
jest.mock('../utils.js');

const mockedBucketKey = 'mockedKey';
const mockedHttpService = {
    get: jest.fn(),
    post: jest.fn()
};

const mockedBaseUrl = 'https://mockedUrl.io';

const testModule = Content({
    bucketKey: mockedBucketKey,
    httpService: mockedHttpService,
    baseUrl: mockedBaseUrl
});

const apiMethodNames = [
    'get',
    'getByTitle',
    'getByName',
    'getByModel',
    'getByType',
    'getById',
    'getByTaxonomyName',
    'getByTaxonomyId',
    'getByTaxonomyPath',
    'getByField',
    'purchaseContent'
];

test('API should consists of correct methods', () => {
    apiMethodNames.forEach(method => {
        expect(typeof testModule[method]).toBe('function');
    });
});

const mockedToken = '333sfskdfs3344kl;kgdhfgjkkdfgl';
const EXPECTED_CONTENT_API_URL = `${mockedBaseUrl}/${mockedBucketKey}/items`;


const testApiMethod = (methodName) => {
    const someMockedQuery = {};
    const mockedPagination = {
        pageNumber: 5,
        pageSize: 30
    };


    const expectedCallsToFilterParser = {
        get: someMockedQuery,
        getByTitle: {
            title: someMockedQuery
        },
        getByName: {
            title: someMockedQuery
        },
        getByModel: {
            model: someMockedQuery
        },
        getByType: {
            model: someMockedQuery
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

apiMethodNames.filter(methodName => methodName !== 'getById' && methodName !== 'purchaseContent').forEach(testApiMethod);

describe('when getByKey is called', () => {
    test('it should call the httpService get method with correctly parsed filter and access token', () => {
        const mockedKey = 'MockedKey';

        testModule.getByKey(mockedKey, {
            token: mockedToken
        });

        expect(mockedHttpService.get).toHaveBeenCalledWith(`${EXPECTED_CONTENT_API_URL}/${mockedKey}`, {
            headers: mockedUtils.commonHeadersMock
        });
    });
});

describe('when getById is called', () => {
    test('it should call the httpService get method with correctly parsed filter and access token', () => {
        const mockedKey = 'MockedKey';

        testModule.getById(mockedKey, {
            token: mockedToken
        });

        expect(mockedHttpService.get).toHaveBeenCalledWith(`${EXPECTED_CONTENT_API_URL}/${mockedKey}`, {
            headers: mockedUtils.commonHeadersMock
        });
    });
});

describe('when purchaseContent is called', () => {
    test('it should call httpService post method with correct url and params', () => {
        const mocks = {
            contentId: 'dadadar34242rfsfw5534',
            currency: 'ETH',
            description: 'Buying content test',
            notifyUrl: 'https://my.notification.url'
        };
        testModule.purchaseContent(mocks.contentId, {
            currency: mocks.currency,
            description: mocks.description,
            notifyUrl: mocks.notifyUrl
        });

        const expectedUrl = `${mockedBaseUrl}/${mockedBucketKey}/purchase-content/${mocks.contentId}`;

        expect(mockedHttpService.post).toHaveBeenCalledWith(expectedUrl, {
            body: {
                currency: mocks.currency,
                description: mocks.description,
                notify_url: mocks.notifyUrl
            },
            headers: mockedUtils.commonHeadersMock
        });
    });
});

