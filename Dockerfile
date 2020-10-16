FROM node:14-buster

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY . .

ENTRYPOINT ["node", "."]
