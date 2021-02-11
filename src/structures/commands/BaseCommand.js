import Discord from 'discord.js'

export default class BaseCommand extends Map {
    /**
     * The raw data of the command
     * @type {Object}
     */
    raw = {};

    constructor(main) {
        super();

        this._m = main;
    }

    get Discord() {
        return Discord;
    }

    get globalStorage() {
        return this._m.globalStorage;
    }

    get guild() {
        return this.msgObj.guild;
    }

    get log() {
        return this._m.log;
    }

    get modules() {
        return this._m.modules;
    }

    get msgObj() {
        return this._msg;
    }

    get serverMember() {
        return this.msgObj?.member;
    }

    get server() {
        return this.servers.get(this.msgObj.guild);
    }

    get servers() {
        return this._m.servers;
    }

    get textChannel() {
        return this.msgObj.channel;
    }

    get user() {
        return this.users.get(this.msgObj.author);
    }

    get users() {
        return this._m.userManager;
    }

    get voiceChannel() {
        return this.serverMember?.voice.channel;
    }
/**
 * Shorthand helpers
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
            const embed = new Discord.MessageEmbed()
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
 * Required for normal operation of commands
 */
    /**
     * Merge Object into one
     * @param  {...any} args 
     */
    assign(...args) {
        return Object.assign(...args);
    }

    /**
     * Clone the command instance so the command runs in its own space.
     */
    clone() {
        return new this._self(this.category, this._m);
    }

    /**
     * 
     * @param {Message} msgObj 
     * @param {Array<string>} args 
     * @param {string} command 
     * @param {boolean} mentioned 
     */
    async exec(msgObj, args, command, mentioned) {
        if (mentioned) this._removeBotMention();

        this._msg = msgObj;
        this._parseArguments(args);
        if (!this._checkArguments()) return false;

        if (!await this._canCommandRunInChannel(command)) return false;
        if (!await this._hasPermissions()) return false;
        if (!this._hasSelfPermissions()) return false;

        // The command itself wants to do some kind of validation before going further
        if (typeof this.validate === 'function' && !this.validate(msgObj.author, args)) return false;

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
     * @param {Class} instance The command instance registering itself
     * @param {Object} object The constraint data of the command
     * @param {boolean} [init = true] If this register is called from the parent class
     */
    register(instance, object, init = true) {
        if (typeof object !== 'object') throw new Error('Invalid self assignment, expected object but got different type instead.');

        this.assign(this, object);

        if (!init) return this.assign(this.raw, object);

        this._self = instance;

        delete object.category;
        this.raw = object;
    }

    /**
     * This function will
     * @param {string} title The title of the argument embed
     * @param {number} index The index at which the check failed
     */
    _argumentValidationError(title, index = null) {
        const embed = new Discord.MessageEmbed();
        embed.setTitle(this.name);
        embed.setAuthor(title);
        let description = this.description;

        this.params.forEach((param, index) => {
            description += `\`\`\`cpp\n[${index + 1}] <${param.type}> "${param.description}"\n${param.required ? '#required' : 'defaults: '}${param.default ?  param.default : ''}\`\`\``;
        });

        embed.setDescription(description);

        this.send(embed);

        return false;
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
     * @private
     */
    _checkArguments() {
        if (this.args.length > this.params.length) return this._argumentValidationError('Too many arguments.');

        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            const param = this.params[i];

            if (param.required && !arg) {
                return this._argumentValidationError('Missing arguments', i);
            }
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

        for (const level of this.permissions.levels) {
            const type = level.type.toUpperCase().trim();

            switch (type) {
                case "SERVER":
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
                    break;
            
                case "ROLE":
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
                    break;

                case "COMMAND_HANDLED":
                    if (typeof this.permission === 'function' && !await this.permission()) {
                        result = false;
    
                        continue;
                    }
    
                    if (or) return true;
                    break;

                default:
                    this.log.error('CMD', `Command '${this.name}' permissions incorrectly configured, unknown type: ${level.type}`);

                    this.send('This command has incorrectly configured permissions, contact the developer if this problem keeps occuring.');

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
     * Parses all the arguments
     * @private
     * @param {Array<string>} args 
     */
    _parseArguments(args) {
        this.args = [];

        this.params.forEach((param, index) => {
            const arg = args[index];
            let argument = null;

            switch (param.type) {
                case 'channel':
                    argument =  this._msg.mentions.channels.get(arg);
                    if (!argument) argument = null;

                    break;
                case 'member':
                    argument =  this._msg.mentions.members.get(arg);
                    if (!argument) argument = null;

                    break;
                case 'everyone':
                    argument =  this._msg.mentions.everyone;

                    break;
                case 'float':
                    argument = isNaN(arg) ? null : parseFloat(arg);

                    break;
                case 'int':
                    argument = isNaN(arg) ? null : parseInt(arg);

                    break;
                case 'role':
                    argument =  this._msg.mentions.roles.get(arg);
                    if (!argument) argument = null;

                    break;
                case 'string':
                    if (param.is_sentence) {
                        argument = args.slice(index)

                        break;
                    }
                    argument = arg;
                    
                    break;
                case 'user':
                    argument =  this._msg.mentions.users.get(arg);
                    if (!argument) argument = null;

                    break;
            }

            this.set(param.name, argument);
            this.args.push(argument);
        });
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