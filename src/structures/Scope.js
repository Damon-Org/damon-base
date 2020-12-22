export default class Scope {
    constructor() {

    }

    /**
     * Initializes all registered modules from within the scope
     * @param {string} scope
     */
    initScope(scope) {
        const modules = this._m.modules.getScope(scope);

        for (const [ name, module ] of modules) {
            this[name] = module.clone(this);
        }

        for (const name of modules.keys()) {
            if (typeof this[name].initScope === 'function') this[name].initScope();
        }
    }
}