import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { DateTimeContractAddress, LinkAddress, WrapperAddress, regenBingoArgs } from '../config';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let dateTimeContractAddress = DateTimeContractAddress;
  
  if(dateTimeContractAddress == null){
    let dateTimeContract = await deploy('DateTimeContract', {
      from: deployer,
      log: true,
    });
    dateTimeContractAddress = dateTimeContract.address;
  }

  let linkAddress = LinkAddress;
  if(linkAddress == null){
    //deploy link token to hardhat
  }

  let wrapperAddress = WrapperAddress;
  if(wrapperAddress == null){
    //deploy wrapper to hardhat
  }

  let regenBingoSVG = await deploy('RegenBingoSVG', {
    args: [dateTimeContractAddress],
    from: deployer,
    log: true,
  });

  let regenBingoMetadata = await deploy("RegenBingoMetadata", {
    args: [regenBingoSVG.address],
    from: deployer,
    log: true,
  });

  await deploy('RegenBingo', {
    args: [...regenBingoArgs, regenBingoMetadata.address, linkAddress, wrapperAddress],
    from: deployer,
    log: true,
  });
};

export default main;

export const tags = ["all", "regen-bingo"];
