import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { network } from '../config';
import { BigNumber } from 'ethers';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    if (network == "localhost"){
        
        console.log("Configuring Wrapper contrat \n")

        const wrapperGasOverhead = BigNumber.from(60_000)
        const coordinatorGasOverhead = BigNumber.from(52_000)
        const wrapperPremiumPercentage = 10
        const maxNumWords = 10

        const wrapperAddress = (await hre.deployments.get("VRFV2Wrapper")).address;
        const wrapperFactory = await hre.ethers.getContractFactory("VRFV2Wrapper");
        const vrfV2Wrapper = wrapperFactory.attach(wrapperAddress);

        const vrfCoordinatorAddress = (await hre.deployments.get("VRFCoordinatorV2Mock")).address;
        const coordinatorFactory = await hre.ethers.getContractFactory("VRFCoordinatorV2Mock");
        const vrfCoordinatorV2Mock = coordinatorFactory.attach(vrfCoordinatorAddress);

        await (await vrfV2Wrapper.setConfig(
            wrapperGasOverhead,
            coordinatorGasOverhead,
            wrapperPremiumPercentage,
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
            maxNumWords
        )).wait();
        
        await (await vrfCoordinatorV2Mock.fundSubscription(1, BigNumber.from(String(100 * 1e18)))).wait() // 100 LINK
      };
    }
 
export default main;
 
export const tags = ['all', 'regen-bingo'];
