export default {
    bucketKey: 'mockedBucketKey',
    token: 'mockedToken',
    httpService: {
        get: jest.fn().mockName('get'),
        post: jest.fn().mockName('post'),
    },
    baseUrl: 'https://mockedUrl.io',
    bucketSecret: 'mockedBucketSecret'
};
