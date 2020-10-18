import { Client as DiscordClient } from 'discord.js'
import ModuleManager from '../managers/ModuleManager.js'
import ServerManager from '../managers/ServerManager.js'
import UserManager from '../managers/UserManager.js'
import embedUtils from '../util/Embed.js'
import log from '../util/Log.js'
import util from '../util/Util.js'
import auth from '../../data/auth.js'
import config from '../../data/config.js'

export default class Main extends DiscordClient {
    _moduleManager  = new ModuleManager(this);
    _serverManager  = new ServerManager(this);
    _userManager    = new UserManager(this);
    globalStorage   = new Map();

    /**
     * @param {string} root_dir The root directory of the project
     * @param {string} token Discord Bot token
     */
    constructor(root_dir, token) {
        super(config.client_options);

        Object.assign(this, {
            auth,
            config,
            embedUtils,
            log,
            util
        });

        this._root_dir = root_dir;
        this._token = token;
    }

    /**
     * @returns {ModuleManager}
     */
    get modules() {
        return this._moduleManager;
    }

    /**
     * @returns {string} The root directory of the project
     */
    get root() {
        return this._root_dir;
    }

    /**
     * @returns {ServerManager}
     */
    get servers() {
        return this._serverManager;
    }

    /**
     * @returns {UserManager}
     */
    get userManager() {
        return this._userManager;
    }

    /**
     * @returns {string} The version from the package.json
     */
    get version() {
        return `v${process.argv[2]}`;
    }

    /**
     * Disconnects the client and tells all modules to cleanup
     */
    async shutdown() {
        this.destroy();

        await this._moduleManager.cleanup();

        process.exit(0);
    }

    /**
     * @param {}
     */
    async start() {
        await this._moduleManager.load();

        this.login(this._token);
    }
}
