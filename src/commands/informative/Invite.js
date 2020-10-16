import BaseCommand from '../../structures/commands/BaseCommand.js'

export default class Invite extends BaseCommand {
    /**
     * @param {string} category
     * @param {Main} main
     */
    constructor(category, main) {
        super(main);

        this.register(Invite, {
            category: category,

            name: 'invite',
            aliases: [
                'inv'
            ],
            description: 'Invite Damon to your Discord server.',
            usage: 'invite',
            params: [],
            example: 'invite'
        });
    }

    /**
     * @param {string} command string representing what triggered the command
     */
    run(command) {
        const
            embed = new this.Discord.MessageEmbed()
            .setAuthor(`Made by ${this._m.config.creator}`)
            .setDescription(`Click [here](https://discordapp.com/oauth2/authorize?&client_id=${this._m.user.id}&scope=bot&permissions=${this._m.config.permission_bit}) to invite`)
            .setColor('#dd0a35')
            .setFooter('Powered by the 🔥 of the gods');

        this.send(embed);
    }
}
