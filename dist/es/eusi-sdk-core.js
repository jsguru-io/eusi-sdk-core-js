var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var checkForArray = function checkForArray(operatorName, operatorValue) {
    if (!Array.isArray(operatorValue)) {
        throw new Error('value of ' + operatorName + ' operator must be of Array type');
    }
};

var parseOperatorName = function parseOperatorName(key, operatorName) {
    return key + '[' + operatorName + ']';
};

var parseOperatorValue = function parseOperatorValue(name, operatorName, operatorValue) {
    switch (operatorName) {
        case '$between':
        case '$in':
            {
                checkForArray(operatorName, operatorValue);
                return defineProperty({}, name + '[' + operatorName + ']', operatorValue.join(','));
            }

        default:
            {
                return defineProperty({}, parseOperatorName(name, operatorName), operatorValue);
            }
    }
};

var getElementFilterFromQueryObject = function getElementFilterFromQueryObject(name, query) {
    return Object.keys(query).reduce(function (acc, operatorName) {
        return Object.assign({}, acc, parseOperatorValue(name, operatorName, query[operatorName]));
    }, {});
};

var getFilter = function getFilter(name) {
    return function (value) {
        return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' ? defineProperty({}, name, value) : getElementFilterFromQueryObject(name, value);
    };
};

var singleFilterParser = {
    contentModel: getFilter('sys.type'),
    key: getFilter('sys.key'),
    title: getFilter('sys.name'),
    taxonomyName: getFilter('sys.taxonomy.name'),
    taxonomyId: getFilter('sys.taxonomy'),
    taxonomyPath: getFilter('sys.taxonomy.path'),
    field: function field() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return Object.keys(value).reduce(function (acc, elementName) {
            var elementValue = value[elementName];
            var filterName = 'elem.' + elementName;

            var filter = getFilter(filterName)(elementValue);
            return Object.assign({}, acc, filter);
        }, {});
    }
};

var parseFilter = (function (filter) {
    return Object.keys(filter).filter(function (filterName) {
        return !!filter[filterName];
    }).reduce(function (acc, filterName) {
        var filterValue = filter[filterName];
        var parser = singleFilterParser[filterName];
        return Object.assign({}, acc, parser(filterValue));
    }, {});
});

var checkAccessToken = function checkAccessToken(accessToken) {
    if (!accessToken) {
        throw new Error("access token missing! Maybe you forgot to login or register or \n        for anonymous usage you have to obtain the token by calling getAccess method on eusi client object");
    }
};

var getCommonHeaders = function getCommonHeaders(token) {
    return {
        Authorization: "Bearer " + token
    };
};

