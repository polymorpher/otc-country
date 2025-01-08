#!/bin/zsh

set -x

export $(grep -v '^#' .env.script | xargs)
export $(grep -v '^#' .env.mint | xargs)

cast send ${TOKEN_A} "mint(address,uint256)" ${TARGET_USER} 12000000000000000000 --private-key ${PRIVATE_KEY} --legacy
cast send ${TOKEN_B} "mint(address,uint256)" ${TARGET_USER} 12000000000000000000 --private-key ${PRIVATE_KEY} --legacy

cast send ${TARGET_USER} --private-key ${PRIVATE_KEY} --value 1ether --legacy