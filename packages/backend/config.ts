import * as dotenv from 'dotenv';
import { parseEther } from 'ethers/lib/utils';

dotenv.config({ path: '.env' });
const defaultNetwork = process.env.NETWORK || 'localhost';

export const regenBingoArgs = {
    'localhost': ['REGENBINGO', 'Regen Bingo — Localhost #0', parseEther('0.1'), Math.floor(Date.now() / 1000) + 60, 5, '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'],
    'goerli': ['REGENBINGO', 'Regen Bingo — Testnet #0', parseEther('0.01'), Math.floor(Date.now() / 1000) + 60, 5, '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'],
    'ethereum': ['REGENBINGO', 'Regen Bingo — #0', parseEther('0.1'), Math.floor(Date.now() / 1000) + 60, 5, '0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA'],
}[defaultNetwork];