var Content = (function (_ref) {
    var bucketKey = _ref.bucketKey,
        httpService = _ref.httpService,
        baseUrl = _ref.baseUrl;

    var get = function get(query) {
        var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref2$pageSize = _ref2.pageSize,
            pageSize = _ref2$pageSize === undefined ? 20 : _ref2$pageSize,
            _ref2$pageNumber = _ref2.pageNumber,
            pageNumber = _ref2$pageNumber === undefined ? 1 : _ref2$pageNumber,
            token = _ref2.token;

        var key = query.key,
            title = query.title,
            taxonomyId = query.taxonomyId,
            taxonomyName = query.taxonomyName,
            taxonomyPath = query.taxonomyPath,
            contentModel = query.contentModel,
            field = query.field;

        checkAccessToken(token);
        var params = parseFilter({
            key: key,
            title: title,
            taxonomyId: taxonomyId,
            taxonomyName: taxonomyName,
            taxonomyPath: taxonomyPath,
            contentModel: contentModel,
            field: field
        });

        return httpService.get(baseUrl + '/' + bucketKey + '/items', {
            params: Object.assign({}, params, {
                number: pageSize,
                page: pageNumber
            }),
            headers: getCommonHeaders(token)
        });
    };

    var getOne = function getOne(keyOrId, _ref3) {
        var token = _ref3.token;

        checkAccessToken(token);
        return httpService.get(baseUrl + '/' + bucketKey + '/items/' + keyOrId, {
            headers: getCommonHeaders(token)
        });
    };

    var getByTitle = function getByTitle(contentTitle, options) {
        return get({
            title: contentTitle
        }, options);
    };

    var getByContentModel = function getByContentModel(contentModel, options) {
        return get({
            contentModel: contentModel
        }, options);
    };

    var getByTaxonomyName = function getByTaxonomyName(taxonomyName, options) {
        return get({
            taxonomyName: taxonomyName
        }, options);
    };

    var getByTaxonomyPath = function getByTaxonomyPath(taxonomyPath, options) {
        return get({
            taxonomyPath: taxonomyPath
        }, options);
    };

    var getByTaxonomyId = function getByTaxonomyId(taxonomyId, options) {
        return get({
            taxonomyId: taxonomyId
        }, options);
    };

    var getByField = function getByField(fieldQuery, options) {
        return get({
            field: fieldQuery
        }, options);
    };

    return {
        get: get,
        getByTaxonomyPath: getByTaxonomyPath,
        // making alias method so we don't break the previous version
        getByType: function getByType(type, options) {
            console.warn('DEPRECATED: method getByType is deprecated and won\'t be available ' + 'from the version 2.00. Please use getByContentModel instead');
            return getByContentModel(type, options);
        },

        getByContentModel: getByContentModel,
        getById: getOne,
        getByKey: getOne,
        getByTaxonomyId: getByTaxonomyId,
        getByTaxonomyName: getByTaxonomyName,
        getByTitle: getByTitle,
        // making alias method so we don't break the previous version
        getByName: function getByName(name, options) {
            console.warn('DEPRECATED: method getByName is deprecated and won\'t be' + ' available from the version 2.00. Please use getByTitle instead');
            return getByTitle(name, options);
        },

        getByField: getByField
    };
});

var getTokenLinkedAPI = function getTokenLinkedAPI(authAPI, token) {
    return {
        // there is only one method from AUTH API which requires token
        getUser: function getUser() {
            return authAPI.getUser({ token: token });
        }
    };
};

var Auth = (function (_ref) {
    var bucketKey = _ref.bucketKey,
        bucketSecret = _ref.bucketSecret,
        httpService = _ref.httpService,
        baseUrl = _ref.baseUrl;

    var getAccess = function getAccess() {
        return httpService.post(baseUrl + '/' + bucketKey + '/authorize', {
            body: {
                secret: bucketSecret
            }
        });
    };

    var execute = function execute(url, body) {
        return getAccess().then(function (response) {
            var headers = getCommonHeaders(response.token);
            return httpService.post(url, {
                headers: headers,
                body: body
            });
        });
    };

    var login = function login(email, password) {
        return execute(baseUrl + '/' + bucketKey + '/login', {
            email: email, password: password
        });
    };

    var register = function register(_ref2) {
        var email = _ref2.email,
            password = _ref2.password,
            firstName = _ref2.firstName,
            lastName = _ref2.lastName;
        return execute(baseUrl + '/' + bucketKey + '/register', {
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName
        });
    };

    var getUser = function getUser(_ref3) {
        var token = _ref3.token;
        return httpService.get(baseUrl + '/' + bucketKey + '/me', {
            headers: getCommonHeaders(token)
        });
    };

    return {
        getAccess: getAccess,
        login: login,
        register: register,
        getUser: getUser
    };
});

var toUrlEncodedForm = function toUrlEncodedForm(formPayload) {
    var form = Object.keys(formPayload).map(function (propName) {
        return propName + '=' + formPayload[propName];
    }).reduce(function (acc, queryParam) {
        return acc ? acc + '&' + queryParam : queryParam;
    }, '');
    return encodeURI(form);
};

var getHeaders = function getHeaders(accessToken) {
    var includeContentType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    checkAccessToken(accessToken);
    var contentType = includeContentType ? {
        'content-type': 'application/x-www-form-urlencoded'
    } : {};
    return Object.assign({}, getCommonHeaders(accessToken), contentType);
};

