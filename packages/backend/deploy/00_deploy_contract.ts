import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DateTimeContractAddress, LinkAddress, WrapperAddress, regenBingoArgs } from '../config';
import { BigNumber } from 'ethers';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deployments } = hre;
  const { deploy } = deployments;

  let dateTimeContractAddress = DateTimeContractAddress;
  
  if (dateTimeContractAddress == null) {
    let dateTimeContract = await deploy('DateTimeContract', {
      from: deployer,
      log: true,
    });
    dateTimeContractAddress = dateTimeContract.address;
  }

  let linkAddress = LinkAddress;
  if (linkAddress == null) {
    let linkToken = await deploy("LinkToken", {
      from: deployer,
      log: true,
    });
    linkAddress = linkToken.address;
  }

  let wrapperAddress = WrapperAddress;
  if (wrapperAddress == null) {
    let vrfCoordinatorV2Mock = await deploy("VRFCoordinatorV2Mock", {
      args: [
        BigNumber.from('100000000000000000'), // 0.1 LINK
        1e9, // 0.000000001 LINK per gas
      ],
      from: deployer,
      log: true,
    });
    let mockV3Aggregator = await deploy("MockV3Aggregator", {
      args : [
        18,
        BigNumber.from(String(3e16)) // 0.003
      ],
      from: deployer,
      log: true,
    })
    let vrfV2Wrapper = await deploy("VRFV2Wrapper", {
      args : [
        linkAddress,
        mockV3Aggregator.address,
        vrfCoordinatorV2Mock.address
      ],
      from: deployer,
      log: true
    })

    wrapperAddress = vrfV2Wrapper.address;
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
