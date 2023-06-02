// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IDC {
    function getPrice(string memory name) external view returns (uint256);

    function register(string calldata name, address owner, bytes32 secret) external payable;
}
