import createOfferFixture from "./createOffer";

const acceptFixture = async () => {
  const data = await createOfferFixture();
  const {
    offer,
    accounts: [depositor, acceptor, ...accounts],
  } = data;

  const [receiver] = accounts;

  const depositAmount = 200;

  await offer.connect(depositor).deposit(depositAmount);

  await offer.connect(acceptor).accept(receiver.address);

  return {
    ...data,
    depositAmount,
    accounts,
    offer,
    acceptor,
    depositor,
  };
};

export default acceptFixture;
