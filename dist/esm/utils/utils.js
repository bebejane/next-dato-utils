import { ApiError } from "@datocms/cma-client-browser/dist/types";
export const isServer = typeof window === 'undefined';
export const chunkArray = (array, chunkSize) => {
    const newArr = [];
    for (let i = 0; i < array.length; i += chunkSize)
        newArr.push(array.slice(i, i + chunkSize));
    return newArr;
};
export const parseDatoError = (err) => {
    const errors = err.errors.map(({ attributes: { code, details } }) => ({ code, field: details?.field, message: details?.message, detailsCode: details?.code, errors: Array.isArray(details?.errors) ? details?.errors.join('. ') : undefined }));
    return errors.map(({ code, field, message, detailsCode, errors }) => `${code} ${field ? `(${field})` : ''} ${message || ''} ${detailsCode || ''} ${errors ? `(${errors})` : ''}`).join('\n');
};
export const parseDatoCMSApiError = (e) => {
    if (e instanceof ApiError === false)
        return typeof e === 'string' ? e : e.message || e.toString();
    const err = new ApiError(e);
    return err.errors.map(e => {
        let code = `${e.attributes.code}`;
        let errors = [];
        if (Array.isArray(e.attributes.details?.errors)) {
            e.attributes.details.errors.forEach(e => {
                errors.push(Object.keys(e).map(k => `${k}: ${e[k]}`).join(', '));
            });
        }
        return `${code}${errors.length ? `: ${errors.join('. ')}` : ''}`;
    }).join('\n');
};
export const isEmpty = (obj) => Object.keys(obj).filter(k => obj[k] !== undefined).length === 0;
export const capitalize = (str, lower = false) => {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
};
export const sleep = (ms) => new Promise((resolve, refject) => setTimeout(resolve, ms));
export const rInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const truncateParagraph = (s, sentances = 1, ellipsis = true, minLength = 200) => {
    if (!s || s.length < minLength)
        return s;
    let dotIndex = s.split('.')?.slice(0, sentances + 1).join('.').lastIndexOf('.');
    let qIndex = s.split('? ')?.slice(0, sentances + 1).join('? ').lastIndexOf('? ');
    const isQuestion = qIndex !== -1 && qIndex < dotIndex || (dotIndex === -1 && qIndex > -1);
    if (dotIndex === -1 && qIndex === -1) {
        dotIndex = minLength - 1;
        ellipsis = true;
    }
    let str = s.substring(0, isQuestion ? qIndex : dotIndex); //`${s.substring(0, minLength - 1)}${s.substring(minLength - 1).split('.').slice(0, sentances).join('. ')}`
    return `${str}${ellipsis ? '...' : isQuestion ? '?' : '.'}`;
};
export const truncateWords = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    var truncatedText = text.substring(0, maxLength);
    var lastSpaceIndex = truncatedText.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
        truncatedText = truncatedText.substr(0, lastSpaceIndex);
    }
    return truncatedText + '...';
};
export const sortSwedish = (arr, key) => {
    const alfabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Å", "Ä", "Ö"];
    return arr.sort((a, b) => {
        const ai = alfabet.findIndex((l) => l === (typeof key === 'string' ? a[key] : a)?.charAt(0).toUpperCase());
        const bi = alfabet.findIndex((l) => l === (typeof key === 'string' ? b[key] : b)?.charAt(0).toUpperCase());
        return !ai ? -1 : ai > bi ? 1 : ai === bi ? 0 : -1;
    });
};
export const awaitElement = async (selector) => {
    const cleanSelector = function (selector) {
        (selector.match(/(#[0-9][^\s:,]*)/g) || []).forEach(function (n) {
            selector = selector.replace(n, '[id="' + n.replace("#", "") + '"]');
        });
        return selector;
    };
    for (let i = 0; i < 100; i++) {
        const el = document.querySelector(cleanSelector(selector));
        if (el)
            return el;
        await sleep(30);
    }
    throw new Error(`Element ${selector} not found`);
};
//# sourceMappingURL=utils.js.map