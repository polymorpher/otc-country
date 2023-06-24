// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library Config {
    /**
     * @notice commission rate scale
     *         i.e. 1e5 means 100000 means 100%, 75000 means 75% and 0 means 0%
     */
    uint256 constant COMMISSION_RATE_SCALE = 1e5;
}
