import { ShardingManager } from 'discord.js'
import auth from './data/auth.js'
import config from './data/config.js'
import fs from 'fs'

const shardManager = new ShardingManager(`${process.cwd()}/src/Main.js`, {
    token: config.development ? auth.token.dev : auth.token.prod,
    respawn: !config.development,
    shardArgs: [
        JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`)).version
    ]
});

shardManager.spawn();

shardManager.on('shardCreate', shard => console.log(`[SHARD_MANAGER] Shard ${shard.id + 1}/${shardManager.totalShards} is starting...`));

const shutdown = async () => {
    process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
