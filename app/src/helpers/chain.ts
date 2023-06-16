import { mainnet, sepolia } from '@wagmi/core';
import * as CONFIG from './config';

const chain = CONFIG.prod ? mainnet : sepolia;

export const hashLink = (hash: string) => {
  const host = chain === mainnet ? 'etherscan.io' : 'sepolia.etherscan.io';
  return `https://${host}/tx/${hash}`;
};

export default chain;
