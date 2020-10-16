import BaseCommand from '../../structures/commands/BaseCommand.js';

/**
 * @category Commands
 * @extends BaseCommand
 */
export default class Ping extends BaseCommand {
    /**
     * @param {string} category
     * @param {Main} main
     */
    constructor(category, main) {
        super(main);

        this.register(Ping, {
            category: category,

            name: 'ping',
            aliases: [
                'pong'
            ],
            description: 'Shows ping to Discord, response time and reply time.',
            usage: 'ping',
            params: [],
            example: 'ping'
        });
    }

    /**
     * @param {string} command string representing what triggered the command
     */
    async run(command) {
        const
            ping = new Date().getTime() - this.msgObj.createdTimestamp,
            botPing = Math.round(this._m.ws.ping);

        this.send('`Pinging...`').then(msg => {
            const embed = new this.Discord.MessageEmbed()
                .setTitle('Pong! 🏓')
                .addField('Ping to Discord', `${botPing}ms`)
                .addField('Response time', `${ping}ms`)
                .addField('Reply time', `${msg.createdTimestamp - this.msgObj.createdTimestamp}ms`)
                .setColor('#252422');
            msg.edit('', embed);
        });

        return true;
    }
}
