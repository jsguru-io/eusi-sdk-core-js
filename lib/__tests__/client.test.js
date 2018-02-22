import Client from '../client';
import commonMocks from '../__mocks__/commonMocks';
import Forms from '../forms';
import config from '../config';
import Content from '../content';
import Auth from '../auth';
import Taxonomy from '../taxonomy';

jest.mock('../content.js');
jest.mock('../auth.js');
jest.mock('../forms.js');
jest.mock('../config.js');
jest.mock('../taxonomy.js');

let testModule;

beforeEach(() => {
    testModule = Client({
        HttpService: commonMocks.httpService
    })({
        bucketKey: commonMocks.bucketKey,
        bucketSecret: commonMocks.bucketSecret
    });
});

const testApiDefinition = (api, ...modules) => {
    modules
        .reduce((acc, module) => acc.concat(Object.keys(module)), [])
        .forEach(methodName => {
            expect(typeof api[methodName]).toBe('function');
        });
};

test('it should have correct API defined', () => {
    testApiDefinition(testModule, Content(), Forms(), Auth(), Taxonomy());
    expect(typeof testModule).toBe('function');
});

describe('when called as a function passing token to it', () => {
    test('it should return object containing the same API without auth methods', () => {
        testApiDefinition(testModule(), Content());
    });

    describe('when any method is called from the returned object', () => {
        test('it should inject the encapsulated token to the underlying function', () => {
            const client = testModule(commonMocks.token);
            const someMethodFromContentApi = 'getByFields';
            const mockedQuery = {
                age: {
                    $lg: 10
                }
            };
            const mockedPagination = {
                pageNumber: 1,
                pageSize: 42
            };

            client[someMethodFromContentApi](mockedQuery, {
                ...mockedPagination
            });
            expect(Content()[someMethodFromContentApi]).toHaveBeenCalledWith(mockedQuery, {
                ...mockedPagination,
                token: commonMocks.token
            });
        });
    });
});

test('it should pass delivery api url to Content api', () => {
    const { baseUrl } = Content.mock.calls[0][0];
    expect(baseUrl).toBe(config.deliveryApi);
});

test('it should pass delivery api url to Forms api', () => {
    const { baseUrl } = Forms.mock.calls[0][0];
    expect(baseUrl).toBe(config.deliveryApi);
});

test('it should pass delivery api url to Auth api', () => {
    const { baseUrl } = Auth.mock.calls[0][0];
    expect(baseUrl).toBe(config.deliveryApi);
});

