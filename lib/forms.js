import { getCommonHeaders, checkAccessToken } from './utils';

const toUrlEncodedForm = (formPayload) => {
    const form = Object.keys(formPayload)
        .map(propName => `${propName}=${formPayload[propName]}`)
        .reduce((acc, queryParam) => (acc ? `${acc}&${queryParam}` : queryParam), '');
    return encodeURI(form);
};

const getHeaders = (accessToken, includeContentType = true) => {
    checkAccessToken(accessToken);
    const contentType = includeContentType ? {
        'content-type': 'application/x-www-form-urlencoded'
    } : {};
    return Object.assign({}, getCommonHeaders(accessToken), contentType);
};

export const getTokenLinkedAPI = (formsAPI, token) => ({
    getForm: formKey => formsAPI.getForm(formKey, {
        token
    }),
    submitForm: (formKey, formData) => formsAPI.submitForm(formKey, formData, {
        token
    }),
    testSubmitForm: (formKey, formData) => formsAPI.testSubmitForm(formKey, formData, {
        token
    })
});

export default ({ httpService, bucketKey, baseUrl }) => {
    const getForm = (formKey, { token }) => httpService.get(`${baseUrl}/${bucketKey}/forms/${formKey}`, {
        headers: getHeaders(token, false)
    });

    const submitForm = (formKey, form, { token }) =>
        httpService.post(`${baseUrl}/${bucketKey}/forms/${formKey}`, {
            body: toUrlEncodedForm(form),
            headers: getHeaders(token)
        });

    const testSubmitForm = (formKey, form, { token }) =>
        httpService.post(`${baseUrl}/${bucketKey}/forms/${formKey}/test`, {
            body: toUrlEncodedForm(form),
            headers: getHeaders(token)
        });

    return {
        getForm,
        submitForm,
        testSubmitForm
    };
};

