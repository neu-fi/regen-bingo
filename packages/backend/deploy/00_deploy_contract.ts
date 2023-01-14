import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { regenBingoArgs } from '../config';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {getNamedAccounts, deployments} = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let uri = await deploy('URI', {from: deployer, log: true});

  await deploy('RegenBingo', {
    args: regenBingoArgs,
    from: deployer,
    log: true,
    libraries: {
      URI: uri.address,
    }
  });
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
