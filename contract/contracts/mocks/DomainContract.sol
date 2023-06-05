// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../externals/IDC.sol";

contract DomainContract is IDC {
    function makeCommitment(
        string memory /*name*/,
        address /*owner*/,
        bytes32 /*secret*/
    ) external pure override returns (bytes32) {
        return keccak256(abi.encodePacked("commit"));
    }

    function commit(bytes32 commitment) external override {}

    function getPrice(
        string calldata /* name */
    ) external pure override returns (uint256 price) {
        price = 1;
    }

    function register(
        string calldata name,
        address owner,
        bytes32 secret
    ) external payable override {}
}
