import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { regenBingoArgs } from '../config';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (hre.network.name !== 'ethereum' ) {
    const signers = await hre.ethers.getSigners();
    const signer = signers[0];
    const regenBingoContract = await hre.ethers.getContract("RegenBingo", signer);
    const mintPrice = await regenBingoContract.mintPrice();
    
    console.log("\ntotalSupply():");
    console.log(await regenBingoContract.totalSupply());
    
    console.log("\nMinting...");
    let tx = await regenBingoContract.mint({ value: mintPrice })
    let receipt = await tx.wait();
    
    console.log("\ntotalSupply():");
    console.log(await regenBingoContract.totalSupply());

    let tokenId = await regenBingoContract.tokenByIndex(0);

    console.log("\ntokenByIndex(0):");
    console.log(tokenId);
    
    let tokenURI = await regenBingoContract.tokenURI(tokenId);

    console.log("\nDecoded tokenURI(tokenId):");
    console.log(JSON.parse(Buffer.from(tokenURI.split(',')[1], 'base64').toString()));
  }
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
