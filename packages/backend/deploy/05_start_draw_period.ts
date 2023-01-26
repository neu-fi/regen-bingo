import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { network } from '../config';
import { BigNumber, utils } from 'ethers';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    if (network == "localhost") {
        const regenBingoContract = await hre.ethers.getContract("RegenBingo");
        const vrfCoordinatorAddress = (await hre.deployments.get("VRFCoordinatorV2Mock")).address;
        const coordinatorFactory = await hre.ethers.getContractFactory("VRFCoordinatorV2Mock");
        const vrfCoordinatorV2Mock = coordinatorFactory.attach(vrfCoordinatorAddress);

        const drawTimestamp = Number(await regenBingoContract.drawTimestamp());
        
        console.log("Bingo state is: ", await regenBingoContract.bingoState());
        console.log("Draw seed is: ", (await regenBingoContract.drawSeed()).toString());

        const latestTimestamp = Number(await time.latest());
        if(drawTimestamp > latestTimestamp) {
            await time.increaseTo(drawTimestamp);
        }

        console.log("Calling regenBingoContract.startDrawPeriod...");
        await (await regenBingoContract.startDrawPeriod()).wait();

        console.log("Bingo state is: ", await regenBingoContract.bingoState());
        console.log("Draw seed is: ", (await regenBingoContract.drawSeed()).toString());

        const requestId = await regenBingoContract.lastRequestId();
        const randomness = [BigNumber.from(utils.randomBytes(32))];
        const wrapperAddress = (await hre.deployments.get("VRFV2Wrapper")).address;

        console.log("Calling vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride...");
        await (await vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride(
            requestId,
            wrapperAddress,
            randomness,
            {
                gasLimit: 1000000,
            }
        )).wait();

        console.log("Bingo state is: ", await regenBingoContract.bingoState());
        console.log("Draw seed is: ", (await regenBingoContract.drawSeed()).toString());
    }
};

export default main;
 
export const tags = ['all', 'regen-bingo'];
