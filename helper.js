import crypto from 'crypto';
import { config } from './config.js';

const signData = (data) => {
    if (data) {
        let hmac = crypto.createHmac('sha1', config.SECRET_KEY);
        hmac.setEncoding('base64');
        hmac.write(data);
        hmac.end();
        return hmac.read();
    } else {
        return '';
    }
};

const dateFormat = (date, fstr, utc) => {
    utc = utc ? 'getUTC' : 'get';
    return fstr.replace(/%[YmdHMS]/g, (m) => {
        switch (m) {
            case '%Y': return date[utc + 'FullYear'](); // no leading zeros required
            case '%m': m = 1 + date[utc + 'Month'](); break;
            case '%d': m = date[utc + 'Date'](); break;
            case '%H': m = date[utc + 'Hours'](); break;
            case '%M': m = date[utc + 'Minutes'](); break;
            case '%S': m = date[utc + 'Seconds'](); break;
            default: return m.slice(1); // unknown code, remove %
        }
        // add leading zero if required
        return ('0' + m).slice(-2);
    });
};

const getSerialicedParameters = (params) => Object.entries(params).sort().map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')

const addParamOptional = (params, nameParam, param) => (param ?? '' !== '') ? { ...params, [nameParam]: param } : params;
const addUriOptionalOption = (uri, name, hasOption = true) => `${uri}${hasOption ? `/${name}` : ''}`;
const addUriOptionalParam = (uri, param, value) => `${uri}${(value ?? '' !== '') ? `/${param}/${value}` : ''}`;
const addUriOptionalPath = (uri, param) => `${uri}${(param ?? '' !== '') ? `/${param}` : ''}`;

const http = async (HTTPMethod, queryString, params = {}, xHeaders = '', utc = '') => {
    utc = utc || dateFormat(new Date(), config.UTC_STRING_FORMAT, true);

    let serialized_params = getSerialicedParameters(params);
    let stringToSign = `${HTTPMethod.toUpperCase().trim()}\n${utc}\n${xHeaders}\n${queryString.trim()}${serialized_params ? '\n' + serialized_params : ''}`;

    let authorizationHeader = config.AUTHORIZATION_METHOD
        + config.AUTHORIZATION_HEADER_FIELD_SEPARATOR
        + config.APP_ID
        + config.AUTHORIZATION_HEADER_FIELD_SEPARATOR
        + signData(stringToSign);

    let headers = {
        [config.AUTHORIZATION_HEADER_NAME]: authorizationHeader,
        [config.DATE_HEADER_NAME]: utc,
        [config.PLUGIN_HEADER_NAME]: "Nodejs"
    };

    let options = {
        method: HTTPMethod,
        headers: headers
    }

    if (HTTPMethod == "POST" || HTTPMethod == "PUT") {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = serialized_params
    }



    let url = config.API_HOST.origin + queryString;

    const response = await fetch(url, options);
    return (response.status != 204) ? await response.json() : null;
};

export { http, addParamOptional, addUriOptionalOption, addUriOptionalParam, addUriOptionalPath }