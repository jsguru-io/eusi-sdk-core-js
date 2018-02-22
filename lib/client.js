import Content from './content';
import Auth from './auth';
import Forms, { getTokenLinkedAPI } from './forms';
import config from './config';
import Taxonomy from './taxonomy';

const checkForAccessData = (key, secret) => {
    const errorMessage = (paramName) =>
        `${paramName} data is missing. You can find it under settings section on EUSI web app`;

    if (!key) {
        throw new Error(errorMessage('bucketKey'));
    }

    if (!secret) {
        throw new Error(errorMessage('bucketSecret'));
    }
};


export default ({ HttpService, deliveryApi }) => (bucketAccessData = {}) => {
    const { bucketKey, bucketSecret } = bucketAccessData;
    checkForAccessData(bucketKey, bucketSecret);
    const options = {
        bucketKey,
        bucketSecret,
        httpService: HttpService,
        baseUrl: deliveryApi || config.deliveryApi
    };

    const contentFilteringAPI = Content(options);
    const authAPI = Auth(options);
    const formsAPI = Forms(options);
    const taxonomyAPI = Taxonomy(options);
    const accessTokenAPI = Object.assign({}, contentFilteringAPI, taxonomyAPI);

    // creating a helper object which will encapsulate the access token which is then passed to every calling function
    const createLinkBasedOnToken = (token) => {
        const baseAPI = Object
            .keys(accessTokenAPI)
            .reduce((acc, functionName) => Object.assign({}, acc, {
                [functionName]: (query = {}, ...rest) => accessTokenAPI[functionName](query, Object.assign(
                    {},
                    {
                        token
                    },
                    ...rest
                ))
            }), {});

        return Object.assign({}, baseAPI, getTokenLinkedAPI(formsAPI, token));
    };


    return Object.assign(
        createLinkBasedOnToken,
        authAPI,
        formsAPI,
        accessTokenAPI
    );
};
