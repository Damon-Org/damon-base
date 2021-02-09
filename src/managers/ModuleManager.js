import ImportDir from '@yimura/import-dir'
import ModuleProxy from './module/ModuleProxy.js'
import log from '../util/Log.js'
import { resolve } from 'path'

export default class ModuleManager extends ModuleProxy {
    _cache = new Map();
    _scope = {};

    /**
     * @param {Main} main The program entrypoint class
     */
    constructor(main) {
        super();

        this._m = main;
    }

    /**
     * Tells the modules it's time to stop execution and cleanup
     */
    async cleanup() {
        for (const module of this._cache) {
            const [ name, instance ] = module;

            if (typeof instance.cleanup === 'function') await instance.cleanup();
        }
    }

    /**
     * @param {string} moduleName
     */
    get(moduleName) {
        return this._cache.get(moduleName);
    }

    /**
     * @param {string} scopeName
     * @returns {Map}
     */
    getScope(scopeName) {
        return this._scope[scopeName];
    }

    /**
     * @param {string} moduleName
     */
    getServer(moduleName) {
        return this._scope['server'].get(moduleName);
    }

    has(moduleName) {
        return this._cache.has(moduleName);
    }

    async load() {
        const modules = ImportDir(resolve(`./src/modules/`), { recurse: true, recurseDepth: 1 });

        await this._importModules(modules);

        if (!await this._checkModuleRequirements()) {
            log.error('MODULES', 'Some modules did not meet their requirements.');

            process.exit(1);
        }
    }

    /**
     * @param {string} scope
     * @param {*} module
     */
    _addModuleToScope(scope, module) {
        if (!this._scope[scope.group]) this._scope[scope.group] = new Map();
        if (this._scope[scope.group].has(scope.name)) {
            log.error('MODULES', `Duplicate scoped module name error, module "${module.name}" with scope name "${scope.name}"`);

            return;
        }

        this._scope[scope.group].set(scope.name, module);
    }

    /**
     * @private
     */
    async _checkModuleRequirements() {
        for (const [ name, instance ] of this._cache) {
            if (instance.requires) {
                for (const requirement of instance.requires) {
                    if (!this._cache.has(requirement)) {
                        log.error('MODULES', `Module "${name}" has an unmet requirement "${requirement}"`);

                        return false;
                    }
                }
            }

            if (instance.events) {
                for (const _event of instance.events) {
                    if (_event.mod) {
                        const mod = this._cache.get(_event.mod);
                        if (mod) {
                            mod.on(_event.name, instance[_event.call].bind(instance));

                            continue;
                        }
                    }

                    if (typeof this._m.on === 'function') this._m.on(_event.name, instance[_event.call].bind(instance));
                }
            }
        }

        for (const [ name, instance ] of this._cache) {
            if (typeof instance.init === 'function' && !await instance.init()) return false;
        }

        return true;
    }

    /**
     * @private
     * @param {Object} modules
     * @param {string} [parentName='']
     */
    async _importModules(modules, parentName) {
        for (const bit in modules) {
            if (modules.hasOwnProperty(bit)) {
                if (modules[bit] instanceof Promise) {
                    try {
                        modules[bit] = (await modules[bit]).default;
                    } catch (e) {
                        log.error('MODULES', `An error occured while importing ${parentName}`, e);

                        continue;
                    }

                    try {
                        const instance = new modules[bit](this._m);
                        if (instance.disabled) {
                            log.warn('MODULES', `Modules disabled: "${instance.name}"`);

                            continue;
                        }

                        if (this._cache.has(instance.name)) {
                            log.error('MODULES', `Duplicate module error: "${instance.name}"`);

                            continue;
                        }

                        this._cache.set(instance.name, instance);

                        if (instance.scope) this._addModuleToScope(instance.scope, instance);
                    } catch (e) {
                        log.warn('MODULES', `Module is broken, ${parentName}`, e);
                    }
                    continue;
                }
                await this._importModules(modules[bit], bit);
            }
        }
    }
}