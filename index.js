'use strict';

const checkForArray = (operatorName, operatorValue) => {
    if (!Array.isArray(operatorValue)) {
        throw new Error(`value of ${operatorName} operator must be of Array type`);
    }
};

const parseOperatorValue = (name, operatorName, operatorValue) => {
    switch (operatorName) {
        case '$between': {
            checkForArray(operatorName, operatorValue);
            return {
                [`${name}[${operatorName}]`]: operatorValue.map(Number).join(',')
            };
        }

        case '$and': {
            checkForArray(operatorName, operatorValue);
            return parse$and(name, operatorName, operatorValue)
        }

        default: {
            return operatorValue
        }
    }
};

const getElementFilterFromQueryObject = (name, query) => {
    return Object.keys(query).reduce((acc, operatorName) => {
        return Object.assign({},
            acc,
            parseOperatorValue(name, operatorName, query[operatorName]));
    }, {});
};

const singleFilterParser = {
    id(value) {
        return {
            'sys.id': value
        };
    },
    type(value) {
        return {
            'sys.type': value
        };
    },
    key(value) {
        return {
            'sys.key': value
        };
    },
    name(value) {
        return {
            'sys.name': value
        };
    },
    taxonomyName(value) {
        return {
            'sys.taxonomy.name': value
        };
    },
    taxonomyId(value) {
        return {
            'sys.taxonomy': value
        };
    },
    taxonomyPath(value) {
        return {
            'sys.taxonomy.path': value,
        };
    },
    field(value = {}) {
        return Object.keys(value).reduce((acc, elementName) => {
            const elementValue = value[elementName];
            const filterName = `element.${elementName}`;
            const filter = typeof elementValue === 'string' ? {
                [filterName]: elementValue
            } : getElementFilterFromQueryObject(filterName, elementValue);

            return Object.assign({}, acc, filter);
        }, {});
    }
};

const parseFilter = (filter) => {
    return Object.keys(filter)
        .filter(filterName => !!filter[filterName])
        .reduce((acc, filterName) => Object.assign(
            acc,
            singleFilterParser[filterName](filter[filterName])), {})
};

var getCommonHeaders = (token) => ({
    Authorization: `Bearer ${token}`
});

const checkToken = (accessToken) => {
    if (!accessToken) {
        throw new Error('access token missing! Maybe you forgot to login or register');
    }
};

const getMany = ({ bucketKey, service, baseUrl }) =>
    ({ key, name, id, taxonomyId, taxonomyName, taxonomyPath, type, field }, accessToken) => {
        checkToken(accessToken);
        const params = parseFilter({
            key,
            name,
            id,
            taxonomyId,
            taxonomyName,
            taxonomyPath,
            type,
            field
        });

        console.log(params);
        return service.get(`${baseUrl}/${bucketKey}/items`, {
            params,
            headers: getCommonHeaders(accessToken)
        });
    };

const getOne = ({ bucketKey, baseUrl, service }, accessToken) => (keyOrId) => {
    checkToken(accessToken);
    return service.get(`${baseUrl}/${bucketKey}/items/${keyOrId}`, {
        headers: getCommonHeaders(accessToken)
    });
};


const getByContentName = (deps) => (contentName, accessToken) => {
    return getMany(deps)({
        name: contentName
    }, accessToken)
};

const getByContentId = (deps) => (contentId, accessToken) => {
    return getMany(deps)({
        id: contentId
    }, accessToken);
};

const getByContentType = (deps) => (contentType, accessToken) => {
    return getMany(deps, accessToken)({
        type: contentType
    });
};

const getByTaxonomyName = (deps) => (taxonomyName, accessToken) => {
    return getMany(deps)({
        taxonomyName
    }, accessToken);
};

const getByTaxonomyPath = (deps) => (taxonomyPath, accessToken) => {
    return getMany(deps)({
        taxonomyPath
    }, accessToken);
};

const getByTaxonomyId = (deps) => (taxonomyId, accessToken) => {
    return getMany(deps)({
        taxonomyId
    }, accessToken);
};

const getByField = (deps) => (fieldQuery, accessToken) => {
    return getMany(deps)({
        field: fieldQuery
    }, accessToken);
};

var Auth = ({ bucketKey, bucketSecret, service, baseUrl }) => {
    const getToken = () => {
        return service.post(`${baseUrl}/${bucketKey}/authorize`, {
            body: {
                secret: bucketSecret
            }
        });
    };

    const execute = (url, email, password) => {
        return getToken().then(response => {
            return service.post(url, {
                headers: getCommonHeaders(response.token),
                body: {
                    email,
                    password
                }
            })
        });
    };

    const login = (email, password) => {
        return execute(`${baseUrl}/${bucketKey}/login`, email, password);
    };

    const register = (email, password) => {
        return execute(`${baseUrl}/${bucketKey}/register`, email, password);
    };

    return {
        getToken,
        login,
        register
    };
};

var Client = ({ HttpService, Config }) => {
    const BASE_URL = Config.BASE_URL;
    return ({ bucketKey, bucketSecret }) => {
        const options = {
            bucketKey,
            bucketSecret,
            service: HttpService,
            baseUrl: BASE_URL
        };

        const contentFilteringAPI = {
            get: getMany(options),
            getByKey: getOne(options),
            getById: getByContentId(options),
            getByType: getByContentType(options),
            getByName: getByContentName(options),
            getByTaxonomyName: getByTaxonomyName(options),
            getByTaxonomyPath: getByTaxonomyPath(options),
            getByTaxonomyId: getByTaxonomyId(options),
            getByField: getByField(options)
        };

        const authAPI = Auth(options);

        const createLinkBasedOnToken = (token) => {
            return Object
                .keys(contentFilteringAPI)
                .reduce((acc, functionName) => Object.assign({}, acc, {
                    [functionName]: (...args) => {
                        return contentFilteringAPI[functionName](...args || {}, token)
                    }
                }), {});
        };

        return Object.assign(createLinkBasedOnToken, contentFilteringAPI, authAPI);
    };
};

module.exports = Client;
