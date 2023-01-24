import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { regenBingoArgs, dateTimeContractAddress } from '../config';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (hre.network.name !== 'localhost') {
    const {deployments} = hre;

    let dateTimeAddress = dateTimeContractAddress;
    if(dateTimeAddress == null){
      const dateTime = await deployments.get("RegenBingoSVG");
      dateTimeAddress = dateTime.address;
    }

    let regenBingoSVG = await deployments.get("RegenBingoSVG");
    let regenBingoMetadata = await deployments.get("RegenBingoMetadata");
    let regenBingo = await deployments.get("RegenBingo");

    console.log("Verifiying RegenBingoSVG...");
    let skip0 = false;
    let counter0 = 0;
    while(!skip0 && counter0 < 10){
      try {
        counter0++;
        await hre.run("verify:verify", {
          address: regenBingoSVG.address,
          constructorArguments : [dateTimeAddress]
        });
        skip0 = true;
        console.log("Verified!");
      } catch (e: any) {
        console.error(e.name);
        console.error(e.message);
        if (e.name === "NomicLabsHardhatPluginError" && e.message.toLowerCase().includes("already verified")) {
          skip0 = true;
        } else {
          console.log("Exception catched while verifying. Trying again.");
        }
      }
    }

    console.log("Verifiying RegenBingoMetadata...");
    let skip1 = false;
    let counter1 = 0;
    while(!skip1 && counter1 < 10){
      try {
        counter1++;
        await hre.run("verify:verify", {
          address: regenBingoMetadata.address,
          constructorArguments: [regenBingoSVG.address]
        });
        skip1 = true;
        console.log("Verified!");
      } catch (e: any) {
        console.error(e.name);
        console.error(e.message);
        if (e.name === "NomicLabsHardhatPluginError" && e.message.toLowerCase().includes("already verified")) {
          skip1 = true;
        } else {
          console.log("Exception catched while verifying. Trying again.");
        }
      }
    }

    console.log("Verifiying RegenBingo...");
    let skip2 = false;
    let counter2 = 0;
    while(!skip2 && counter2 < 10){
      try {
        counter2++;
        await hre.run("verify:verify", {
          address: regenBingo.address,
          constructorArguments: [...regenBingoArgs, regenBingoMetadata.address]
        });
        skip2 = true;
        console.log("Verified!");
      } catch (e: any) {
        console.error(e.name);
        console.error(e.message);
        if (e.name === "NomicLabsHardhatPluginError" && e.message.toLowerCase().includes("already verified")) {
          skip2 = true;
        } else {
          console.log("Exception catched while verifying. Trying again.");
        }
      }
    }
  }
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
