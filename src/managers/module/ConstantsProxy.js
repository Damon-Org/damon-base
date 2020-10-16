export default (moduleManager) => {
    return new Proxy(moduleManager, {
        get: (target, prop, receiver) => {
            if (!target.has(prop)) return {};
            return target.get(prop).constants;
        }
    });
};
