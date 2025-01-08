#!/bin/zsh

npx hardhat deploy --network anvil --reset
sleep 0.5s
./setup-anvil.sh
sleep 0.5s
./create-offer.sh
sleep 0.5s
./mint-token.sh