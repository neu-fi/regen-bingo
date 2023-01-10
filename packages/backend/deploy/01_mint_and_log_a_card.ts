import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const signers = await hre.ethers.getSigners();
  const signer = signers[0];
  const greeterContract = await hre.ethers.getContract("RegenBingo", signer);
  
  console.log("\ntotalSupply:");
  console.log(await greeterContract.totalSupply());
  
  console.log("\nminting...");
  await greeterContract.mint({ value: hre.ethers.utils.parseEther("0.1") })
  
  console.log("\ntotalSupply:");
  console.log(await greeterContract.totalSupply());
  
  console.log("\ntokenId:");
  let tokenId = await greeterContract.tokenByIndex(0);
  console.log(tokenId);
  
  console.log("\ntokenImage:");
  console.log(await greeterContract.tokenImage(tokenId));
  
  console.log("\ntokenURI:");
  console.log(await greeterContract.tokenURI(tokenId));
};

export default main;
 
export const tags = ['regen-bingo'];
