export const addGuild = async (connPool, guildId) => {
    const [rows] = await connPool.query('SELECT guild_id FROM core_guilds WHERE serverId=?', guild_id);

    if (rows.length == 0) {
        await connPool.query(`INSERT INTO core_guilds (serverId) VALUES (?)`, guild_id);
    }
};

export default {
    addGuild
};
