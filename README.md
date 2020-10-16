# Damon Base

## Table Of Contents

- [Setup](#setup)
  - [Requirements](#requirements)
  - [Repository](#repository)
  - [Configuration](#configuration)
    - [auth.js](#authjs)
    - [config.js](#configjs)
  - [Running it](#running-it)
- [Docker](#docker)
  - [Local Development](#local-development)

## Setup

### Requirements

 * Node.js v14.x or higher

### Repository

Make sure to add `--recurse-modules` behind the repository link so all submodules get pulled as well.

```sh
git clone https://github.com/Damon-Org/damon-base --recurse-submodules
```

### Configuration

All of these files reside under the [`data/`](data/) directory.

#### auth.js

By default this file does not exist, create this file yourself.

In the `data/` directory you'll find an example auth file, copy and paste the contents of this file into auth.js (create this file if it doesn't exists).

File contents:
```js
export default {
    token: {
        prod: '',
        dev: '<put your development bot token here/if you only use one bot put your production token here as well>'
    }
}
```

#### config.js

In the step above this we set our development and production bot tokens, in this [file](data/config.js) we set when to use which.

If development is set to true the bot will use `token.dev` otherwise it will take `token.prod`.

```js
{
    development: true,

    // ...
}
```

### Running it

```sh
# Run npm i to install all of the node_modules
npm i

# afterwards you can just
node .
```

## Docker

Alternatively you can develop and build containers locally.

### Local Development

When developing locally you might not want to install Node.js onto your system, for this you can build a container every time you make changes.

Copy the following command from in the package.json file (since you don't have Node/NPM you can't run these commands from the package file).
```sh
# Build a container from the current directory
docker build --tag damonmusic:test_build .

# Remove the old container
docker rm damon -f

# Start the container in the current command line, alternatively you can pass the -d flag to run it detached from your current shell
docker run --init --name damon damonmusic:test_build
```
