import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { network, regenBingoArgs } from '../config';
import { BigNumber } from 'ethers';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    if (network == "localhost") {

        const { deployer } = await hre.getNamedAccounts();
        const regenBingoContract = await hre.ethers.getContract("RegenBingo");

        const vrfCoordinatorAddress = (await hre.deployments.get("VRFCoordinatorV2Mock")).address;
        const coordinatorFactory = await hre.ethers.getContractFactory("VRFCoordinatorV2Mock");
        const vrfCoordinatorV2Mock = coordinatorFactory.attach(vrfCoordinatorAddress);

        const drawTimestamp = Number(await regenBingoContract.drawTimestamp());
        
        console.log("\nBingo state is: ", await regenBingoContract.bingoState())

        const latestTimestamp = Number(await time.latest());

        if(drawTimestamp > latestTimestamp) {
            await time.increaseTo(drawTimestamp);
        }

        await (await regenBingoContract.startDrawPeriod()).wait();

        const requestId = await regenBingoContract.lastRequestId();
        const randomness = [(Math.random() * 1e10).toFixed()];
        const wrapperAddress = (await hre.deployments.get("VRFV2Wrapper")).address;

        console.log("Random seed is: ", randomness[0])

        await (await vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride(
            requestId,
            wrapperAddress,
            randomness,
            {
                gasLimit: 1000000,
            }
        )).wait();

        console.log("Bingo state is: ", await regenBingoContract.bingoState())
    }
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
