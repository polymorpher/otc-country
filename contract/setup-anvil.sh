#!/bin/zsh

set -x

export $(grep -v '^#' .env | xargs)

export TOKEN_A="0xb19b36b1456E65E3A6D514D3F715f204BD59f431"
export TOKEN_B="0x8ce361602B935680E8DeC218b820ff5056BeB7af"
export OTC_FACTORY="0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35"
export OTC="0xA15BB66138824a1c7167f5E85b957d04Dd34E468"
export USER=$(cast wallet address --private-key ${PRIVATE_KEY})
export TEST_DOMAIN="testotc"

cast nonce 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
npx hardhat deploy --network anvil --reset

cast send ${TOKEN_A} "mint(address,uint256)" ${USER} 12000000000000000000 --private-key ${PRIVATE_KEY}

cast send ${OTC} "addAsset(address)" ${TOKEN_A} --private-key ${ADMIN_PRIVATE_KEY}
cast send ${OTC} "addAsset(address)" ${TOKEN_B} --private-key ${ADMIN_PRIVATE_KEY}

