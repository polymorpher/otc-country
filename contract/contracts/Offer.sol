// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./libraries/Config.sol";
import "./interfaces/IOffer.sol";

contract Offer is Initializable, IOffer {
    using SafeERC20 for IERC20;

    /// @notice depositors cannot withdraw their depositions before the time is passed by this value
    uint256 public lockWithdrawAfter;

    /// @notice fee of commssion rate in destination asset is sent to the domain owner when the offer is accepted
    uint256 public commissionRate;

    /// @notice destination asset amount at which the offer will be closed
    uint256 public closeAmount;

    /// @notice offer creator address
    address public creator;

    /// @notice domain owner address
    address public domainOwner;

    /// @notice source asset address
    IERC20 public srcAsset;

    /// @notice destination asset address
    IERC20 public destAsset;

    /// @notice mapping from user address to boolean value to represent if the payment has been withdrawn to the user (depositor or domain owner)
    mapping(address => bool) private withdrawPayments;

    /// @notice mapping from depositor address to amount value in source asset
    mapping(address => uint256) public deposits;

    /// @notice mapping from depositor address to when they can withdraw their funds
    mapping(address => uint256) public withdrawLockedUntil;

    /// @notice total amount of funds deposited in source asset
    uint256 public totalDeposits;

    /// @notice offer status
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

    event AssetDeposited(address indexed depositor, uint256 amount);

    event AssetWithdrawn(address indexed withdrawer, uint256 amount);

    event OfferClosed(address indexed creator);

    event OfferAccepted(address indexed acceptor);

    event PaymentWithdrawn(address indexed payee, uint256 amount);

    /**
     * @notice Initializes the offer and sets deposition value for the creator
     * @param creator_ address of the offer creator
     * @param domainOwner_ address of user that the domain will belongs to
     * @param srcAsset_ source asset address
     * @param destAsset_ destination asset address
     * @param depositAmount_ source asset deposit amount of the offer creator
     * @param closeAmount_ destination asset amount at which the offer will be closed
     * @param commissionRate_ commission rate at which the fee in destination asset is sent to the domain owner when the offer is accepted
     * @param lockWithdrawAfter_ depositors cannot withdraw until the time is passed by this value after the deposition time
     */
    function initialize(
        address creator_,
        address domainOwner_,
        address srcAsset_,
        address destAsset_,
        uint256 depositAmount_,
        uint256 closeAmount_,
        uint256 commissionRate_,
        uint256 lockWithdrawAfter_
    ) external override initializer {
        closeAmount = closeAmount_;
        commissionRate = commissionRate_;
        lockWithdrawAfter = lockWithdrawAfter_;
        domainOwner = domainOwner_;
        creator = creator_;

        srcAsset = IERC20(srcAsset_);
        destAsset = IERC20(destAsset_);

        _deposit(depositAmount_, creator_);
    }

    /**
     * @notice deposit token which is used internally
     * @param amount_ amount of source asset to deposit
     * @param depositor_ depositor address
     */
    function _deposit(uint256 amount_, address depositor_) internal {
        unchecked {
            deposits[depositor_] += amount_;
            withdrawLockedUntil[depositor_] =
                block.timestamp +
                lockWithdrawAfter;
            totalDeposits += amount_;
        }

        srcAsset.safeTransferFrom(depositor_, address(this), amount_);

        emit AssetDeposited(depositor_, amount_);
    }

    /**
     * @notice deposit token
     * @param amount_ amount of source asset to deposit
     */
    function deposit(uint256 amount_) external {
        if (status != Status.Open) {
            revert OfferError(ErrorType.OfferNotOpen);
        }

        _deposit(amount_, msg.sender);
    }

    /**
     * @notice withdraw token deposited
     * @param amount_ amount of source asset to deposit
     * @param receiver_ address where the withrawn token will be sent to
     */
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

        emit AssetWithdrawn(msg.sender, amount_);
    }

    /**
     * @notice Close the offer. Only the creator can close it
     */
    function close() external {
        if (status != Status.Open) {
            revert OfferError(ErrorType.OfferNotOpen);
        }

        if (msg.sender != creator) {
            revert OfferError(ErrorType.NotCreator);
        }

        status = Status.Closed;

        emit OfferClosed(msg.sender);
    }

    /**
     * @notice Accept the offer.
             Anybody can accept the offer with closeAmount of destination asset.
             Source asset will be sent to receiver
     * @param receiver_ user address who will receive the source asset deposited
     */
    function accept(address receiver_) external {
        if (status != Status.Open) {
            revert OfferError(ErrorType.OfferNotOpen);
        }

        status = Status.Accepted;

        destAsset.safeTransferFrom(msg.sender, address(this), closeAmount);
        srcAsset.safeTransfer(receiver_, totalDeposits);

        emit OfferAccepted(msg.sender);
    }

    /**
     * @notice Gets payment balance for domain owner
     * @return balance payment balance
     */
    function paymentBalanceForDomainOwner()
        public
        view
        returns (uint256 balance)
    {
        if (withdrawPayments[msg.sender]) {
            return 0;
        }

        unchecked {
            balance =
                (totalDeposits * commissionRate) /
                Config.COMMISSION_RATE_SCALE;
        }
    }

    /**
     * @notice Gets payment balance for depositor
     * @return balance payment balance
     */
    function paymentBalanceForDepositor()
        public
        view
        returns (uint256 balance)
    {
        if (withdrawPayments[msg.sender]) {
            return 0;
        }

        uint256 depositAmount = deposits[msg.sender];

        unchecked {
            balance =
                depositAmount -
                (depositAmount * commissionRate) /
                Config.COMMISSION_RATE_SCALE;
        }
    }

    /**
     * @notice Domain owner calls this function to withdraw payment
     * @param receiver_ user address who will receive the payment
     */
    function withdrawPaymentForDomainOwner(address receiver_) external {
        if (status != Status.Accepted) {
            revert OfferError(ErrorType.OfferNotAccepted);
        }

        if (msg.sender != domainOwner) {
            revert OfferError(ErrorType.NotDomainOwner);
        }

        uint256 amount = paymentBalanceForDomainOwner();

        srcAsset.safeTransfer(receiver_, amount);

        withdrawPayments[msg.sender] = true;

        emit PaymentWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Depositor calls this function to withdraw payment
     * @param receiver_ user address who will receive the payment
     */
    function withdrawPaymentForDepositor(address receiver_) external {
        if (status != Status.Accepted) {
            revert OfferError(ErrorType.OfferNotAccepted);
        }

        uint256 amount = paymentBalanceForDepositor();

        destAsset.safeTransfer(receiver_, amount);

        withdrawPayments[msg.sender] = true;

        emit PaymentWithdrawn(msg.sender, amount);
    }
}
