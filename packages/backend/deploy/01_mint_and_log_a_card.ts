import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const signers = await hre.ethers.getSigners();
  const signer = signers[0];
  const greeterContract = await hre.ethers.getContract("RegenBingo", signer);
  
  console.log("\ntotalSupply():");
  console.log(await greeterContract.totalSupply());
  
  console.log("\nMinting...");
  await greeterContract.mint({ value: hre.ethers.utils.parseEther("0.1") })
  
  console.log("\ntotalSupply():");
  console.log(await greeterContract.totalSupply());

  let tokenId = await greeterContract.tokenByIndex(0);

  console.log("\ntokenByIndex(0):");
  console.log(tokenId);
  
  let tokenURI = await greeterContract.tokenURI(tokenId);

  console.log("\ntokenURI(tokenId):");
  console.log(tokenURI);

  console.log("\nDecoded tokenURI(tokenId):");
  console.log(Buffer.from(tokenURI, 'base64'));
};

export default main;
 
export const tags = ['regen-bingo'];
