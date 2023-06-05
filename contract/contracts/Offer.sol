// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Offer {
    using SafeERC20 for IERC20;

    uint256 immutable public lockWithdrawAfter;
    uint256 immutable public commissionRate;
    uint256 immutable public closeAmount;

    address immutable public creator;
    address immutable public domainOwner;

    IERC20 immutable public srcAsset;
    IERC20 immutable public destAsset;

    mapping(address => bool) private withdrawPayments;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public withdrawLockedUntil;

    uint256 public totalDeposits;

    Status public status;

    enum ErrorType {
        InsufficientBalance,
        OfferNotOpen,
        OfferAccepted,
        OfferNotAccepted,
        NotCreator,
        NotDomainOwner,
        WithdrawLocked
    }

    enum Status {
        Open,
        Accepted,
        Closed
    }

    error OfferError(ErrorType errorNo);

    constructor(
        address creator_,
        address domainOwner_,
        address srcAsset_,
        address destAsset_,
        uint256 depositAmount_,
        uint256 closeAmount_,
        uint256 commissionRate_,
        uint256 lockWithdrawAfter_
    ) {
        closeAmount = closeAmount_;
        commissionRate = commissionRate_;
        lockWithdrawAfter = lockWithdrawAfter_;
        domainOwner = domainOwner_;
        creator = creator_;

        srcAsset = IERC20(srcAsset_);
        destAsset = IERC20(destAsset_);

        unchecked {
            deposits[creator_] += depositAmount_;
            totalDeposits = depositAmount_;
        }
    }

    function deposit(uint256 amount_) external {
        if (status != Status.Open) {
            revert OfferError(ErrorType.OfferNotOpen);
        }

        unchecked {
            deposits[msg.sender] += amount_;
            withdrawLockedUntil[msg.sender] = block.timestamp + lockWithdrawAfter;
            totalDeposits += amount_;
        }

        srcAsset.safeTransferFrom(msg.sender, address(this), amount_);
    }

    function withdraw(uint256 amount_, address receiver_) external {
        if (status == Status.Accepted) {
            revert OfferError(ErrorType.OfferAccepted);
        }

        if (deposits[msg.sender] < amount_) {
            revert OfferError(ErrorType.InsufficientBalance);
        }

        if (withdrawLockedUntil[msg.sender] < block.timestamp) {
            revert OfferError(ErrorType.WithdrawLocked);
        }

        unchecked {
            deposits[msg.sender] -= amount_;
            totalDeposits -= amount_;
        }

        srcAsset.safeTransferFrom(address(this), receiver_, amount_);
    }

    function close() external {
        if (status != Status.Open) {
            revert OfferError(ErrorType.OfferNotOpen);
        }

        if (msg.sender != creator) {
            revert OfferError(ErrorType.NotCreator);
        }

        status = Status.Closed;
    }

    function accept(address receiver_) external {
        if (status != Status.Open) {
            revert OfferError(ErrorType.OfferNotOpen);
        }

        status = Status.Accepted;

        destAsset.safeTransferFrom(msg.sender, address(this), closeAmount);
        srcAsset.safeTransfer(receiver_, totalDeposits);
    }

    function paymentBalanceForDomainOwner() public view returns (uint256) {
        if (withdrawPayments[msg.sender]) {
            return 0;
        }

        return totalDeposits * commissionRate / 100;
    }

    function paymentBalanceForDepositor() public view returns (uint256) {
        if (withdrawPayments[msg.sender]) {
            return 0;
        }

        uint256 depositAmount = deposits[msg.sender];

        return depositAmount - depositAmount * commissionRate / 100;
    }

    function withdrawPaymentForDomainOwner(address receiver_) external {
        if (status != Status.Accepted) {
            revert OfferError(ErrorType.OfferNotAccepted);
        }

        if (msg.sender != domainOwner) {
            revert OfferError(ErrorType.NotDomainOwner);
        }

        srcAsset.safeTransfer(receiver_, paymentBalanceForDomainOwner());

        withdrawPayments[msg.sender] = true;
    }

    function withdrawPaymentForDepositor(address receiver_) external {
        if (status != Status.Accepted) {
            revert OfferError(ErrorType.OfferNotAccepted);
        }

        destAsset.safeTransfer(receiver_, paymentBalanceForDepositor());

        withdrawPayments[msg.sender] = true;
    }
}
