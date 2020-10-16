import Server from '../structures/Server.js'

export default class ServerManager extends Map {
    /**
     * @param {MainClient} main
     */
    constructor(main) {
        super();

        this._m = main;
    }

    /**
     * @param {Guild|string} guildResolvable A Discord Guild or Guild Id
     * @param {boolean} [createInstance=true] If a new Server instance should be created
     */
    get(guildResolvable, createInstance = true) {
        const guild_id = guildResolvable.id ? guildResolvable.id : guildResolvable;

        if (this.has(guild_id)) {
            return super.get(guild_id);
        }

        if (!createInstance) return null;

        const guild = guildResolvable.id ? guildResolvable : this._m.guilds.cache.get(guildResolvable);
        const server = new Server(this._m, guild);
        this.set(guild_id, server);

        return server;
    }
}
