import * as dotenv from 'dotenv';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';

dotenv.config({ path: '.env' });
const network = process.env.NEXT_PUBLIC_NETWORK || 'localhost';

const drawTimestamp = process.env.DRAW_TIMESTAMP || Math.floor(Date.now() / 1000) + 120;

const ethereumArgs = ['REGENBINGO', 'Regen Bingo — #0', parseEther('0.1'), drawTimestamp, 120, '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'];
const goerliArgs = ['REGENBINGO', 'Regen Bingo — Testnet #0', parseEther('0.01'), drawTimestamp, 5, '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'];
const localhostArgs = ['REGENBINGO', 'Regen Bingo — Localhost #0', parseEther('0.1'), drawTimestamp, 5, '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'];

export const regenBingoArgs: (string | number | BigNumber)[] = (() => {switch(network) {
    case 'ethereum':
        return ethereumArgs;
    case 'goerli':
        return goerliArgs;
    default:
        return localhostArgs;
}})();
