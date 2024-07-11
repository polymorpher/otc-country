// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IOTC {
    function feePercentage() external view returns (uint256);

    function revenueAccount() external view returns (address);
}
