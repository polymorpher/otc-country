import { mainnet, sepolia } from '@wagmi/core';
import * as CONFIG from './config';

const chain = CONFIG.prod ? mainnet : sepolia;

export const host = chain === mainnet ? 'etherscan.io' : 'sepolia.etherscan.io';

export const hashLink = (hash: string) => `https://${host}/tx/${hash}`;

export default chain;
