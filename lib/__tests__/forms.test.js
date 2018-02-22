import Forms from '../forms';
import mockedUtils from '../utils';

jest.mock('../utils.js');
const mockedBucketKey = 'mockedKey';
const mockedHttpService = {
    get: jest.fn(),
    post: jest.fn()
};

const mockedBaseUrl = 'https://mockedUrl.io';

let testModule;

const methodNames = [
    'getForm',
    'submitForm',
    'testSubmitForm'
];

beforeEach(() => {
    testModule = Forms({
        bucketKey: mockedBucketKey,
        httpService: mockedHttpService,
        baseUrl: mockedBaseUrl
    });
});

test('should have defined correct API', () => {
    methodNames.forEach(methodName => {
        expect(typeof testModule[methodName]).toBe('function');
    });
});

const mockedFormKey = 'mockedFormKey';
const mockedToken = 'mockedToken';

describe('when getForm is called', () => {
    beforeEach(() => {
        testModule.getForm(mockedFormKey, {
            token: mockedToken
        });
    });


    test('it should call correct delivery endpoint', () => {
        const expectedUrl = `${mockedBaseUrl}/${mockedBucketKey}/forms/${mockedFormKey}`;
        const [url] = mockedHttpService.get.mock.calls[0];
        expect(url).toBe(expectedUrl);
    });

    test('it should pass correct data to the delivery endpoint', () => {
        // eslint-disable-next-line
        const [url, options] = mockedHttpService.get.mock.calls[0];
        expect(options).toEqual({
            headers: mockedUtils.commonHeadersMock
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});

const testSubmitEndpoints = ({ name, expectedUrl }) => {
    describe(`when ${name} is called`, () => {
        beforeEach(() => {
            testModule[name](mockedFormKey, {
                firstName: 'John_90',
                lastName: 'Doe'
            }, {
                token: mockedToken
            });
        });

        test('it should call correct endpoint', () => {
            const url = mockedHttpService.post.mock.calls[0][0];
            expect(url).toBe(expectedUrl);
        });

        test('it should pass correct data to delivery endpoint', () => {
            const options = mockedHttpService.post.mock.calls[0][1];
            expect(options).toEqual({
                headers: {
                    ...mockedUtils.commonHeadersMock,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: encodeURI('firstName=John_90&lastName=Doe')
            });
        });
    });
};

afterEach(() => {
    jest.clearAllMocks();
});

const submitTypes = [
    {
        name: 'submitForm',
        expectedUrl: `${mockedBaseUrl}/${mockedBucketKey}/forms/${mockedFormKey}`
    },
    {
        name: 'testSubmitForm',
        expectedUrl: `${mockedBaseUrl}/${mockedBucketKey}/forms/${mockedFormKey}/test`
    }
];

submitTypes.forEach((elem) => testSubmitEndpoints(elem));
