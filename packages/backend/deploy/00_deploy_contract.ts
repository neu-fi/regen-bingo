import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { dateTimeContractAddress, regenBingoArgs } from '../config';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {getNamedAccounts, deployments} = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let dateTimeAddress = dateTimeContractAddress;
  
  if(dateTimeContractAddress == null){
    let dateTimeContract = await deploy('DateTimeContract', {
      from: deployer,
      log: true,
    })
    dateTimeAddress = dateTimeContract.address;
  };

  let regenBingoSVG = await deploy('RegenBingoSVG', {
    args: [dateTimeAddress],
    from: deployer,
    log: true,
  });

  let regenBingoMetadata = await deploy('RegenBingoMetadata', {
    args: [regenBingoSVG.address],
    from: deployer,
    log: true,
  });

  await deploy('RegenBingo', {
    args: [...regenBingoArgs, regenBingoMetadata.address],
    from: deployer,
    log: true,
  });
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
