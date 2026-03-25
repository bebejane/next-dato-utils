import { ApiError } from '@datocms/cma-client';
export const isServer = typeof window === 'undefined';
export const chunkArray = (array, chunkSize) => {
    const newArr = [];
    for (let i = 0; i < array.length; i += chunkSize)
        newArr.push(array.slice(i, i + chunkSize));
    return newArr;
};
export const parseDatoError = (err) => {
    const errors = err.errors.map(({ attributes: { code, details } }) => ({
        code,
        field: details?.field,
        message: details?.message,
        detailsCode: details?.code,
        errors: Array.isArray(details?.errors) ? details?.errors.join('. ') : undefined,
    }));
    return errors
        .map(({ code, field, message, detailsCode, errors }) => `${code} ${field ? `(${field})` : ''} ${message || ''} ${detailsCode || ''} ${errors ? `(${errors})` : ''}`)
        .join('\n');
};
export const parseDatoCMSApiError = (e) => {
    if (e instanceof ApiError === false)
        return typeof e === 'string' ? e : e.message || e.toString();
    const err = new ApiError(e);
    return err.errors
        .map((e) => {
        let code = `${e.attributes.code}`;
        let errors = [];
        if (Array.isArray(e.attributes.details?.errors)) {
            e.attributes.details.errors.forEach((e) => {
                errors.push(Object.keys(e)
                    .map((k) => `${k}: ${e[k]}`)
                    .join(', '));
            });
        }
        return `${code}${errors.length ? `: ${errors.join('. ')}` : ''}`;
    })
        .join('\n');
};
export const isEmpty = (obj) => Object.keys(obj).filter((k) => obj[k] !== undefined).length === 0;
export const capitalize = (str, lower = false) => {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());
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
    let dotIndex = s
        .split('.')
        ?.slice(0, sentances + 1)
        .join('.')
        .lastIndexOf('.');
    let qIndex = s
        .split('? ')
        ?.slice(0, sentances + 1)
        .join('? ')
        .lastIndexOf('? ');
    const isQuestion = (qIndex !== -1 && qIndex < dotIndex) || (dotIndex === -1 && qIndex > -1);
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
export const truncateText = (text, options) => {
    if (!text)
        return '';
    let { sentences = 1, useEllipsis = false, minLength = 0 } = options;
    const sentencesArr = text.match(/[^\.!\?]+[\.!\?]+/g);
    if (!sentencesArr || sentencesArr.length <= sentences)
        return text;
    let truncatedText = sentencesArr.slice(0, sentences).join(' ');
    while (truncatedText.length < minLength && truncatedText.search(/[!?]/) > -1) {
        if (!sentencesArr[sentences])
            break;
        truncatedText = truncatedText.concat(sentencesArr[sentences].match(/^[^!.?]+[!.?]+/)?.[0] ?? '');
        sentences++;
    }
    return `${truncatedText}${useEllipsis ? '...' : ''}`;
};
export const sortSwedish = (arr, key) => {
    const sorter = new Intl.Collator('sv', { usage: 'sort' });
    return arr.sort((a, b) => sorter.compare(a[key], b[key]));
};
export const awaitElement = async (selector, ms = 1000) => {
    const cleanSelector = function (selector) {
        (selector.match(/(#[0-9][^\s:,]*)/g) || []).forEach(function (n) {
            selector = selector.replace(n, '[id="' + n.replace('#', '') + '"]');
        });
        return selector;
    };
    const retry = 30;
    for (let t = 0; t < ms; t += retry) {
        const el = document.querySelector(cleanSelector(selector));
        if (el)
            return el;
        await sleep(retry);
    }
    return null;
};
export const haveStructuredContent = (content) => {
    if (!content)
        return false;
    if (Array.isArray(content?.blocks) && content.blocks.length > 0)
        return true;
    if (Array.isArray(content?.inlineBlocks) && content.inlineBlocks.length > 0)
        return true;
    const document = content?.value?.document;
    const visit = (node) => {
        if (!node)
            return false;
        if (typeof node?.value === 'string' && node.value.trim().length > 0)
            return true;
        const children = node?.children;
        return Array.isArray(children) ? children.some(visit) : false;
    };
    return visit(document);
};
export const isEmail = (email) => {
    if (!email)
        return false;
    const regexp = new RegExp(/(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:\.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
    return regexp.test(email);
};
//# sourceMappingURL=utilities.js.map