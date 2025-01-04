#!/bin/zsh

set -x

export $(grep -v '^#' .env.script | xargs)

export USER=$(cast wallet address --private-key ${PRIVATE_KEY})

cast nonce ${DEPLOYER_ADDRESS}
#npx hardhat deploy --network anvil --reset

cast send ${TOKEN_A} "mint(address,uint256)" ${USER} 12000000000000000000 --private-key ${PRIVATE_KEY} --legacy

cast send ${OTC} "addAsset(address)" ${TOKEN_A} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${TOKEN_B} --private-key ${ADMIN_PRIVATE_KEY} --legacy

