# Documentation

## Table Of Contents

 - [Introduction](#introduction)
 - [Classes](#classes)
 - [Commands](#commands)
   - [Command Properties](#command-properties)
   - [Command Example](#command-example)
     - [Command#constructor()](#commandconstructor)
     - [Command#run()](#commandrun)
 - [Modules](#modules)
   - [When to use?](#when-to-use)
   - [Module Properties](#module-properties)
   - [Module Example](#module-example)
     - [Module#constructor()](#moduleconstructor)
     - [Module#init()](#moduleinit)
   - [Module Parents](#module-parents)
   - [Module Scopes](#module-scopes)

## Introduction

Damon's Base is made by nature to be functional, allow for easy and broad extension without worrying to much about existing code. Everything is dynamically loaded, this includes commands and modules. You can just drop in new commands and modules and guarantee that you can use these near instantly.

## Classes

You can find in-depth documentation of all the classes in Damon's Base [here](docs/CLASSES.md).

## Commands

Commands reside under `src/commands/`, in this directory you organize your commands by categories that are easy for you and others to understand. Command properties and aliases will be generated in handily available `data/commands.json` file, you can use these for your website or any other application that you use to generate a user interface with for users.

### Command Properties

Each command has properties to define what the command triggers, aliases for the command, the description, which permissions are needed by the bot or user to execute the command properly...

Let's take a look at an example command properties:
```js
{
    // If the command can only be ran in guilds
    guild_only: true,

    // The string that should trigger this command
    name: 'set prefix',
    // Aliases are an array of strings that can alternatively be used to trigger the command
    aliases: [
        'setprefix',
        'changeprefix'
    ],
    // "example/description/usage" are properties that're optional
    // for it to work but these will be included in commands.json (for your website, ...)
    example: 'changeprefix b?',
    description: 'Change the bot its prefix in your server.',
    usage: 'setprefix <new-prefix>',
    // Damon's Base will do some basic parameter checks to see if a user
    // has given enough parameters for the command to be executed
    params: [
        {
            name: 'new-prefix',
            description: 'Changes the prefix to which Damon Music listens on in your server.',
            type: 'string',
            default: 'Resets the the custom prefix if one was set.'
        }
    ],
    // Permissions are those which are required for the command to be executed by the user
    // https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    permissions: {
        logic: 'OR',
        levels: [
            {
                type: 'server',
                name: 'MANAGE_CHANNELS'
            }
        ]
    }
}
```
We'll go more in-depth later which options you can provide additionally.

### Command Example

Every command is a class, which extends at the least the BaseCommand class, this class provides basic functionality as checking the permissions of the bot/user, if enough arguments have been provided, etc...

You can find more example commands under `src/commands/informative/`.
```js
import BaseCommand from '/src/structures/commands/BaseCommand.js';

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
        const ping = new Date().getTime() - this.msgObj.createdTimestamp;
        const botPing = Math.round(this._m.ws.ping);

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
```
Let's take a look at how this command is build up.

#### Command#constructor()

In the constructor of our command we set to what our command will listen to
```js
constructor(category, main) {
    // Setup our parent class by calling super
    super(main);

    // BaseCommand#register makes sure our Command is properly setup and contains
    // the properties defined in the second argument,
    // during command execution you can always check against the name of
    // the command through this.name or any of the other properties.
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
```

#### Command#run()

Within this method we set what our command should do when it gets triggered by a user.
```js
/**
 * @param {string} command string representing what triggered the command
 */
async run(command) {
    const ping = new Date().getTime() - this.msgObj.createdTimestamp;
    const botPing = Math.round(this._m.ws.ping);

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
```

## Modules

This is what makes this great but also somewhat complicated. Modules allow for infinite expandability and have a lot in common with how Commands work/structured. They allow you to add more complex code than what commands can do.

We'll go over how Modules are structured and afterwards over which different kind of modules exist.

You can find modules under the `src/modules/` directory, Damon's base only needs 2 modules to function, but you can add infinitely more.

### When to use?

 - Globally accesible
 - Can be permanently active whereas command are run once many times
 - Need to execute some code from a central spot

### Module Properties

As shown before, modules are fairly similarly structured as commands. You set to which events this module listens, what method should be called to handle these events, what other modules this module requires to function properly, etc...
```js
{
    // Name when accessing the module globally
    name: 'serverSettings',
    // Scopes are used whenever a module extends a specific target,
    // this target can be a user or a server/guild.
    // We'll see how to use this specific case later on.
    scope: {
        // Group name which this module is part of 
        group: 'server',
        // The name of this module when accessing it from within a server's scope
        name: 'settings'
    },
    // An array of module names (string) which this module requires to function properly
    requires: [
        'eventExtender'
    ],
    // The events this module listens to
    events: [
        {
            // If the mod key is not provided this will be the event of the Discord Client
            // https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-channelCreate
            name: 'ready',
            // The name of the function/method of this module to call
            call: '_onReady'
        },
        {
            // If the mod key is define this means this module listens
            // for events from the module that's called "eventExtender"
            mod: 'eventExtender',
            name: 'voiceJoin',
            call: '_voiceJoin'
        }
    ]
}
```

### Module Example

In the below example is a simple module that's meant to update the bots presence every 15 seconds. There's no code provided as the original module is too to put here as an example. You can find this module [here](https://github.com/Damon-Org/Presence) if you're interested in seeing a finished example.
```js
import BaseModule from './structures/BaseModule.js'

export default class Presence extends BaseModule {
    /**
     * @param {Main} main
     */
    constructor(main) {
        super(main);

        this.register(Presence, {
            name: 'presence',
            events: [
                {
                    name: 'ready',
                    call: '_startInterval'
                }
            ]
        });
    }

    _startInterval() {
        // Update presence on some interval

        setTimeout(this._startInterval.bind(this), 15e3);
    }

    init() {
        // Do something once when the module is setup

        return true;
    }
}
```

#### Module#constructor()

In the constructor of your module you can do some setup that's require for your module to work, be aware that some modules might not be loaded at this point, therefor it's safer to access modules after [Module#init()](#moduleinit)

#### Module#init()

At this point all module instances have been created, their respective classes have been setup but this doesn't mean all their init functions have been called yet. This method is optional and you can completely leave it out of your code, there's no need to define an empty method called init that returns true.

It's important that if you use this init method that your return true if your module successfully setup, if it failed make sure to return false, this will halt the bot from starting up and kill its process.

### Module Parents

You can define a parent class that extends the functionality of **BaseModule** or completely overwrite what exists of BaseModule, I suggest copying the code from BaseModule if you can't extend from BaseModule.
If your module needs to emit events you can make a **Base** from which modules extend from so they inherit the functionality the EventEmitter class provides.
If you want to have common shared methods between different modules you can make a parent module that extends **BaseModule**.

### Module Scopes

Modules can exist within a specific scope, meaning that they can extend functionaliy of a specific class/target. These modules will be cloned and initialized for each instance of this class/target and provide functionality specific to this instance. This is sometimes needed if you need code to run only for one specific guild instead of globally. Take for example the [ServerSetting](https://github.com/Damon-Org/ServerSetting) module, this module has methods that are only usable from within a guild and methods that are only usable globally. This can be very confusing at first and I'll try and make a diagram how these differ from each other.

```
(Global Scope)

Main
    => ModuleManager#load()
        => ServerSetting#constructor
         ... #init()
         ... events mapped

(Server Scope)

CommandHandler
    => MessageEvent
        => this.servers.get(guildId)
         ... creates a new Server() instance or returns an existing one
            => Server#constructor()
             ... #initScope()
             ... clone all modules from the server scope into the new Server instance
                => ServerSetting#constructor
```

These two instance are totally different and do not share any of the methods with each other, you can still call global methods from these modules from within a scoped instance and these should behave about the same but discouraged. When calling scoped methods from the global module you'll produce errors and potentially crash your bot, this is because at the global scope the server instance is undefined.

**Important**
```
Modules initiated within a scope will not listen to the events set by their properties,
this is to prevent memory leaks and massive event stacksizes.
```