var getTokenLinkedAPI$1 = function getTokenLinkedAPI(formsAPI, token) {
    return {
        getForm: function getForm(formKey) {
            return formsAPI.getForm(formKey, {
                token: token
            });
        },
        submitForm: function submitForm(formKey, formData) {
            return formsAPI.submitForm(formKey, formData, {
                token: token
            });
        },
        testSubmitForm: function testSubmitForm(formKey, formData) {
            return formsAPI.testSubmitForm(formKey, formData, {
                token: token
            });
        }
    };
};

var Forms = (function (_ref) {
    var httpService = _ref.httpService,
        bucketKey = _ref.bucketKey,
        baseUrl = _ref.baseUrl;

    var getForm = function getForm(formKey, _ref2) {
        var token = _ref2.token;
        return httpService.get(baseUrl + '/' + bucketKey + '/forms/' + formKey, {
            headers: getHeaders(token, false)
        });
    };

    var submitForm = function submitForm(formKey, form, _ref3) {
        var token = _ref3.token;
        return httpService.post(baseUrl + '/' + bucketKey + '/forms/' + formKey, {
            body: toUrlEncodedForm(form),
            headers: getHeaders(token)
        });
    };

    var testSubmitForm = function testSubmitForm(formKey, form, _ref4) {
        var token = _ref4.token;
        return httpService.post(baseUrl + '/' + bucketKey + '/forms/' + formKey + '/test', {
            body: toUrlEncodedForm(form),
            headers: getHeaders(token)
        });
    };

    return {
        getForm: getForm,
        submitForm: submitForm,
        testSubmitForm: testSubmitForm
    };
});

var config = {
    deliveryApi: 'https://delivery.eusi.cloud/api/v1'
};

var Taxonomy = (function (_ref) {
    var bucketKey = _ref.bucketKey,
        baseUrl = _ref.baseUrl,
        httpService = _ref.httpService;
    return {
        getTaxonomy: function getTaxonomy(taxonomyId, _ref2) {
            var token = _ref2.token;

            return httpService.get(baseUrl + '/' + bucketKey + '/taxonomy/' + taxonomyId, {
                headers: getCommonHeaders(token)
            });
        }
    };
});

var checkForAccessData = function checkForAccessData(key, secret) {
    var errorMessage = function errorMessage(paramName) {
        return paramName + ' data is missing. You can find it under settings section on EUSI web app';
    };

    if (!key) {
        throw new Error(errorMessage('bucketKey'));
    }

    if (!secret) {
        throw new Error(errorMessage('bucketSecret'));
    }
};

var Client = (function (_ref) {
    var HttpService = _ref.HttpService,
        deliveryApi = _ref.deliveryApi;
    return function () {
        var bucketAccessData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var bucketKey = bucketAccessData.bucketKey,
            bucketSecret = bucketAccessData.bucketSecret;

        checkForAccessData(bucketKey, bucketSecret);
        var options = {
            bucketKey: bucketKey,
            bucketSecret: bucketSecret,
            httpService: HttpService,
            baseUrl: deliveryApi || config.deliveryApi
        };

        var contentFilteringAPI = Content(options);
        var authAPI = Auth(options);
        var formsAPI = Forms(options);
        var taxonomyAPI = Taxonomy(options);

        // creating a helper object which will encapsulate the access token which is then passed to every calling function
        var createLinkBasedOnToken = function createLinkBasedOnToken(token) {
            var accessTokenAPI = Object.assign({}, contentFilteringAPI, taxonomyAPI);
            var baseAPI = Object.keys(accessTokenAPI).reduce(function (acc, functionName) {
                return Object.assign({}, acc, defineProperty({}, functionName, function () {
                    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        rest[_key - 1] = arguments[_key];
                    }

                    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                    return accessTokenAPI[functionName](query, Object.assign.apply(Object, [{}, {
                        token: token
                    }].concat(rest)));
                }));
            }, {});

            return Object.assign({}, baseAPI, getTokenLinkedAPI$1(formsAPI, token), getTokenLinkedAPI(authAPI, token));
        };

        return Object.assign(createLinkBasedOnToken, authAPI, formsAPI, contentFilteringAPI, taxonomyAPI);
    };
});

export default Client;
