// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../externals/IDC.sol";
import "../interfaces/IOfferFactory.sol";
import "../OTC.sol";

contract TestOTC is OTC {
    constructor(
        IDC domainContract_,
        IOfferFactory offerFactory_
    ) OTC(domainContract_, offerFactory_) {}

    function testOfferAddress(
        string calldata domainName_
    ) external view returns (address contractAddress) {
        contractAddress = offerFactory.getAddress(
            keccak256(abi.encodePacked(domainName_))
        );
    }
}
