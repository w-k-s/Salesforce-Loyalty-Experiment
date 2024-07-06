#!/bin/sh

echo "Installing Knex";

npm install knex -g;

echo "Running Migrations";

knex --esm --knexfile knexfile.js migrate:latest;

echo "Starting";
npm start;