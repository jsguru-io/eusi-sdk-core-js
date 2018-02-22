import { getCommonHeaders } from './utils';

export default ({ bucketKey, baseUrl, httpService }) => ({
    getTaxonomy(taxonomyId, { token }) {
        return httpService.get(`${baseUrl}/${bucketKey}/taxonomy/${taxonomyId}`, {
            headers: getCommonHeaders(token)
        });
    }
});
