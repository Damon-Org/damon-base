import Discord, { MessageEmbed } from 'discord.js'

export default class BaseCommand {
    _args = [];
    _msg;
    _instance;
    raw = {};

    /**
     * @param {Main} main
     */
    constructor(main) {
        this._m = main;
    }

/**
 * Getters
 */
    get args() {
        return this._args;
    }

    /**
     * @type {Discord}
     */
    get Discord() {
        return Discord;
    }

    /**
     * @type {Map}
     */
    get globalStorage() {
        return this._m.globalStorage;
    }

    /**
     * @type {Log}
     */
    get log() {
        return this._m.log;
    }

    get modules() {
        return this._m.modules;
    }

    /**
     * @type {Message}
     */
    get msgObj() {
        return this._msg;
    }

    /**
     * @type {GuildMember}
     */
    get serverMember() {
        return this._msg?.member;
    }

    /**
     * @type {Server}
     */
    get server() {
        return this.servers.get(this._msg.guild);
    }

    /**
     * @type {ServerManager}
     */
    get servers() {
        return this._m.servers;
    }

    /**
     * @type {TextChannel}
     */
    get textChannel() {
        return this._msg?.channel;
    }

    /**
     * @type {User}
     */
    get user() {
        return this.users.get(this._msg.author);
    }

    /**
     * @type {UserManager}
     */
    get users() {
        this._m.userManager;
    }

    /**
     * @type {VoiceChannel}
     */
    get voiceChannel() {
        return this.serverMember?.voice.channel;
    }

/**
 * Core Functionality Functions
 */
    /**
     * Assigns all the arguments into one object
     */
    assign(...args) {
        return Object.assign(...args);
    }

    /**
     * Clones the command instance perfectly to keep different command flows seperated
     */
    clone() {
        return new this._instance(this.category, this._m);
    }

    /**
     * Check if the person calling the command has the right to do so
     * @param {Message} msgObj
     * @param {Array<string>} args
     * @param {string} command The string that initiated this check
     * @param {boolean} mentioned If the command was activated through a mention
     */
    async exec(msgObj, args, command, mentioned) {
        this._msg = msgObj;
        this._args = args;

        if (mentioned) this._removeBotMention();

        if (!await this._canCommandRunInChannel(command)) return false;
        if (!await this._hasPermissions()) return false;
        if (!this._hasSelfPermissions()) return false;
        if (!this._argumentsSatisfied()) return false;

        try {
            if (typeof this.beforeRun === 'function' && !await this.beforeRun(command)) return false;
            if (typeof this.afterRun === 'function') await this.run(command);
            else return await this.run(command);
        } catch (e) {
            this.log.error('CMD', 'Check error occured:', e.stack);
        } finally {
            // Force our cleanup regardless of errors
            if (typeof this.afterRun === 'function') return await this.afterRun();
        }
    }

    /**
     * @param {Class} instance The utmost class instance of the command
     * @param {Object} object The object containing all the command details, arguments, requirements, ...
     * @param {boolean} [isInstance=true] If an instance is passed
     */
    register(instance, object, isInstance = true) {
        if (typeof object !== 'object') throw new Error('Invalid self assignment, expected object but got different type instead.');

        this.assign(this, object);

        if (!isInstance) return this.assign(this.raw, object);

        this._instance = instance;

        delete object.category;
        this.raw = object;
    }
/**
 * Shorthands
 */
    async dm(p1, p2) {
        try {
            return await this._msg.author.send(p1, p2);
        } catch (e) {
            throw e;
        }
    }

    reply(p1, p2) {
        return this.send(p1, p2, true);
    }

    send(p1, p2, reply = false) {
        if (!this.textChannel.permissionsFor(this._m.user.id).has(['SEND_MESSAGES', 'ATTACH_FILES'])) {
            const guild = this.textChannel.guild;
            const embed = new MessageEmbed()
                    .setAuthor(guild.name, guild.iconURL({size: 64}), `https://discordapp.com/channels/${guild.id}/${this.textChannel.id}`)
                    .setTitle('Missing permission')
                    .setDescription('I do not have permission to send messages or attach files.');

            this.dm(embed);
            return null;
        }

        if (reply) {
            return this._msg.reply(p1, p2);
        }
        return this.textChannel.send(p1, p2);
    }

/**
 * Private functions required for the proper execution of the command
 */
    /**
     * @param {string} title
     * @returns {boolean} False by default
     */
    _argumentException(title) {
        let description = '';

        console.log('yes');

        for (let i = 0; i < this._args.length; i++) {
            const argument = this._args[i];

            if (!argument.valid()) break;

            description += `\`\`\`${argument.required ? 'md' : 'ini' }\n${argument.toUserString()}\`\`\``;
        }

        const embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor('#ff0000');

        this._msg.channel.send(embed);

        return false;
    }

