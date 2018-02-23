import Auth from '../auth';
import commonMocks from '../__mocks__/commonMocks';
import mockedUtils from '../utils';

jest.mock('../utils.js');

const testModule = Auth({
    baseUrl: commonMocks.baseUrl,
    httpService: commonMocks.httpService,
    bucketSecret: commonMocks.bucketSecret,
    bucketKey: commonMocks.bucketKey
});

const expectedAuthUrl = `${commonMocks.baseUrl}/${commonMocks.bucketKey}/authorize`;

const mockHttpPostMethod = (postMethod) => postMethod.mockImplementation(() => ({
    then(cb) {
        return cb({
            token: commonMocks.token
        });
    }
}));

test('it should have correct API defined', () => {
    ['getAccess', 'login', 'register'].forEach(methodName => {
        expect(typeof testModule[methodName]).toBe('function');
    });
});

describe('when getAccess method is called', () => {
    beforeEach(() => {
        testModule.getAccess();
    });

    test('it should call correct endpoint', () => {
        const [url] = commonMocks.httpService.post.mock.calls[0];
        const expectedUrl = expectedAuthUrl;
        expect(url).toBe(expectedUrl);
    });

    test('should send bucket secret as part of request body to remote endpoint', () => {
        // eslint-disable-next-line
        const [url, options] = commonMocks.httpService.post.mock.calls[0];
        expect(options.body).toEqual({
            secret: commonMocks.bucketSecret
        });
    });

    afterEach(() => {
        commonMocks.httpService.post.mockReset();
    });
});

describe('when login method is called', () => {
    const mockedCredentials = {
        email: 'mockedEmail',
        password: 'mockedPassword'
    };

    beforeEach(() => {
        mockHttpPostMethod(commonMocks.httpService.post);
        testModule.login(mockedCredentials.email, mockedCredentials.password);
    });

    test('it should first get authorization token', () => {
        const [url] = commonMocks.httpService.post.mock.calls[0];
        expect(url).toEqual(expectedAuthUrl);
    });

    test('it should call correct endpoint', () => {
        const [url] = commonMocks.httpService.post.mock.calls[1];
        const expectedUrl = `${commonMocks.baseUrl}/${commonMocks.bucketKey}/login`;
        expect(url).toBe(expectedUrl);
    });

    test('should send correctly formatted data to the endpoint', () => {
        // eslint-disable-next-line
        const [url, options] = commonMocks.httpService.post.mock.calls[1];
        expect(options).toEqual({
            body: {
                email: mockedCredentials.email,
                password: mockedCredentials.password
            },
            headers: mockedUtils.commonHeadersMock
        });
    });

    afterEach(() => {
        commonMocks.httpService.post.mockReset();
    });
});

describe('when register method is called', () => {
    const registerMock = {
        email: 'mockedRegisterEmail',
        password: 'mockedRegisterPassword',
        firstName: 'mockedFirstName',
        lastName: 'mockedLastName'
    };
    beforeEach(() => {
        mockHttpPostMethod(commonMocks.httpService.post);
        testModule.register(registerMock);
    });

    test('it should first get authorization token', () => {
        const [url] = commonMocks.httpService.post.mock.calls[0];
        expect(url).toBe(expectedAuthUrl);
    });

    test('it should then call register endpoint', () => {
        const [url] = commonMocks.httpService.post.mock.calls[1];
        expect(url).toBe(`${commonMocks.baseUrl}/${commonMocks.bucketKey}/register`);
    });

    test('it should call register endpoint with correct data', () => {
        // eslint-disable-next-line
        const [url, options] = commonMocks.httpService.post.mock.calls[1];
        expect(options).toEqual({
            body: {
                email: registerMock.email,
                password: registerMock.password,
                first_name: registerMock.firstName,
                last_name: registerMock.lastName
            },
            headers: mockedUtils.commonHeadersMock
        });
    });

    afterEach(() => {
        commonMocks.httpService.post.mockReset();
    });
});

describe('when getUser is called', () => {
    beforeEach(() => {
         testModule.getUser({ token: commonMocks.token });
    });

    test('it should then call the "me" endpoint', () => {
        const [url] = commonMocks.httpService.get.mock.calls[0];
        expect(url).toBe(`${commonMocks.baseUrl}/${commonMocks.bucketKey}/me`);
    });

    test('it should pass the auth token to the remote endpoint', () => {
        // eslint-disable-next-line
        const [url, options] = commonMocks.httpService.get.mock.calls[0];
        expect(options.headers).toEqual(mockedUtils.commonHeadersMock);
    });
});
