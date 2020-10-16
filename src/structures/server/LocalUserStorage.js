export default class LocalUserStorage {
    constructor() {
        this._storage = new Map();
    }

    /**
     * @param {User|string} userResolvable A User class or a user id
     * @returns {Map} A map with all the local user settings within a guild
     */
    get(userResolvable) {
        const user_id = userResolvable.id ? userResolvable.id : userResolvable;

        if (this._storage.has(user_id)) {
            return this._storage.get(user_id);
        }

        const storageObject = new Map();
        this._storage.set(user_id, storageObject);

        return storageObject;
    }

    /**
     * @param {UserResolvable} userResolvable A User class or a user id
     * @param {String} prop The string identifier for the property to lookup
     * @returns {*} The value contained by the property that was requested
     */
    getProp(userResolvable, prop) {
        const storageObject = this.get(userResolvable);

        return storageObject.get(prop);
    }

    /**
     * @param {UserResolvable} userResolvable A User class or a user id
     * @param {String} prop The string identifier for the property to lookup
     * @returns {Boolean} Returns false if the property does not exists, true on successfull removal
     */
    removeProp(userResolvable, prop) {
        const storageObject = this.get(userResolvable);

        return storageObject.delete(prop);
    }

    /**
     * @param {UserResolvable} userResolvable A User class or a user id
     * @param {String} prop The property that should be overwritten or created
     * @param {*} value The value to set for the property
     * @returns {Map} The updated Map of this user
     */
    setProp(userResolvable, prop, value) {
        const storageObject = this.get(userResolvable);

        return storageObject.set(prop, value);
    }
}
