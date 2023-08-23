# NodeJS Server with TypeScript

## Introduction
This repository contains a NodeJS server written in TypeScript. The server can be run in development mode using nodemon or built and run in production mode. You can use either yarn or npm to install dependencies and run scripts.

## Prerequisites
- NodeJS and npm (or yarn) must be installed on your system.
- Typescript must be installed globally using the command `npm install -g typescript` (or `yarn global add typescript`).

## Cloning the repository
1. Open your terminal and navigate to the directory where you want to clone the repository.
2. Clone the repository using the command `git clone https://github.com/<username>/<repo-name>.git`.

## Running the server
1. Navigate to the repository directory using the command `cd <repo-name>`.
2. Install the required dependencies using the command `npm install` (or `yarn`).
3. Set up the `.env` file with the required environment variables.
4. Run the server in the following ways:
   - Development mode: `npm run dev` (or `yarn dev`)
   - Build and run in production mode: `npm run build` (or `yarn build`) followed by `npm run start` (or `yarn start`)

## Scripts
The following scripts are available in the `package.json` file:
- `dev`: Starts the server in development mode using nodemon.
- `build`: Compiles the TypeScript code into JavaScript.
- `start`: Starts the server in production mode using the built JavaScript code.

## Note
Don't forget to set up the `.env` file with the required environment variables before running the server.
