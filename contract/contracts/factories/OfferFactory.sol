// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Create2.sol";
import "../interfaces/IOfferFactory.sol";
import "../Offer.sol";

contract OfferFactory is IOfferFactory {
    /**
     * @notice Deploy a new Offer contract using create2
     * @param salt_ salt
     */
    function deploy(bytes32 salt_) external returns (address addr) {
        addr = Create2.deploy(0, salt_, type(Offer).creationCode);
    }
}
