// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./IOTC.sol";

interface IOffer {
    function initialize(
        IOTC otc,
        string calldata domainName,
        address creator,
        address domainOwner,
        address srcAsset,
        address destAsset,
        uint256 depositAmount,
        uint256 closeAmount,
        uint256 commissionRate,
        uint256 lockWithdrawAfter
    ) external;
}
