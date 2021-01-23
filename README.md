# POC – Socket

## What

I started this project to understand more about Web Sockets ([socket.io](https://socket.io/)) and how to use them to build some multiplayer things.

The main goal was about having just one server used by many apps/games and I achieved this by using `rooms`. For each user that creates a new session, I create a new room with a unique `id` composed by a `name` and a `uuid`.

## Development

```sh
# start development server and demo
yarn dev

# build server and demo for production
yarn build

# run as production
yarn serve
```
