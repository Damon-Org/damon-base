import LocalUserStorage from './server/LocalUserStorage.js'

export default class Server {
    constructor(main, guild) {
        this._m = main;

        this.guild = guild;

        this.localUsers = new LocalUserStorage();

        this._initServerModules();
    }

    /**
     * Initializes all registered server modules and clones their instances into the server class
     */
    _initServerModules() {
        const modules = this._m.modules.getScope('server');

        for (const [ name, module ] of modules) {
            this[name] = module.clone(this);
        }
    }

    get id() {
        return this.guild.id;
    }

    get prefix() {
        // Add your custom logic here to use custom prefixes

        return this._m.globalStorage.get('prefix');
    }

    set prefix(new_value) {
        // Add your custom logic here to use custom prefixes
    }
}
