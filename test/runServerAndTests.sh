#!/bin/bash

shopt -s expand_aliases
alias run_hardhat_node='node ./test/utils/runTestNode.js'
alias run_cache_server='node ./src/cache-server.js'
alias run_cache_updater='node ./src/cache-updater.js'
alias run_tests='npx mocha'

export WTF_USE_TEST_CONTRACT_ADDRESSES=true

run_hardhat_node &
hardhat_node_pid=$!;
sleep 5;
run_cache_server & 
cache_server_pid=$!;
run_cache_updater &
cache_updater_pid=$!;
run_tests;
tests_pid=$!;

kill -9 $cache_server_pid;
kill -9 $cache_updater_pid;
kill -9 $hardhat_node_pid;

# trap 'kill $(jobs -p); echo "Killed all subprocesses"' EXIT
