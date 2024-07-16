// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./libraries/Config.sol";
import "./externals/IDC.sol";
import "./interfaces/IOfferFactory.sol";
import "./interfaces/IOffer.sol";
import "./interfaces/IOTC.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract OTC is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    using Address for address;

    /// @notice operator role constant
    bytes32 public constant OPERATOR_ROLE = keccak256(abi.encodePacked("OPERATOR_ROLE"));

    /// @notice revenue account address
    address public revenueAccount;

    /// @notice fee percentage in destination asset which is sent to the revenue account when the offer is accepted
    uint256 public feePercentage;

    /// @notice available assets
    mapping(address => bool) public assets;

    /// @notice address of domain contract
    IDC public immutable domainContract;

    /// @notice address of offer factory contract
    IOfferFactory public immutable offerFactory;

    enum ErrorType {
        ZeroAddress,
        SourceAssetUnregistered,
        DestAssetUnregistered,
        CommissionRateBeyondLimit,
        AssetAlreadyAdded,
        AssetAlreadyRemoved,
        Unauthorized
    }

    error OTCError(ErrorType errorNo);

    event AssetAdded(address indexed asset);

    event AssetRemoved(address indexed asset);

    event RevenueAccountUpdated(address indexed account);

    event FeePercentageUpdated(uint256 feePercentage);

    event OfferCreated(
        string indexed domainName,
        address indexed srcAsset,
        address indexed destAsset,
        address offerAddress,
        address domainOwner,
        uint256 depositAmount,
        uint256 closeAmount,
        uint256 commissionRate,
        uint256 lockWithdrawAfter
    );

    receive() external payable {}

    modifier onlyUser() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender) && !hasRole(OPERATOR_ROLE, msg.sender)) {
            revert OTCError(ErrorType.Unauthorized);
        }

        _;
    }

    /**
     * @notice constructor
     * @param domainContract_ domain contract address
     * @param offerFactory_ offer factory address
     * @param admin_ admin address
     * @param operator_ operator address
     * @param revenueAccount_ revenue account address
     */
    constructor(
        IDC domainContract_,
        IOfferFactory offerFactory_,
        address admin_,
        address operator_,
        address revenueAccount_,
        uint256 feePercentage_
    ) AccessControl() Pausable() {
        if (
            address(domainContract_) == address(0) ||
            address(offerFactory_) == address(0) ||
            admin_ == address(0) ||
            operator_ == address(0) ||
            revenueAccount_ == address(0)
        ) {
            revert OTCError(ErrorType.ZeroAddress);
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(OPERATOR_ROLE, operator_);

        domainContract = domainContract_;
        offerFactory = offerFactory_;
        revenueAccount = revenueAccount_;
        feePercentage = feePercentage_;
    }

    /**
     * @notice Pause or unpause the contract
     * @param pause_ true or false
     */
    function pause(bool pause_) external onlyUser {
        if (pause_) {
            _pause();
        } else {
            _unpause();
        }
    }

    /**
     * @notice Pause or unpause the contract
     * @param revenueAccount_ revenue account address
     */
    function setRevenueAccount(address revenueAccount_) external whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        revenueAccount = revenueAccount_;
        emit RevenueAccountUpdated(revenueAccount_);
    }

    /**
     * @notice Set fee percentage
     * @param value_ fee percentage value
     */
    function setProtocolFee(uint256 value_) external whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        feePercentage = value_;
        emit FeePercentageUpdated(value_);
    }

    /**
     * @notice Add asset
     * @param asset address of asset to add
     */
    function addAsset(address asset) external whenNotPaused onlyUser {
        if (assets[asset]) {
            revert OTCError(ErrorType.AssetAlreadyAdded);
        }

        assets[asset] = true;

        emit AssetAdded(asset);
    }

    /**
     * @notice Remove asset
     * @param asset address of asset to remove
     */
    function removeAsset(address asset) external whenNotPaused onlyUser {
        if (!assets[asset]) {
            revert OTCError(ErrorType.AssetAlreadyRemoved);
        }

        assets[asset] = false;

        emit AssetRemoved(asset);
    }

    /**
     * @notice commission rate scale
     * @return scale commission rate scale
     */
    function commissionRateScale() external pure returns (uint256 scale) {
        scale = Config.RATE_SCALE;
    }

    /**
     * @notice Get address of offer contract
     * @param domainName_ domain name of the offer contract
     * @return contractAddress offer contract address
     */
    function computedOfferAddress(string calldata domainName_) external view returns (address contractAddress) {
        contractAddress = offerFactory.getAddress(keccak256(abi.encodePacked(domainName_)));
    }

    /**
     * @notice Get address of offer contract if created
     * @param domainName_ domain name of the offer contract
     * @return contractAddress offer contract address if created, zero address if offer was not created
     */
    function offerAddress(string calldata domainName_) external view returns (address contractAddress) {
        contractAddress = offerFactory.getAddress(keccak256(abi.encodePacked(domainName_)));

        if (!contractAddress.isContract()) {
            contractAddress = address(0);
        }
    }

    /**
     * @notice Create offer with given data after purchasing the domain with ethers
     * @param domainName_ domain name for the offer
     * @param secret_ secret used to buy the domain name
     * @param domainOwner_ address of user that the domain will belongs to
     * @param srcAsset_ source asset address
     * @param destAsset_ destination asset address
     * @param depositAmount_ source asset deposit amount of the offer creator
     * @param acceptAmount_ destination asset amount at which the offer will be closed
     * @param commissionRate_ commission rate at which the fee in destination asset is sent to the domain owner when the offer is accepted
     * @param lockWithdrawDuration_ depositors cannot withdraw until the time is passed by this value after the deposition time
     */
    function createOffer(
        string calldata domainName_,
        bytes32 secret_,
        address domainOwner_,
        address srcAsset_,
        address destAsset_,
        uint256 depositAmount_,
        uint256 acceptAmount_,
        uint256 commissionRate_,
        uint256 lockWithdrawDuration_
    ) external payable whenNotPaused {
        if (!assets[srcAsset_]) {
            revert OTCError(ErrorType.SourceAssetUnregistered);
        }

        if (!assets[destAsset_]) {
            revert OTCError(ErrorType.DestAssetUnregistered);
        }

        if (commissionRate_ > Config.RATE_SCALE) {
            revert OTCError(ErrorType.CommissionRateBeyondLimit);
        }

        if (domainContract.ownerOf(domainName_) != domainOwner_) {
            uint256 price = domainContract.getPrice(domainName_);
            bytes32 commitment = domainContract.makeCommitment(domainName_, domainOwner_, secret_);

            domainContract.commit(commitment);
            domainContract.register{value: price}(domainName_, domainOwner_, secret_);
        }

        address offer = offerFactory.deploy(keccak256(abi.encodePacked(domainName_)));

        IOffer(offer).initialize(
            IOTC(address(this)),
            domainName_,
            msg.sender,
            domainOwner_,
            srcAsset_,
            destAsset_,
            depositAmount_,
            acceptAmount_,
            commissionRate_,
            lockWithdrawDuration_
        );

        emit OfferCreated(domainName_, srcAsset_, destAsset_, offer, domainOwner_, depositAmount_, acceptAmount_, commissionRate_, lockWithdrawDuration_);
    }
}
