export default function iterateObject(obj, fn) {
    let i = 0, keys = [];
    if (Array.isArray(obj)) {
        for (; i < obj.length; ++i) {
            if (fn(obj[i], i, obj) === false)
                break;
        }
    }
    else if (typeof obj === "object" && obj !== null) {
        keys = Object.keys(obj);
        for (; i < keys.length; ++i) {
            if (fn(obj[keys[i]], keys[i], obj) === false)
                break;
        }
    }
}
