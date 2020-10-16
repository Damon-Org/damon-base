import BaseCommand from '../../structures/commands/BaseCommand.js'

export default class Help extends BaseCommand {
    /**
     * @param {string} category
     * @param {Main} main
     */
    constructor(category, main) {
        super(main);

        this.register(Help, {
            category: category,

            name: 'help',
            aliases: [
                'h'
            ],
            description: 'Gives a link to a website where you can find all the information you need.',
            usage: 'help',
            params: [],
            example: 'help'
        });
    }

    /**
     * @param {String} command string representing what triggered the command
     */
    run(command) {
        const embed = new this.Discord.MessageEmbed()
            .setTitle('Need help?')
            .setDescription('Damon site with a list of commands: https://music.damon.sh/\nVisit me in my [Discord server](https://discord.gg/EG4zHFR)')
            .setColor('#32cd32')
            .setFooter('Powered by the 🔥 of the gods');

        this.send(embed);
    }
}
