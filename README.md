# Damon Base

## Table Of Contents

 - [Getting Started](#getting-started)
   - [Requirements](#requirements)
   - [Getting the base](#getting-the-base)
   - [Config](#config)
   - [Setup](#setup)
   - [Running](#running)
 - [Documentation](#documentation)

## Getting Started

### Requirements

  - Git
  - NodeJS v14+

### Getting the base

Use the below command to clone the repo locally.
```sh
git clone https://github.com/Damon-Org/damons-base.git --recurse-submodules
```
Don't forget to add `--recurse-submodules`, if you did forget then you must use the below command to setup submodules properly.
```sh
git submodule update --init
```

### Config

Create an application on [Discord Developer Application](https://discord.com/developers/applications), enable bot account and copy your bot token in auth.js file.
If the file doesn't exist yet, create one from the example auth.example.js.
```js
export default {
    token: {
        prod: '<fill in your token here>',
        dev: '<if you have a seperate token for development put it here>'
    }
}
```

### Setup

Before being able to run the bot you still have to install the required modules, if you have NodeJS installed as mentioned in the requirements above you should be able to do:

```sh
npm install
```

### Running

If everything went well you should be able to just do:
```sh
node .
```
and see the following output
```
[SHARD_MANAGER] Shard 1/1 is starting...
[18:22:14] [COMMANDS/INFO] Mapping of commands done with 4 unique commands registered, 4 aliases registered.
[18:22:14] [COMMANDS/INFO] Generated new "data/commands.json" with the mapped commands.
```

If you don't see any output other than `Shard 1/1 is starting...` then you failed to clone submodules correctly, run the following command `git submodule update --init` and see if it works.

## Documentation

For an in-depth documentation for how to use this base, continue reading [here](docs/README.md).