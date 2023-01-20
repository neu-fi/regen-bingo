import * as dotenv from 'dotenv';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';

dotenv.config({ path: '.env' });
const network = process.env.NEXT_PUBLIC_NETWORK || 'localhost';

const drawTimestamp = Math.floor(Date.now() / 1000) + 120;

const ethereumArgs = ['REGENBINGO', 'Regen Bingo — #0', parseEther('0.1'), drawTimestamp, 120, 'The Gitcoin Alpha Round', '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'];
const goerliArgs = ['REGENBINGO', 'Regen Bingo — Testnet #0', parseEther('0.01'), drawTimestamp, 5, 'The Gitcoin Alpha Round', '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'];
const localhostArgs = ['REGENBINGO', 'Regen Bingo — Localhost #0', parseEther('0.1'), drawTimestamp, 5, 'The Gitcoin Alpha Round', '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'];

export const regenBingoArgs: (string | number | BigNumber)[] = (() => {switch(network) {
    case 'ethereum':
        return ethereumArgs;
    case 'goerli':
        return goerliArgs;
    default:
        return localhostArgs;
}})();

export const regenBingoSVGArgs: (string | number | BigNumber)[] = (() => {switch(network) {
    case 'ethereum':
        return ['0x23d23d8F243e57d0b924bff3A3191078Af325101']; //Deployed and verified DateTime contract by creators
    case 'goerli':
        return ['0x85CC560EfebA375959B0FBA451cF4eBD1c8E6FA6']; //Deployed and verified DateTime contract by Muhittin
    default:
        return [""];
}})();
