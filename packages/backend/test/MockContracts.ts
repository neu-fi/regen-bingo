import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time, mineUpTo} from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";

const name = "RegenBingo";
const symbol = "BINGO";
const mintPrice = ethers.utils.parseEther("0.2") ;
const drawCooldownSeconds = 60 * 60; // 1 hour
const drawNumberCooldownSeconds = 5 * 60; // 5 minutes

describe("Chainlink contract integrations", function () {
    async function deployBingoFixture() {
        const [signer1, signer2, signer3] = await ethers.getSigners();
        const drawTimestamp = (await time.latest()) + drawCooldownSeconds;
        const donationName = "Donation Name";
        const donationAddress = signer3.address;

        // Deploymnets //

        const LinkTokenFactory = await ethers.getContractFactory("LinkToken");
        const linkToken = await LinkTokenFactory.deploy();
        await linkToken.deployed();

        const coordinatorFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        const vrfCoordinatorV2Mock = await coordinatorFactory.deploy(
            BigNumber.from('100000000000000000'), // 0.1 LINK
            1e9, // 0.000000001 LINK per gas
        );
        await vrfCoordinatorV2Mock.deployed();

        const mockV3AggregatorFactory = await ethers.getContractFactory("MockV3Aggregator");
        const mockV3Aggregator = await mockV3AggregatorFactory.deploy(
            18,
            BigNumber.from(String(3e16)) // 0.003
        );
        await mockV3Aggregator.deployed();

        const wrapperFactory = await ethers.getContractFactory("VRFV2Wrapper");
        const vrfV2Wrapper = await wrapperFactory.deploy(
            linkToken.address,
            mockV3Aggregator.address,
            vrfCoordinatorV2Mock.address
        );
        await vrfV2Wrapper.deployed();

        const RegenBingoSVG = await ethers.getContractFactory("RegenBingoSVG");
        const regenBingoSVG = await RegenBingoSVG.deploy();
        await regenBingoSVG.deployed();

        const RegenBingoMetadata = await ethers.getContractFactory("RegenBingoMetadata");
        const regenBingoMetadata = await RegenBingoMetadata.deploy(regenBingoSVG.address);
        await regenBingoMetadata.deployed();

        const RegenBingo = await ethers.getContractFactory("RegenBingo");
        const regenBingo = await RegenBingo.deploy(
            name,
            symbol,
            mintPrice,
            drawTimestamp,
            drawNumberCooldownSeconds,
            donationName,
            donationAddress,
            regenBingoMetadata.address,
            linkToken.address,
            vrfV2Wrapper.address
        );
        await regenBingo.deployed();

        // Configurations //

        const wrapperGasOverhead = BigNumber.from(60_000)
        const coordinatorGasOverhead = BigNumber.from(52_000)
        const wrapperPremiumPercentage = 10
        const maxNumWords = 10

        await (await vrfV2Wrapper.setConfig(
            wrapperGasOverhead,
            coordinatorGasOverhead,
            wrapperPremiumPercentage,
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
            maxNumWords
        )).wait();
        
        await (await vrfCoordinatorV2Mock.fundSubscription(1, BigNumber.from(String(100 * 1e18)))).wait() // 100 LINK

        const fundWithLINK = async (_linkAmount : string) => {
            await (await linkToken.transfer(regenBingo.address, _linkAmount)).wait();
        }

        const provideRandomness = async (_requestId : BigNumber) => {
            const randomness = [(Math.random() * 1e10).toFixed()];

            await (await vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride(
                _requestId,
                vrfV2Wrapper.address,
                randomness,
                {
                    gasLimit: 1000000,
                }
            )).wait();
        }

        return { regenBingo, signer1, signer2, donationName, donationAddress, drawTimestamp, vrfCoordinatorV2Mock, provideRandomness, fundWithLINK};
    }
    describe("Randomness Request", async function () {
        it("Cannot get random seed before not funding with link", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(drawCooldownSeconds);

            await expect(regenBingo.startDrawPeriod()).to.be.reverted;
            
        });
        it("Cannot get random seed with insufficent link balance", async function () {
            const { regenBingo, fundWithLINK } = await loadFixture(deployBingoFixture);

            const linkAmount = "302";
            await fundWithLINK(linkAmount);
            await time.increase(drawCooldownSeconds);

            await expect(regenBingo.startDrawPeriod()).to.be.reverted;
            
        });
        it("Should succesfully request a random word", async function () {
            const { regenBingo, fundWithLINK, vrfCoordinatorV2Mock } = await loadFixture(deployBingoFixture);

            const linkAmount = "302951757588516228";
            await fundWithLINK(linkAmount);
            await time.increase(drawCooldownSeconds);

            await expect(regenBingo.startDrawPeriod()).to.emit(vrfCoordinatorV2Mock, "RandomWordsRequested");
            expect(await regenBingo.lastRequestId()).to.equal(BigNumber.from("1"));
        })
        it("Cannot rerequest random seed before drawTimestamp", async function () {
            const { regenBingo, fundWithLINK } = await loadFixture(deployBingoFixture);

            const linkAmount = "3029517575885162280";
            await fundWithLINK(linkAmount);

            await regenBingo.rerequestDrawSeed();
            
            expect(await regenBingo.lastRequestId()).to.equal(BigNumber.from("0"));
            expect(await regenBingo.drawSeed()).to.equal(BigNumber.from("0"));
        });
        it("Cannot rerequest before vrf_cooldown", async function () {
            const { regenBingo, fundWithLINK } = await loadFixture(deployBingoFixture);

            const linkAmount = "3029517575885162280";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await regenBingo.startDrawPeriod();

            const lastRequestId = await regenBingo.lastRequestId();
            
            expect(lastRequestId).to.equal(BigNumber.from("1"));
            expect(await regenBingo.drawSeed()).to.equal(BigNumber.from("0"));

            await regenBingo.rerequestDrawSeed();

            expect(await regenBingo.lastRequestId()).to.equal(lastRequestId);
            
        });
        it("Cannot rerequest if drawSeed is not 0", async function () {
            const { regenBingo, fundWithLINK, vrfCoordinatorV2Mock, provideRandomness } = await loadFixture(deployBingoFixture);

            const linkAmount = "3029517575885162280";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await regenBingo.startDrawPeriod();

            const lastRequestId = await regenBingo.lastRequestId();
            
            expect(lastRequestId).to.equal(BigNumber.from("1"));
            expect(await regenBingo.drawSeed()).to.equal(BigNumber.from("0"));
            
            const lastBlockNumber = Number(await ethers.provider.getBlockNumber());

            await provideRandomness(lastRequestId);

            await mineUpTo(lastBlockNumber + 1000);
            
            await expect(regenBingo.rerequestDrawSeed()).to.not.emit(vrfCoordinatorV2Mock, "RandomWordsRequested");
            expect(await regenBingo.lastRequestId()).to.equal(lastRequestId);
        })
        it("Can rerequest random seed succesfully", async function () {
            const { regenBingo, fundWithLINK, vrfCoordinatorV2Mock } = await loadFixture(deployBingoFixture);

            const linkAmount = "3029517575885162280";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await regenBingo.startDrawPeriod();

            const lastRequestId = await regenBingo.lastRequestId();
            
            expect(lastRequestId).to.equal(BigNumber.from("1"));
            expect(await regenBingo.drawSeed()).to.equal(BigNumber.from("0"));

            const lastBlockNumber = Number(await ethers.provider.getBlockNumber());
            await mineUpTo(lastBlockNumber + 1000);
            
            await expect(regenBingo.rerequestDrawSeed()).to.emit(vrfCoordinatorV2Mock, "RandomWordsRequested");
            expect(await regenBingo.lastRequestId()).to.not.equal(lastRequestId);
            expect(await regenBingo.lastRequestId()).to.equal(BigNumber.from("2"));
        });
    });
});
