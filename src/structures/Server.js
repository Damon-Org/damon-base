import LocalUserStorage from './server/LocalUserStorage.js'
import Scope from './Scope.js'

export default class Server extends Scope {
    constructor(main, guild) {
        this._m = main;

        this.guild = guild;

        this.localUsers = new LocalUserStorage();

        this.initScope('server');
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
