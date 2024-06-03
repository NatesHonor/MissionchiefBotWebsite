#!/bin/bash
if command -v nodemon &> /dev/null; then
    echo "nodemon is installed. Starting the server..."
    nodemon start
else
    echo "nodemon is not installed. Starting the server with node..."
    node server.js
fi
