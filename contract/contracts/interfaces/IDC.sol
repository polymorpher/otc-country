// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IDC {
    function makeCommitment(string memory name, address owner, bytes32 secret) external view returns (bytes32);

    function commit(bytes32 commitment) external;

    function getPrice(string memory name) external view returns (uint256);

    function register(string calldata name, address owner, bytes32 secret) external payable;
}
