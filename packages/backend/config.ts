import * as dotenv from "dotenv";
import {
  BigNumber
} from "ethers";
import {
  parseEther
} from "ethers/lib/utils";

dotenv.config({
  path: '.env'
});
export const network = process.env.NEXT_PUBLIC_NETWORK || 'localhost';

const drawTimestamp =
  process.env.DRAW_TIMESTAMP || Math.floor(Date.now() / 1000) + 300;

const ethereumArgs = [
  "REGENBINGO",
  "Regen Bingo — #0",
  parseEther("0.1"),
  drawTimestamp,
  120,
  "The Gitcoin Alpha Round",
  "0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA",
];
const goerliArgs = [
  "REGENBINGO",
  "Regen Bingo — Testnet #0",
  parseEther("0.01"),
  drawTimestamp,
  5,
  "The Gitcoin Alpha Round",
  "0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA",
];
const localhostArgs = [
  "REGENBINGO",
  "Regen Bingo — Localhost #0",
  parseEther("0.1"),
  drawTimestamp,
  5,
  "The Gitcoin Alpha Round",
  "0xc4c302f0d81F3E9a86d468f585dAe26F92D9F5EA",
];

export const regenBingoArgs: (string | number | BigNumber)[] = (() => {
  switch (network) {
    case "ethereum":
      return ethereumArgs;
    case "goerli":
      return goerliArgs;
    default:
      return localhostArgs;
  }
})();

export const LinkAddress: (string | null) = (() => {
  switch (network) {
    case 'ethereum':
      return '0x514910771AF9Ca656af840dff83E8264EcF986CA';
    case 'goerli':
      return '0x326C977E6efc84E512bB9C30f76E30c160eD06FB';
    default:
      return null;
  }
})();

export const WrapperAddress: (string | null) = (() => {
  switch (network) {
    case 'ethereum':
      return '0x5A861794B927983406fCE1D062e00b9368d97Df6';
    case 'goerli':
      return '0x708701a1DfF4f478de54383E49a627eD4852C816';
    default:
      return null;
  }
})();

export const BokkyPooBahsDateTimeContractAddress: (string | null) = (() => {
  switch (network) {
    case 'ethereum':
      return '0x23d23d8F243e57d0b924bff3A3191078Af325101';
    case 'goerli':
      return '0x382ebFD153a1439ee01E646161dCAA75987ebfD0';
    default:
      return null;
  }
})();

export const bokkyPooBahsBokkyPooBahsDateTimeContractAddress: string | null = (() => {
  switch (network) {
    case "ethereum":
      return "0x23d23d8F243e57d0b924bff3A3191078Af325101";
    case "goerli":
      return "0x382ebFD153a1439ee01E646161dCAA75987ebfD0";
    default:
      return null;
  }
})();
