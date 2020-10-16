# Damon Base

## Table Of Contents

- [Setup](#setup)
  - [Requirements](#requirements)
  - [Repository](#repository)
  - [Config](#config)
  - [Startup](#startup)

## Setup

### Requirements

 * Node.js v14.x or higher

### Repository

Make sure to add `--recurse-modules` behind the repository link so all submodules get pulled as well.

```sh
git clone https://github.com/Damon-Org/damon-base --recurse-modules
```

### Config

Before starting up the bot it's important to set the development key to true in [`data/config.js`](data/config.js)

```js
{
    development: true,

    // ...
}
```

### Startup

```sh
# Run npm i to install all of the node_modules
npm i

# afterwards you can just
node .
```

## Docker

Alternatively you can pull docker containers and run the bot from those or make containers locally.

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

### Running in Cloud

You can pull the containers from hub.docker.com and start these directly without having to build the source code locally.

```sh
docker pull yimura/damonmusic

docker run -d --init --name damon yimura/damonmusic
```
