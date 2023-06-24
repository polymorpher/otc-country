// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IOfferFactory {
    function deploy(bytes32 salt) external returns (address addr);

    function getAddress(bytes32 salt) external view returns (address addr);
}
