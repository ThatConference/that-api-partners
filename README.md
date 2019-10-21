# template-graph-server

## Dependencies

- Node `10.15.0`

## Setup and Configuration

- Install node.js v10.15.0 - `nodenv install 10.15.0`

setup notes:

- we use nodenv to manage node.js - https://github.com/nodenv/nodenv

## .env

You will need to add a `.env` file to your source. See the .env.sample included in the source base for the keys.

## Running

The main development starting point is `npm run start:watch`

- `npm run start:watch` to run with a watcher.
- `npm run start` to just run`.

## Endpoints

- Endpoint: http://localhost:8001/ or http://localhost:8001/graphql
