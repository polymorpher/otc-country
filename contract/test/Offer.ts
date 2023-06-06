import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { acceptFixture, createOfferFixture } from "./fixtures";
import { Offer } from "./types";

describe("Offer", () => {
  describe("initialize", () => {
    it("success", async () => {
      const {
        offer,
        creator,
        domainOwner,
        acceptAmount,
        commissionRate,
        srcAssets: [sa1],
        destAssets: [da1],
      } = await loadFixture(createOfferFixture);

      const totalDeposits = await offer.totalDeposits();

      expect(await offer.creator()).to.eq(creator.address);
      expect(await offer.domainOwner()).to.eq(domainOwner.address);
      expect(await offer.srcAsset()).to.eq(sa1.address);
      expect(await offer.destAsset()).to.eq(da1.address);
      expect(await offer.acceptAmount()).to.eq(acceptAmount);
      expect(await offer.commissionRate()).to.eq(commissionRate);
      expect(await offer.deposits(creator.address)).to.eq(totalDeposits);
    });

    it("fail: already called", async () => {
      const { offer } = await loadFixture(createOfferFixture);
      await expect(
        offer.initialize(
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          0,
          0,
          0,
          0
        )
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("deposit", () => {
    it("another user deposit succeed", async () => {
      const {
        offer,
        srcAssets: [sa1],
        accounts: [depositor],
      } = await loadFixture(createOfferFixture);
      const amount = 50;
      const totalDeposits = await offer.totalDeposits();

      await expect(offer.connect(depositor).deposit(amount))
        .to.emit(offer, "AssetDeposited")
        .withArgs(depositor.address, amount);

      expect(await offer.totalDeposits()).to.eq(totalDeposits.add(amount));
      expect(await offer.deposits(depositor.address)).to.deep.eq(amount);
      expect(await sa1.balanceOf(offer.address)).to.eq(
        totalDeposits.add(amount)
      );
    });

    it("deposition second time increases amount", async () => {
      const {
        offer,
        accounts: [depositor],
      } = await loadFixture(createOfferFixture);
      const amounts = [50, 100];
      const totalDeposits = await offer.totalDeposits();

      await offer.connect(depositor).deposit(amounts[0]);
      await offer.connect(depositor).deposit(amounts[1]);

      expect(await offer.totalDeposits()).to.eq(
        totalDeposits.add(amounts[0] + amounts[1])
      );

      expect(await offer.deposits(depositor.address)).to.deep.eq(
        amounts[0] + amounts[1]
      );
    });
  });

  describe("withdraw", () => {
    it("fail: insufficient balance", async () => {
      const {
        creator,
        offer,
        accounts: [receiver],
      } = await loadFixture(createOfferFixture);

      const amount = await offer.deposits(creator.address);

      await expect(
        offer.connect(creator).withdraw(amount.add(1), receiver.address)
      )
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.InsufficientBalance);
    });

    it("fail: withdraw locked", async () => {
      const {
        creator,
        offer,
        accounts: [receiver],
      } = await loadFixture(createOfferFixture);
      const amount = await offer.deposits(creator.address);

      await expect(
        offer.connect(creator).withdraw(amount.sub(1), receiver.address)
      )
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.WithdrawLocked);
    });

    it("success", async () => {
      const {
        creator,
        offer,
        srcAssets: [sa1],
        accounts: [receiver],
      } = await loadFixture(createOfferFixture);
      const depositAmount = await offer.deposits(creator.address);
      const totalDeposits = await offer.totalDeposits();
      const receiverBalance = await sa1.balanceOf(receiver.address);

      const lockDuration = await offer.lockWithdrawDuration();
      await time.increase(lockDuration);

      const withdrawAmount = depositAmount.sub(1);

      await expect(
        offer.connect(creator).withdraw(withdrawAmount, receiver.address)
      )
        .to.emit(offer, "AssetWithdrawn")
        .withArgs(creator.address, withdrawAmount);

      expect(await offer.deposits(creator.address)).to.eq(1);
      expect(await offer.totalDeposits()).to.deep.eq(
        totalDeposits.sub(withdrawAmount)
      );
      expect(await sa1.balanceOf(receiver.address)).to.deep.eq(
        receiverBalance.add(withdrawAmount)
      );
    });
  });

  describe("close", () => {
    it("success", async () => {
      const { creator, offer } = await loadFixture(createOfferFixture);

      await expect(offer.connect(creator).close())
        .to.emit(offer, "OfferClosed")
        .withArgs(creator.address);
    });

    it("fail: not creator", async () => {
      const {
        accounts: [alice],
        offer,
      } = await loadFixture(createOfferFixture);

      await expect(offer.connect(alice).close())
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.NotCreator);
    });

    it("fail: already closed", async () => {
      const { creator, offer } = await loadFixture(createOfferFixture);

      await offer.connect(creator).close();

      await expect(offer.connect(creator).close())
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.OfferNotOpen);
    });

    it("withdraw success after close", async () => {
      const {
        creator,
        offer,
        accounts: [receiver],
      } = await loadFixture(createOfferFixture);
      const depositAmount = await offer.deposits(creator.address);

      const lockDuration = await offer.lockWithdrawDuration();
      await time.increase(lockDuration);

      await expect(
        offer.connect(creator).withdraw(depositAmount, receiver.address)
      )
        .to.emit(offer, "AssetWithdrawn")
        .withArgs(creator.address, depositAmount);
    });

    it("deposit fails: after close", async () => {
      const { creator, offer } = await loadFixture(createOfferFixture);

      await offer.connect(creator).close();

      await expect(offer.connect(creator).deposit(0))
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.OfferNotOpen);
    });

    it("accept fails: after close", async () => {
      const { creator, offer } = await loadFixture(createOfferFixture);

      await offer.connect(creator).close();

      await expect(offer.connect(creator).accept(creator.address))
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.OfferNotOpen);
    });
  });

  describe("accept", () => {
    it("success", async () => {
      const {
        accounts: [depositor, acceptor, receiver],
        offer,
        acceptAmount,
        srcAssets: [sa1],
        destAssets: [da1],
      } = await loadFixture(createOfferFixture);

      const depositAmount = 200;

      const destTokenBalance = await da1.balanceOf(acceptor.address);
      const srcTokenBalance = await sa1.balanceOf(receiver.address);

      await offer.connect(depositor).deposit(depositAmount);

      const totalDeposits = await offer.totalDeposits();

      await expect(offer.connect(acceptor).accept(receiver.address))
        .to.emit(offer, "OfferAccepted")
        .withArgs(acceptor.address);

      expect(await da1.balanceOf(acceptor.address)).to.deep.eq(
        destTokenBalance.sub(acceptAmount)
      );
      expect(await da1.balanceOf(offer.address)).to.eq(acceptAmount);
      expect(await sa1.balanceOf(offer.address)).to.eq(0);
      expect(await sa1.balanceOf(receiver.address)).to.deep.eq(
        srcTokenBalance.add(totalDeposits)
      );
    });

    it("fail: dest asset balance not enough to accept", async () => {
      const {
        accounts: [acceptor],
        offer,
        destAssets: [da1],
      } = await loadFixture(createOfferFixture);

      await da1.connect(acceptor).approve(offer.address, 10000);

      await expect(
        offer.connect(acceptor).accept(acceptor.address)
      ).to.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("fail: already accepted", async () => {
      const {
        accounts: [, acceptor],
        offer,
      } = await loadFixture(createOfferFixture);

      await offer.connect(acceptor).accept(acceptor.address);

      await expect(offer.connect(acceptor).accept(acceptor.address))
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.OfferNotOpen);
    });

    it("close fails: after accept", async () => {
      const {
        creator,
        accounts: [, acceptor],
        offer,
      } = await loadFixture(createOfferFixture);

      await offer.connect(acceptor).accept(acceptor.address);

      await expect(offer.connect(creator).close())
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.OfferNotOpen);
    });

    it("deposit fails: after accept", async () => {
      const {
        creator,
        accounts: [, acceptor],
        offer,
      } = await loadFixture(createOfferFixture);

      await offer.connect(acceptor).accept(acceptor.address);

      await expect(offer.connect(creator).deposit(0))
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.OfferNotOpen);
    });

    it("withdraw fails: after accept", async () => {
      const {
        creator,
        accounts: [, acceptor],
        offer,
      } = await loadFixture(createOfferFixture);

      await offer.connect(acceptor).accept(acceptor.address);

      await expect(offer.connect(creator).withdraw(0, creator.address))
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.OfferAccepted);
    });
  });

  describe("withdraw payment", () => {
    it("withdraw domain payment fails: not domain owner", async () => {
      const {
        offer,
        accounts: [alice],
      } = await loadFixture(acceptFixture);

      await expect(
        offer.connect(alice).withdrawPaymentForDomainOwner(alice.address)
      )
        .to.revertedWithCustomError(offer, "OfferError")
        .withArgs(Offer.ErrorType.NotDomainOwner);
    });

    it("paymentBalanceForDomainOwner", async () => {
      const { offer, acceptAmount, commissionRate, otc } = await loadFixture(
        acceptFixture
      );

      const commissionRateScale = await otc.commissionRateScale();

      expect(await offer.paymentBalanceForDomainOwner()).to.deep.eq(
        ethers.BigNumber.from(acceptAmount * commissionRate).div(
          commissionRateScale
        )
      );
    });

    it("paymentBalanceForDepositor", async () => {
      const {
        offer,
        creator,
        depositor,
        acceptAmount,
        creatorDepositAmount,
        depositAmount,
        commissionRate,
        otc,
        accounts: [alice],
      } = await loadFixture(acceptFixture);

      const commissionRateScale = await otc.commissionRateScale();

      const totalDeposits = creatorDepositAmount + depositAmount;

      const domainOwnerPayment = ethers.BigNumber.from(
        acceptAmount * commissionRate
      ).div(commissionRateScale);

      expect(await offer.paymentBalanceForDepositor(alice.address)).to.eq(0);
      expect(await offer.paymentBalanceForDepositor(creator.address)).to.eq(
        ethers.BigNumber.from(acceptAmount)
          .sub(domainOwnerPayment)
          .mul(creatorDepositAmount)
          .div(totalDeposits)
      );
      expect(await offer.paymentBalanceForDepositor(depositor.address)).to.eq(
        ethers.BigNumber.from(acceptAmount)
          .sub(domainOwnerPayment)
          .mul(depositAmount)
          .div(totalDeposits)
      );
    });

    it("withdraw payment", async () => {
      const {
        offer,
        otc,
        acceptAmount,
        commissionRate,
        depositAmount,
        creatorDepositAmount,
        domainOwner,
        creator,
        depositor,
        srcAssets: [sa1],
        destAssets: [da1],
      } = await loadFixture(acceptFixture);
      const totalDeposits = depositAmount + creatorDepositAmount;

      const commissionRateScale = await otc.commissionRateScale();

      const domainOwnerPayment = ethers.BigNumber.from(
        acceptAmount * commissionRate
      ).div(commissionRateScale);

      const creatorPayment = ethers.BigNumber.from(acceptAmount)
        .sub(domainOwnerPayment)
        .mul(creatorDepositAmount)
        .div(totalDeposits);

      const depositorPayment = ethers.BigNumber.from(acceptAmount)
        .sub(domainOwnerPayment)
        .mul(depositAmount)
        .div(totalDeposits);

      // check payment events
      await expect(
        offer
          .connect(domainOwner)
          .withdrawPaymentForDomainOwner(domainOwner.address)
      )
        .to.emit(offer, "PaymentWithdrawn")
        .withArgs(domainOwner.address, domainOwnerPayment);

      await expect(
        offer.connect(creator).withdrawPaymentForDepositor(creator.address)
      )
        .to.emit(offer, "PaymentWithdrawn")
        .withArgs(creator.address, creatorPayment);

      await expect(
        offer.connect(depositor).withdrawPaymentForDepositor(depositor.address)
      )
        .to.emit(offer, "PaymentWithdrawn")
        .withArgs(depositor.address, depositorPayment);

      // check balance after payment
      expect(await offer.paymentBalanceForDomainOwner()).to.eq(0);
      expect(await offer.paymentBalanceForDepositor(creator.address)).to.eq(0);
      expect(await offer.paymentBalanceForDepositor(depositor.address)).to.eq(
        0
      );

      // check balance on offer contract
      expect(await sa1.balanceOf(offer.address)).to.eq(0);
      expect(await da1.balanceOf(offer.address)).to.eq(0);
    });
  });
});
