import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (hre.network.name !== 'ethereum' ) {
    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];
    const regenBingoContract = await hre.ethers.getContract("RegenBingo");
    let totalSupply;

    const mintPrice = await regenBingoContract.mintPrice();
    
    console.log("\ntotalSupply():");
    totalSupply = (await regenBingoContract.totalSupply());
    console.log(totalSupply.toString());
    
    console.log("\nMinting a card...");
    await (await regenBingoContract.connect(deployer).mint({ value: mintPrice })).wait();

    let multipleMintCount = 2;
    console.log("\nMinting", multipleMintCount, "cards...");
    await (await regenBingoContract.connect(deployer).mintMultiple(multipleMintCount, deployer.address, { value: mintPrice.mul(multipleMintCount) })).wait();

    console.log("\ntotalSupply():");
    totalSupply = (await regenBingoContract.totalSupply());
    console.log(totalSupply.toString());

    if ( 0 < totalSupply ) {
      let tokenId = await regenBingoContract.tokenByIndex(totalSupply.sub(1));

      console.log("\nLatest token id:");
      console.log(tokenId.toString());
      
      let tokenURI = await regenBingoContract.tokenURI(tokenId);
      let decodedTokenURI = JSON.parse(Buffer.from(tokenURI.split(',')[1], 'base64').toString());

      console.log("\nDecoded tokenURI(tokenId):");
      console.log(decodedTokenURI);

      let decodedImage = Buffer.from(decodedTokenURI['image'].split(',')[1], 'base64').toString();

      console.log("\nDecoded image:");
      console.log(decodedImage);
    } else {
      console.error("Cannot find tokens");
    }
  }
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
