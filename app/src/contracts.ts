import otcAbi from '../../contract/artifacts/contracts/OTC.sol/OTC.json';
import offerAbi from '../../contract/artifacts/contracts/Offer.sol/Offer.json';
import { Address } from 'abitype';

export const otcContract = {
  address: import.meta.env.VITE_OTC_ADDRESS,
  abi: otcAbi.abi,
};

export const offerContract = (offerAddress: Address) => ({
  address: offerAddress,
  abi: offerAbi.abi,
});
