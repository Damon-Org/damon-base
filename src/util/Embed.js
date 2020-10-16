import { MessageEmbed } from 'discord.js'

/**
 * @param {Message} msgObj Discord Message object
 * @param {Object} newProps JSON object of the properties to overwrite in the embed
 * @param {boolean} [edit=true] If the message should be directly edited with the new embed data
 */
export const editEmbed = (msgObj, newProps, edit = true) => {
    if (msgObj.deleted || msgObj.embeds.length == 0) return null;

    const embedData = msgObj.embeds[0].toJSON();

    Object.assign(embedData, newProps);

    const embed = new MessageEmbed(embedData);

    if (edit) msgObj.edit(embed)

    return embed;

};

export default {
    editEmbed
};
