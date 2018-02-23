import Content from './content';
import Auth, { getTokenLinkedAPI as getAuthTokenLinkedAPI} from './auth';
import Forms, { getTokenLinkedAPI as getFormsTokenLinkedAPI } from './forms';
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

    // creating a helper object which will encapsulate the access token which is then passed to every calling function
    const createLinkBasedOnToken = (token) => {
        const accessTokenAPI = Object.assign({}, contentFilteringAPI, taxonomyAPI);
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

        return Object.assign({},
            baseAPI,
            getFormsTokenLinkedAPI(formsAPI, token),
            getAuthTokenLinkedAPI(authAPI, token));
    };

    return Object.assign(
        createLinkBasedOnToken,
        authAPI,
        formsAPI,
        contentFilteringAPI,
        taxonomyAPI
    );
};
