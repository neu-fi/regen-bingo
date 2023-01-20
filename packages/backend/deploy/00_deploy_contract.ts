import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { regenBingoArgs } from '../config';
import { regenBingoSVGArgs } from '../config';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {getNamedAccounts, deployments} = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let dateTimeContractAddress = regenBingoSVGArgs[0]

  if(!dateTimeContractAddress){
    let dateTimeContract = await deploy('DateTimeContract', {
      from: deployer,
      log: true,
    })
    dateTimeContractAddress = dateTimeContract.address;
  }

  let regenBingoSVG = await deploy('RegenBingoSVG', {
    args: [dateTimeContractAddress],
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
