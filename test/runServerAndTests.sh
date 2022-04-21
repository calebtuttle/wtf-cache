#!/bin/bash

shopt -s expand_aliases
alias run_server='bash ./src/server.sh'
alias run_tests='npx mocha'

run_server & run_tests

kill -9 $(lsof -i :3000 -t)
