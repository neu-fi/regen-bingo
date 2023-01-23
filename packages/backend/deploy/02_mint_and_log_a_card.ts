import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { LinkAddress } from '../config';
import  LinkTokenInstance from "../artifacts/@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol/LinkTokenInterface.json"

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (hre.network.name !== 'ethereum' ) {
    const signers = await hre.ethers.getSigners();
    const signer = signers[0];
    const regenBingoContract = await hre.ethers.getContract("RegenBingo", signer);
    const linkTokenABI = LinkTokenInstance["abi"];
    const linkContract = new hre.ethers.Contract(LinkAddress, linkTokenABI, signer);
    const mintPrice = await regenBingoContract.mintPrice();
    
    console.log("\ntotalSupply():");
    console.log(await regenBingoContract.totalSupply());
    
    console.log("\nMinting...");
    await regenBingoContract.mintMultiple(3, { value: mintPrice.mul(3) });
    let tx = await regenBingoContract.mint({ value: mintPrice });
    await tx.wait();
    
    console.log("\ntotalSupply():");
    console.log(await regenBingoContract.totalSupply());

    let tokenId = await regenBingoContract.tokenByIndex(0);

    console.log("\ntokenByIndex(0):");
    console.log(tokenId);
    
    let tokenURI = await regenBingoContract.tokenURI(tokenId);
    let decodedTokenURI = JSON.parse(Buffer.from(tokenURI.split(',')[1], 'base64').toString());

    console.log("\nDecoded tokenURI(tokenId):");
    console.log(decodedTokenURI);

    let decodedImage = Buffer.from(decodedTokenURI['image'].split(',')[1], 'base64').toString();

    console.log("\nDecoded image:");
    console.log(decodedImage);
    
    //302951757588516228 link amount for one random
    try{
      let transaction = await linkContract.transfer(regenBingoContract.address, hre.ethers.BigNumber.from(String(40 * 1e16)));
      transaction.wait();
      console.log("\n", 40 * 1e16, "LINK sent for funding regen-bingo contract");
    }catch(err){
      console.error(`Cannot funded please send LINK to RegenBingo at: ${regenBingoContract.address}`)
    }
    
  }
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
