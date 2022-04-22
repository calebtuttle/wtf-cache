#!/bin/bash

shopt -s expand_aliases
alias run_server='bash ./src/server.sh'
alias run_hardhat_node='node ./test/utils/runTestNode.js'
alias run_tests='npx mocha'

export WTF_USE_TEST_CONTRACT_ADDRESSES=true

run_hardhat_node &
sleep 5;
printf '\n';
run_server &
sleep 1;
run_tests;

sleep 7

kill -9 $(lsof -i :3000 -t)
kill -9 $(lsof -i :8545 -t)
