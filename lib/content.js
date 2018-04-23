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
            model,
            field
        } = query;
        checkAccessToken(token);
        const params = parseFilter({
            key,
            title,
            taxonomyId,
            taxonomyName,
            taxonomyPath,
            model,
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

    const getByModel = (contentModel, options) => get({
        model: contentModel
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
                'from the version 2.0.0. Please use getByModel instead');
            return getByModel(type, options);
        },
        getByModel,
        getById: getOne,
        getByKey: getOne,
        getByTaxonomyId,
        getByTaxonomyName,
        getByTitle,
        // making alias method so we don't break the previous version
        getByName(name, options) {
            console.warn('DEPRECATED: method getByName is deprecated and won\'t be' +
                ' available from the version 2.0.0. Please use getByTitle instead');
            return getByTitle(name, options);
        },
        getByField
    };
};
