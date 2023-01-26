import { BigNumber, utils } from 'ethers';
const hre = require("hardhat");

async function provideRandomness() {
    const regenBingoContract = await hre.ethers.getContract("RegenBingo");
    const vrfCoordinatorAddress = (await hre.deployments.get("VRFCoordinatorV2Mock")).address;
    const coordinatorFactory = await hre.ethers.getContractFactory("VRFCoordinatorV2Mock");
    const vrfCoordinatorV2Mock = coordinatorFactory.attach(vrfCoordinatorAddress);

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

provideRandomness()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })