#!/bin/zsh
export $(grep -v '^#' .env.script | xargs)
export USER=$(cast wallet address --private-key ${PRIVATE_KEY})

export SALT=$(chisel eval "keccak256(abi.encodePacked(\"${TEST_DOMAIN}\"))" | cut -d " " -f 3 | tail -n 1)
export OFFER_ADDRESS=$(cast call ${OFFER_FACTORY} "getAddress(bytes32)(address)" ${SALT})

echo OFFER_ADDRESS=${OFFER_ADDRESS}
echo SALT=${SALT}
echo USER=${USER}

# type(uint256).max
cast send ${TOKEN_A} "approve(address,uint256)" ${OFFER_ADDRESS} "115792089237316195423570985008687907853269984665640564039457584007913129639935" --private-key ${PRIVATE_KEY} --legacy


#    function createOffer(
#        string calldata domainName_,
#        bytes32 secret_,
#        address domainOwner_,
#        address srcAsset_,
#        address destAsset_,
#        uint256 depositAmount_,
#        uint256 acceptAmount_,
#        uint256 commissionRate_,
#        uint256 lockWithdrawDuration_
#    ) external payable whenNotPaused {

export PRICE=$(cast call ${DOMAIN_CONTRACT} "getPrice(string)(uint256)" ${TEST_DOMAIN} | cut -d " " -f 1)
#
echo PRICE=${PRICE}

cast send ${OTC} "createOffer(string,bytes32,address,address,address,uint256,uint256,uint256,uint256)" \
  ${TEST_DOMAIN} 0x0000000000000000000000000000000000000000000000000000000000000000 ${USER} ${TOKEN_A} ${TOKEN_B} 1500000000000000000 3000000000000000000 100 3600 \
  --value ${PRICE} \
  --private-key ${PRIVATE_KEY} \
  --legacy


