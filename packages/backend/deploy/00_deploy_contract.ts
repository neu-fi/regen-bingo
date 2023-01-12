import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { parseEther } from 'ethers/lib/utils';

const main: DeployFunction = async function ({getNamedAccounts, deployments}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // const greeterArgs = ['Hello!!!!!!!!'];
  // await deploy('Greeter', {
  //   args: greeterArgs,
  //   from: deployer,
  //   log: true,
  // });

  let uri = await deploy('URI', {from: deployer, log: true});
  
  const regenBingoArgs = ['REGENBINGO', 'Regen Bingo — The OG Collection', parseEther('0.1'), Math.floor(Date.now() / 1000) + 60, 15, deployer];
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
 
export const tags = ['all', 'greeter', 'regen-bingo'];
