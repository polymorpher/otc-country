import { Address } from 'abitype';
import otcAbi from '~/../../contract/artifacts/contracts/OTC.sol/OTC.json';
import offerAbi from '~/../../contract/artifacts/contracts/Offer.sol/Offer.json';
import erc20Abi from '~/../../contract/artifacts/contracts/mocks/ERC20.sol/ERC20Mock.json';
import * as CONFIG from './config';

export const otcContract = {
  address: CONFIG.otcAddress,
  abi: otcAbi.abi,
};

export const offerContract = (offerAddress: Address) => ({
  address: offerAddress,
  abi: offerAbi.abi,
});

export const erc20Contract = (erc20Address: Address) => ({
  address: erc20Address,
  abi: erc20Abi.abi,
});
