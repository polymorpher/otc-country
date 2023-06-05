// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDC.sol";
import "./Offer.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract OTC is Ownable {
    using SafeERC20 for IERC20;

    mapping(address => bool) public assets;

    IDC immutable public domainContract;

    enum ErrorType {
        ZeroAddress,
        SourceAssetUnregistered,
        DestAssetUnregistered,
        CommissionRateBeyondLimit,
        AssetAlreadyAdded,
        AssetAlreadyRemoved
    }

    error OTCError(ErrorType errorNo);

    constructor(IDC domainContract_) Ownable() {
        if (address(domainContract_) == address(0)) {
            revert OTCError(ErrorType.ZeroAddress);
        }

        domainContract = domainContract_;
    }

    function addAsset(address asset) external onlyOwner {
        if (assets[asset]) {
            revert OTCError(ErrorType.AssetAlreadyAdded);
        }

        assets[asset] = true;
    }

    function removeAsset(address asset) external onlyOwner {
        if (!assets[asset]) {
            revert OTCError(ErrorType.AssetAlreadyRemoved);
        }

        assets[asset] = false;
    }

    function createOffer(
        string calldata domainName_,
        bytes32 secret_,
        address domainOwner_,
        address srcAsset_,
        address destAsset_,
        uint256 depositAmount_,
        uint256 closeAmount_,
        uint256 commissionRate_,
        uint256 lockWithdrawAfter_
    ) external payable {
        if (!assets[srcAsset_]) {
            revert OTCError(ErrorType.SourceAssetUnregistered);
        }

        if (!assets[destAsset_]) {
            revert OTCError(ErrorType.DestAssetUnregistered);
        }

        if (commissionRate_ > 100) {
            revert OTCError(ErrorType.CommissionRateBeyondLimit);
        }

        uint256 price = domainContract.getPrice(domainName_);
        bytes32 commitment = domainContract.makeCommitment(domainName_, domainOwner_, secret_);

        domainContract.commit(commitment);
        domainContract.register{ value: price }(domainName_, domainOwner_, secret_);

        address offer = address(new Offer(
            msg.sender,
            domainOwner_,
            srcAsset_,
            destAsset_,
            depositAmount_,
            closeAmount_,
            commissionRate_,
            lockWithdrawAfter_
        ));

        IERC20(srcAsset_).safeTransferFrom(msg.sender, offer, depositAmount_);
    }
}
