import { mainnet, sepolia } from '@wagmi/core';
import * as CONFIG from './config';

const chain = CONFIG.prod ? mainnet : sepolia;

export default chain;
