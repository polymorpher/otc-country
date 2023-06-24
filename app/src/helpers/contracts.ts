import { Abi, Address } from 'abitype';
import otcAbi from '~/../../contract/artifacts/contracts/OTC.sol/OTC.json';
import offerAbi from '~/../../contract/artifacts/contracts/Offer.sol/Offer.json';
import domainContractAbi from '~/../../contract/artifacts/contracts/mocks/DomainContract.sol/DomainContract.json';
import erc20Abi from '~/../../contract/artifacts/contracts/mocks/ERC20.sol/ERC20Mock.json';
import * as CONFIG from './config';

export const otcContract = {
  address: CONFIG.otcAddress,
  abi: otcAbi.abi as Abi,
};

export const offerContract = (offerAddress: Address) => ({
  address: offerAddress,
  abi: offerAbi.abi as Abi,
});

export const domainContract = (domainContractAddress: Address) => ({
  address: domainContractAddress,
  abi: domainContractAbi.abi as Abi,
});

export const erc20Contract = (erc20Address: Address) => ({
  address: erc20Address,
  abi: erc20Abi.abi as Abi,
});
