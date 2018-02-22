import parseFilter from './filterParser';
import { getCommonHeaders, checkAccessToken } from './utils';

export default ({ bucketKey, httpService, baseUrl }) => {
    const get = (query, {
        pageSize = 20,
        pageNumber = 1,
        token
    } = {}) => {
        const {
            key,
            name,
            taxonomyId,
            taxonomyName,
            taxonomyPath,
            type,
            field
        } = query;
        checkAccessToken(token);
        const params = parseFilter({
            key,
            name,
            taxonomyId,
            taxonomyName,
            taxonomyPath,
            type,
            field
        });

        return httpService.get(`${baseUrl}/${bucketKey}/items`, {
            params: Object.assign(
                {},
                params,
                {
                    number: pageSize,
                    page: pageNumber
                }
            ),
            headers: getCommonHeaders(token)
        });
    };

    const getOne = (keyOrId, { token }) => {
        checkAccessToken(token);
        return httpService.get(`${baseUrl}/${bucketKey}/items/${keyOrId}`, {
            headers: getCommonHeaders(token)
        });
    };


    const getByName = (contentName, options) => get({
        name: contentName
    }, options);

    const getByType = (contentType, options) => get({
        type: contentType
    }, options);

    const getByTaxonomyName = (taxonomyName, options) => get({
        taxonomyName
    }, options);

    const getByTaxonomyPath = (taxonomyPath, options) => get({
        taxonomyPath
    }, options);

    const getByTaxonomyId = (taxonomyId, options) => get({
        taxonomyId
    }, options);

    const getByField = (fieldQuery, options) => get({
        field: fieldQuery
    }, options);

    return {
        get,
        getByTaxonomyPath,
        getByType,
        getById: getOne,
        getByTaxonomyId,
        getByTaxonomyName,
        getByName,
        getByField
    };
};
