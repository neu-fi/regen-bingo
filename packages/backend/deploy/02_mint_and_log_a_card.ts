import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (hre.network.name !== 'ethereum' ) {
    const signers = await hre.ethers.getSigners();
    const signer = signers[0];
    const regenBingoContract = await hre.ethers.getContract("RegenBingo", signer);
    const mintPrice = await regenBingoContract.mintPrice();
    
    console.log("\ntotalSupply():");
    console.log(await regenBingoContract.totalSupply());
    
    console.log("\nMinting...");
    await regenBingoContract.mint({ value: mintPrice })
    await regenBingoContract.mintMultiple(91, { value: mintPrice.mul(91) })
    let tx = await regenBingoContract.mint({ value: mintPrice })
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

    console.log("\nBalance of RegenBingo Contract:");
    let balanceOfRegenBingo = Number(await hre.ethers.provider.getBalance(regenBingoContract.address))
    console.log(balanceOfRegenBingo, "as wei")
  }
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
