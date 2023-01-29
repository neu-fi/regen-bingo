import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";

const name = "RegenBingo";
const symbol = "BINGO";
const mintPrice = ethers.utils.parseEther("0.2") ;
const drawCooldownSeconds = 60 * 60; // 1 hour
const drawNumberCooldownSeconds = 5 * 60; // 5 minutes

describe("RegenBingo", function () {
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

        const BokkyPooBahsDateTimeContract = await ethers.getContractFactory("BokkyPooBahsDateTimeContract");
        const bokkyPooBahsBokkyPooBahsDateTimeContract = await BokkyPooBahsDateTimeContract.deploy();
        await bokkyPooBahsBokkyPooBahsDateTimeContract.deployed();

        const RegenBingoSVG = await ethers.getContractFactory("RegenBingoSVG");
        const regenBingoSVG = await RegenBingoSVG.deploy(bokkyPooBahsBokkyPooBahsDateTimeContract.address);
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

    describe("Deployment", function () {
        it("Should set constructor arguments correctly", async function () {
            const { regenBingo, donationAddress, drawTimestamp } = await loadFixture(deployBingoFixture);

            expect(await regenBingo.name()).to.equal(name);
            expect(await regenBingo.symbol()).to.equal(symbol);
            expect(await regenBingo.mintPrice()).to.equal(mintPrice);
            expect(await regenBingo.drawTimestamp()).to.equal(drawTimestamp);
            expect(await regenBingo.drawNumberCooldownSeconds()).to.equal(drawNumberCooldownSeconds);
            expect(await regenBingo.donationAddress()).to.equal(donationAddress);
        });
    });

    describe("Minting", function () {
        it("Mints correctly", async function () {
            const { regenBingo, signer1 } = await loadFixture(deployBingoFixture);

            await regenBingo.mint({ value: mintPrice });

            expect(await regenBingo.balanceOf(signer1.address)).to.equal(1);
            expect(await regenBingo.totalSupply()).to.equal(1);
        });

        it("Does not allow minting with incorrect payment", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await expect(regenBingo.mint({ value: 0 })).to.be.revertedWith(
                "Incorrect payment amount"
            );

            await expect(regenBingo.mint({ value: mintPrice.mul(2) })).to.be.revertedWith(
                "Incorrect payment amount"
            );
        });

        it("Does not allow minting after draw", async function () {
            const { regenBingo, fundWithLINK, provideRandomness } = await loadFixture(deployBingoFixture);

            const linkAmount = "302951757588516228";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();

            const requestId = await regenBingo.lastRequestId();
            await provideRandomness(requestId);

            await expect(regenBingo.mint({ value: mintPrice })).to.be.revertedWith(
                "Minting has ended"
            );
        });
    });

    describe("Drawing numbers", function () {
        it("Can start the draw period", async function() {
            const { regenBingo, fundWithLINK, provideRandomness } = await loadFixture(deployBingoFixture);

            const linkAmount = "302951757588516228";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();

            const requestId = await regenBingo.lastRequestId();
            await provideRandomness(requestId);

            expect(await regenBingo.bingoState()).to.equal(BigNumber.from("1"));

        })
        it("Draws one number correctly", async function () {
            const { regenBingo, fundWithLINK, provideRandomness } = await loadFixture(deployBingoFixture);

            const linkAmount = "302951757588516228";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();

            const requestId = await regenBingo.lastRequestId();
            await provideRandomness(requestId);

            await time.increase(50);
            let tx = await regenBingo.drawNumber();
            let receipt = await tx.wait();
            let drawnNumber = Number(receipt.events[0].data);

            expect(drawnNumber).to.be.within(1, 90);
            expect(await regenBingo.lastDrawTime()).to.equal(await time.latest());
            expect(await regenBingo.getDrawnNumbers()).deep.includes(BigNumber.from(drawnNumber));
        });

        it("Draws multiple numbers correctly", async function () {
            const { regenBingo, fundWithLINK, provideRandomness } = await loadFixture(deployBingoFixture);

            const linkAmount = "302951757588516228";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();

            const requestId = await regenBingo.lastRequestId();
            await provideRandomness(requestId);

            let tx1 = await regenBingo.drawNumber();
            let receipt1 = await tx1.wait();
            let drawnNumber1 = Number(receipt1.events[0].data);

            await time.increase(drawNumberCooldownSeconds);
            let tx2 = await regenBingo.drawNumber();
            let receipt2 = await tx2.wait();
            let drawnNumber2 = Number(receipt2.events[0].data);

            expect(drawnNumber1).to.be.within(1, 90);
            expect(await regenBingo.getDrawnNumbers()).deep.includes(BigNumber.from(drawnNumber1));

            expect(drawnNumber2).to.be.within(1, 90);
            expect(await regenBingo.getDrawnNumbers()).deep.includes(BigNumber.from(drawnNumber2));

            expect(await regenBingo.lastDrawTime()).to.equal(await time.latest());
        });

        it("Does not allow drawing number before drawTimestamp", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await expect(regenBingo.drawNumber()).to.be.revertedWith("Draw has not started");
        });

        it("Does not allow drawing number before drawNumberCooldownSeconds", async function () {
            const { regenBingo, fundWithLINK, provideRandomness } = await loadFixture(deployBingoFixture);

            const linkAmount = "302951757588516228";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();

            const requestId = await regenBingo.lastRequestId();
            await provideRandomness(requestId);

            await regenBingo.drawNumber();
            await expect(regenBingo.drawNumber()).to.be.revertedWith("Draw too soon");
        });
    });

    describe("Claiming prize", function () {
        it("All cards eventually win", async function () {
            const { regenBingo, donationAddress, signer1, signer2, fundWithLINK, provideRandomness } = await loadFixture(deployBingoFixture);

            await regenBingo.connect(signer1).mint({ value: mintPrice });

            const linkAmount = "302951757588516228";
            await fundWithLINK(linkAmount);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod({gasLimit: 400000})).wait();

            const requestId = await regenBingo.lastRequestId();
            await provideRandomness(requestId);

            for (let i = 0; i < 90; i++) {
                await regenBingo.drawNumber();
                await time.increase(drawNumberCooldownSeconds);
            }

            let winnerTokenId = await regenBingo.tokenByIndex(0);
            let contractBalanceBefore = await ethers.provider.getBalance(regenBingo.address);
            let donationBalanceBefore = await ethers.provider.getBalance(donationAddress);
            let winnerBalanceBefore = await ethers.provider.getBalance(signer1.address);

            expect(contractBalanceBefore).to.eq(mintPrice);

            await regenBingo.connect(signer2).claimPrize(winnerTokenId);

            expect(await ethers.provider.getBalance(regenBingo.address)).to.eq(0);
            expect(await ethers.provider.getBalance(donationAddress)).to.eq(
                donationBalanceBefore.add(mintPrice.div(2))
            );
            expect(await ethers.provider.getBalance(signer1.address)).to.eq(
                winnerBalanceBefore.add(mintPrice.div(2))
            );
        });

        it("Invalid cards can not claim", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await expect(regenBingo.claimPrize(0)).to.be.revertedWith("ERC721: invalid token ID");
        });

        it("Losing cards can not claim", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await regenBingo.mint({ value: mintPrice });

            await expect(regenBingo.claimPrize(await regenBingo.tokenByIndex(0))).to.be.revertedWith("INELIGIBLE");
        });
    });

    describe("SVG Generation", function () {
        // Format is like the following:
        // Donating 0.1 ETH · Donation Name · 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc · January 29, 2023 05:28 UTC
        it("Rolling text test (Donating)", async function() {
            const { regenBingo, donationAddress, drawTimestamp, donationName } = await loadFixture(deployBingoFixture);
            const donationAmount = String(ethers.utils.formatEther(String(Number(mintPrice) / 2)));
            const MONTHS = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"];

            const tx = await regenBingo.mint({ value: mintPrice });
            await tx.wait();

            const tokenId = await regenBingo.tokenByIndex(0);
            
            const tokenURI = await regenBingo.tokenURI(tokenId);
            const decodedTokenURI = JSON.parse(Buffer.from(tokenURI.split(',')[1], 'base64').toString());
            const decodedImage = Buffer.from(decodedTokenURI['image'].split(',')[1], 'base64').toString();
            
            const date = new Date(drawTimestamp * 1000);
            let hours = date.getUTCHours();
            let hoursPaddedString;
            if (hours < 10) {
                hoursPaddedString = "0" + hours;
            } else {
                hoursPaddedString = "" + hours;
            }
            let minutes = date.getUTCMinutes();
            let minutesPaddedString;
            if (minutes < 10) {
                minutesPaddedString = "0" + minutes;
            } else {
                minutesPaddedString = "" + minutes;
            }

            const dateString = MONTHS[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear() + ' ' + hoursPaddedString + ':' + minutesPaddedString + ' UTC';
            const expectedRollingText = 'Donating ' + donationAmount + ' ETH · ' + donationName + ' · ' + String(donationAddress).toLowerCase() + ' · ' + dateString;
            const foundRollingText = decodedImage.match(/Donat.*UTC/)?.toString();

            expect(expectedRollingText).to.equal(foundRollingText);
        })
    })
});