    _argumentsSatisfied() {
        if (this._args.length > this.params.length && !this.params[0]) {
            return this._argumentException('This command does not expect any arguments.');
        }

        for (let i = 0; i < this._args.length; i++) {
            if (!this.params[i] && !this.params[i-1].allow_sentence) {
                return this._argumentException('Too many arguments.');
            }
            if (this.params[i].allow_sentence) break;

            if (i+1 == this._args.length && this.params[i+1] && this.params[i+1].required) {
                return this._argumentException('Not enough arguments.');
            }
        }

        return true;
    }

    /**
     * This method will check if there's a lock on the channel
     * @private
     * @param {string} command The command that invoked the request
     */
    async _canCommandRunInChannel(command) {
        const isGuild = this.serverMember || this.msgObj.guild;
        if (!this.guild_only && !isGuild) return true;
        if (this.guild_only && !isGuild) {
            const newMsg = await this.msgObj.reply(`The following command \`${command}\` can not be ran outside of servers.`);

            return false;
        }

        return true;
    }

    /**
     * Checks if the bot has the required permissions to properly execute the command it was asked to execute
     * @private
     */
    _hasSelfPermissions() {
        if (!this.msgObj.guild || !this.serverMember) return true;
        if (!this.self_permission) return true;

        if (this.self_permission['channel'] || this.self_permission['text_channel'] || this.self_permission['voice_channel']) {
            if (this.voiceChannel && (this.self_permission['channel'] || this.self_permission['voice_channel']) && !this.voiceChannel.permissionsFor(this._m.user.id).has(this.self_permission['channel'] || this.self_permission['voice_channel'])) {
                const embed = new MessageEmbed()
                    .setTitle("❌ Missing Permissions ❌")
                    .setDescription(`**__I__ don't have the __${this.self_permission['channel'] || this.self_permission['voice_channel']}__ permission**\nfor voice channel you're in.`)
                    .setColor("#ffff00")
                this.textChannel.send(embed);

                return false;
            }

            if ((this.self_permission['channel'] || this.self_permission['voice_channel']) && !this.textChannel.permissionsFor(this._m.user.id).has(this.self_permission['channel'] || this.self_permission['text_channel'])) {
                const embed = new MessageEmbed()
                    .setTitle("❌ Missing Permissions ❌")
                    .setDescription(`**__I__ don't have the __${this.self_permission['channel'] || this.self_permission['text_channel']}__ permission**\nfor this text channel.`)
                    .setColor("#ffff00")
                this.textChannel.send(embed);

                return false;
            }
        }

        return true;
    }

    /**
     * If the command has additional permissions to check and loop throught them
     * @private
     */
    async _hasPermissions() {
        if (!this.msgObj.guild || !this.serverMember) return true;
        if (!this.permissions) return true;

        const or = this.permissions.logic == 'OR' && this.permissions.levels.length > 1 ? true : false;

        let result = true;

        for (let level of this.permissions.levels) {
            const type = level.type.toUpperCase();

            if (type === 'SERVER') {
                if (!this.serverMember.hasPermission(level.name)) {
                    if (or) {
                        result = false;

                        continue;
                    }

                    this.msgObj.reply(`you do not have permission to use this command.\nYou need the \`${level.name}\` permission(s).`)
                        .then(msg => msg.delete({timeout: 5e3}));

                    return false;
                }

                if (or) return true;
            }
            else if (type === 'ROLE') {
                if (this.serverMember.roles.cache.find(x => x.name.toLowerCase() === level.name)) {
                    if (or) {
                        result = false;

                        continue;
                    }

                    this.msgObj.reply(`you do not have permission to use this command.\nYou need the \`${level.name}\` role to use this command.`)
                        .then(msg => msg.delete({timeout: 5e3}));

                    return false;
                }

                if (or) return true;
            }
            else if (type === 'COMMAND_HANDLED') {
                if (!await this.permission()) {
                    result = false;

                    continue;
                }

                if (or) return true;
            }
            else {
                log.error('CMD', `Command '${this.name}' permissions incorrectly configured, unknown type: ${level.type}`);

                this.send('The developer has incorrectly configured the permissions of this command, contact the developer if this problem keeps occuring.');

                return false;
            }
        }

        return result;
    }

    /**
     * Checks if a user has the required system permissions to execute the command
     * @private
     */
    async _hasSystemPermission() {
        if (!this.system_permission) return true;
        const user = this.users.get(this.user);

        return await user.hasPermission(this.system_permission.level, this.system_permission.condition);
    }

    /**
     * Checks if a user is banned or not
     * @private
     */
    async _isUserBanned() {
        const user = this.users.get(this.user);

        return await user.isBanned();
    }

    /**
     * Used when a command was triggered through mention instead of a prefix.
     * This method will remove the bot's mention from the list of mentions if the bot was only mentioned once
     * this is done to prevent commands from getting "mention" interference.
     * @private
     */
    _removeBotMention() {
        if ((this.msgObj.content.match(new RegExp(`<@!?(${this._m.user.id})>`, 'g')) || []).length == 1) {
            this.msgObj.mentions.users.delete(this._m.user.id);
        }
    }
}