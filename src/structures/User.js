import { flatten } from '../util/Util.js'

export default class User {
    /**
     * @param {Main} main
     * @param {User} user
     */
    constructor(main, user) {
        this._m = main;

        this.user = user;

        this.storage = new Map();
    }

    get id() {
        return this.user.id;
    }

    toJSON() {
        return flatten(this, {
            user: false,
        });
    }
}
