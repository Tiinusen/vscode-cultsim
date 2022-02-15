import { Content } from "../model/content";

export function set(obj, path, value) {
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

    pathArray.reduce((acc, key, i) => {
        if (acc[key] === undefined) acc[key] = {};
        if (i === pathArray.length - 1) acc[key] = value;
        return acc[key];
    }, obj);
}

export function unset(obj, path) {
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

    pathArray.reduce((acc, key, i) => {
        if (i === pathArray.length - 1) delete acc[key];
        return acc[key];
    }, obj);
}

export function get(obj, path, defValue) {
    if (!path) return undefined;
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
    const result = pathArray.reduce(
        (prevObj, key) => prevObj && prevObj[key],
        obj
    );
    return result === undefined ? defValue : result;
}

export function has(obj, path) {
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
    return !!pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj);
}

export function newNonce(length = 32) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function setDebounce<T>(callback: T, ms?: number): T {
    let timeout = null;
    return function (...args: any[]) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(callback as any, ms, ...args);
    } as any;
}