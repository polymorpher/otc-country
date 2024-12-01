// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../externals/IDC.sol";

contract DomainContract is IDC {
    mapping(bytes32 => address) public ownerLookup;

    function makeCommitment(string memory /*name*/, address /*owner*/, bytes32 /*secret*/) external pure override returns (bytes32) {
        return keccak256(abi.encodePacked("commit"));
    }

    function commit(bytes32 commitment) external override {}

    /**
     * should be view, not pure, to be the same abi as
     * https://github.com/polymorpher/dot-country/blob/main/contracts/contracts/DC.sol#L101
     */
    function available(string memory name) public view returns (bool) {
        return bytes(name).length > 3 && ownerLookup[keccak256(abi.encodePacked(name))] == address(0);
    }

    function getPrice(string calldata /* name */) external pure override returns (uint256 price) {
        price = 54321;
    }

    function ownerOf(string calldata name) external view returns (address owner) {
        return ownerLookup[keccak256(abi.encodePacked(name))];
    }

    function register(string calldata name, address owner, bytes32 secret) external payable override {
        ownerLookup[keccak256(abi.encodePacked(name))] = owner;
    }
}
