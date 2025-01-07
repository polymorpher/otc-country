#!/bin/zsh
export $(grep -v '^#' .env.script | xargs)
export $(grep -v '^#' .env.assets | xargs)

cast send ${OTC} "addAsset(address)" ${D_1USDC} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_1ETH} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_1WBTC} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_1USDT} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_1DAI} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_BUSD} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_1WETH} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_BSCBNB} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_BSCBUSD} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${D_1FRAX} --private-key ${ADMIN_PRIVATE_KEY} --legacy

cast send ${OTC} "addAsset(address)" ${P_WONE} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${P_1USDC} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${P_1ETH} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${P_1WBTC} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${P_1MATIC} --private-key ${ADMIN_PRIVATE_KEY} --legacy
cast send ${OTC} "addAsset(address)" ${P_1USDT} --private-key ${ADMIN_PRIVATE_KEY} --legacy

