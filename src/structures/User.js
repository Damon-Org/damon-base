import Scope from './Scope.js';

export default class User extends Scope {
    /**
     * @param {Main} main
     * @param {User} user
     */
    constructor(main, user) {
        super();

        this._m = main;

        this.user = user;

        this.storage = new Map();

        this.initScope('user');
    }

    get id() {
        return this.user.id;
    }
}
