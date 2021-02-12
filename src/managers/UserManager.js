import User from '../structures/User.js'

/**
 * A map of user structures mapped by their discord id
 */
export default class UserManager extends Map {
    /**
     * @param {Main} main
     */
    constructor(main) {
        super();

        this._m = main;
    }

    /**
     * @param {DiscordUser|string} userResolvable A User
     */
    get(userResolvable) {
        const user_id = userResolvable.id ? userResolvable.id : userResolvable;

        if (this.has(user_id)) {
            return super.get(user_id);
        }

        let user = userResolvable.id ? userResolvable : this._m.users.cache.get(user_id);
        user = new User(this._m, user);

        this.set(user_id, user);

        return user;
    }
}
