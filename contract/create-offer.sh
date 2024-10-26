#!/bin/zsh
export $(grep -v '^#' .env | xargs)

export TOKEN_A="0xb19b36b1456E65E3A6D514D3F715f204BD59f431"
export TOKEN_B="0x8ce361602B935680E8DeC218b820ff5056BeB7af"
export OTC_FACTORY="0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35"
export OTC="0xA15BB66138824a1c7167f5E85b957d04Dd34E468"
export USER=$(cast wallet address --private-key ${PRIVATE_KEY})
export TEST_DOMAIN="testotc"

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

cast send ${OTC} "createOffer(string,bytes32,address,address,address,uint256,uint256,uint256,uint256)" \
  ${TEST_DOMAIN} 0x0000000000000000000000000000000000000000000000000000000000000000 ${USER} ${TOKEN_A} ${TOKEN_B} 1500000000000000000 3000000000000000000 100 3600 \
  --value ${PRICE} \
  --private-key ${PRIVATE_KEY}
