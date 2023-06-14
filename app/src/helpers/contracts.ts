import otcAbi from '../../../contract/artifacts/contracts/OTC.sol/OTC.json';
import offerAbi from '../../../contract/artifacts/contracts/Offer.sol/Offer.json';
import { Address } from 'abitype';
import * as CONFIG from './config';

export const otcContract = {
  address: CONFIG.otcAddress,
  abi: otcAbi.abi,
};

export const offerContract = (offerAddress: Address) => ({
  address: offerAddress,
  abi: offerAbi.abi,
});
