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
            title,
            taxonomyId,
            taxonomyName,
            taxonomyPath,
            contentModel,
            field
        } = query;
        checkAccessToken(token);
        const params = parseFilter({
            key,
            title,
            taxonomyId,
            taxonomyName,
            taxonomyPath,
            contentModel,
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


    const getByTitle = (contentTitle, options) => get({
        title: contentTitle
    }, options);

    const getByContentModel = (contentModel, options) => get({
        contentModel
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
        // making alias method so we don't break the previous version
        getByType(type, options) {
            console.warn('DEPRECATED: method getByType is deprecated and won\'t be available ' +
                'from the version 2.00. Please use getByContentModel instead');
            return getByContentModel(type, options);
        },
        getByContentModel,
        getById: getOne,
        getByKey: getOne,
        getByTaxonomyId,
        getByTaxonomyName,
        getByTitle,
        // making alias method so we don't break the previous version
        getByName(name, options) {
            console.warn('DEPRECATED: method getByName is deprecated and won\'t be' +
                ' available from the version 2.00. Please use getByTitle instead');
            return getByTitle(name, options);
        },
        getByField
    };
};
