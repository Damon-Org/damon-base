export const delay = (timeout) => new Promise((resolve, reject) => setTimeout(resolve, timeout));

const isObject = d => typeof d === 'object' && d !== null;
export const flatten = (obj, ...props) => {
    if (!isObject(obj)) return obj;

    props = Object.assign(
        ...Object.keys(obj)
            .filter(k => !k.startsWith('_'))
            .map(k => ({ [k]: true })),
        ...props
    );

    const out = {};

    for (let [prop, newProp] of Object.entries(props)) {
        if (!newProp) continue;
        newProp = newProp === true ? prop : newProp;

        const element = obj[prop];
        const elemIsObj = isObject(element);
        const valueOf = elemIsObj && typeof element.valueOf === 'function' ? element.valueOf() : null;

        // If it's an array, flatten each element
        if (Array.isArray(element)) out[newProp] = element.map(e => flatten(e));
        // If it's an object with a primitive `valueOf`, use that value
        else if (typeof valueOf !== 'object') out[newProp] = valueOf;
        // If it's a primitive
        else if (!elemIsObj) out[newProp] = element;
    }

    return out;
};

export default {
    delay,
    flatten,
    isObject
};
