import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";

const name = "RegenBingo";
const symbol = "BINGO";
const mintPrice = ethers.utils.parseEther("0.2") ;
const drawCooldownSeconds = 60 * 60; // 1 hour
const drawNumberCooldownMultiplier = 3; // 3 seconds per numbers drawn

describe("RegenBingo", function () {
    async function deployBingoFixture() {
        const [signer1, signer2, signer3] = await ethers.getSigners();
        const firstDrawTimestamp = (await time.latest()) + drawCooldownSeconds;
        const donationName = "Donation Name";
        const donationAddress = signer3.address;

        // Deployments //

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

        const RegenBingo = await ethers.getContractFactory("$RegenBingo");
        const regenBingo = await RegenBingo.deploy(
            name,
            symbol,
            mintPrice,
            firstDrawTimestamp,
            drawNumberCooldownMultiplier,
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

        await (await linkToken.transfer(regenBingo.address, "302951757588516228")).wait(); //

        const startDrawPeriod = async () => {
            await time.increaseTo(Number(await regenBingo.firstDrawTimestamp()));
            await (await regenBingo.startDrawPeriod()).wait();
        }

        const provideRandomness = async (_requestId : BigNumber) => {
            const randomness = [(Math.random() * 1e10).toFixed()];

            await (await vrfCoordinatorV2Mock.fulfillRandomWordsWithOverride(
                _requestId,
                vrfV2Wrapper.address,
                randomness,
                {
                    gasLimit: 580000,
                }
            )).wait();
            return randomness.toString();
        }

        return { regenBingo, signer1, signer2, donationName, donationAddress, firstDrawTimestamp, vrfCoordinatorV2Mock, provideRandomness, startDrawPeriod};
    }

    describe("Deployment", function () {
        it("Should set constructor arguments correctly", async function () {
            const { regenBingo, donationAddress, firstDrawTimestamp } = await loadFixture(deployBingoFixture);

            expect(await regenBingo.name()).to.equal(name);
            expect(await regenBingo.symbol()).to.equal(symbol);
            expect(await regenBingo.mintPrice()).to.equal(mintPrice);
            expect(await regenBingo.firstDrawTimestamp()).to.equal(firstDrawTimestamp);
            expect(await regenBingo.drawNumberCooldownMultiplier()).to.equal(drawNumberCooldownMultiplier);
            expect(await regenBingo.donationAddress()).to.equal(donationAddress);
        });
    });

    describe("Minting", function () {
        it("Mints correctly", async function () {
            const { regenBingo, signer1 } = await loadFixture(deployBingoFixture);

            await regenBingo.mint(signer1.address, 1, { value: mintPrice });

            expect(await regenBingo.balanceOf(signer1.address)).to.equal(1);
            expect(await regenBingo.totalSupply()).to.equal(1);
        });

        it("Does not allow minting with incorrect payment", async function () {
            const { regenBingo, signer1 } = await loadFixture(deployBingoFixture);

            await expect(regenBingo.mint(signer1.address, 1, { value: 0 })).to.be.revertedWith(
                "Incorrect payment"
            );

            await expect(regenBingo.mint(signer1.address, 1, { value: mintPrice.mul(2) })).to.be.revertedWith(
                "Incorrect payment"
            );
        });

        it("Does not allow minting after starting the draw period", async function () {
            const { regenBingo, signer1, startDrawPeriod, provideRandomness } = await loadFixture(deployBingoFixture);

            await startDrawPeriod();

            await expect(regenBingo.mint(signer1.address, 1, { value: mintPrice })).to.be.revertedWith(
                "Not minting"
            );
        });
    });

    describe("Drawing numbers", function () {
        it("Can start the draw period", async function() {
            const { regenBingo, startDrawPeriod, provideRandomness } = await loadFixture(deployBingoFixture);

            await startDrawPeriod();

            const requestId = await regenBingo.$lastRequestId();
            await provideRandomness(requestId);

            expect(await regenBingo.bingoState()).to.equal(BigNumber.from("1"));

        })
        it("Sets seed to VRF response", async function () {
            const { regenBingo, startDrawPeriod, provideRandomness } = await loadFixture(deployBingoFixture);

            await startDrawPeriod();

            const requestId = await regenBingo.$lastRequestId();
            let randomness = await provideRandomness(requestId);

            expect(await regenBingo.$drawSeed()).not.to.equal(BigNumber.from("0"));
            expect(await regenBingo.$drawSeed()).to.equal(BigNumber.from(randomness));
        });
        it("Draws one number correctly", async function () {
            const { regenBingo, startDrawPeriod, provideRandomness } = await loadFixture(deployBingoFixture);

            await startDrawPeriod();

            const requestId = await regenBingo.$lastRequestId();
            await provideRandomness(requestId);

            let tx = await regenBingo.drawNumber();
            let receipt = await tx.wait();
            let drawnNumber = Number(receipt.events[0].data);

            expect(drawnNumber).to.be.within(1, 90);
            expect(await regenBingo.getDrawnNumbers()).deep.includes(drawnNumber); 
        });

        it("Draws multiple numbers correctly", async function () {
            const { regenBingo, startDrawPeriod, provideRandomness } = await loadFixture(deployBingoFixture);

            await startDrawPeriod();

            const requestId = await regenBingo.$lastRequestId();
            await provideRandomness(requestId);

            let tx1 = await regenBingo.drawNumber();
            let receipt1 = await tx1.wait();
            let drawnNumber1 = Number(receipt1.events[0].data);

            await time.increaseTo(Number(await regenBingo.nextDrawTimestamp()));
            let tx2 = await regenBingo.drawNumber();
            let receipt2 = await tx2.wait();
            let drawnNumber2 = Number(receipt2.events[0].data);

            expect(drawnNumber1).to.be.within(1, 90);
            expect(await regenBingo.getDrawnNumbers()).deep.includes(drawnNumber1);

            expect(drawnNumber2).to.be.within(1, 90);
            expect(await regenBingo.getDrawnNumbers()).deep.includes(drawnNumber2);
        });

        it("Does not allow drawing numbers before the draw", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await expect(regenBingo.drawNumber()).to.be.revertedWith("Not drawing");
        });

        it("Does not allow drawing number before firstDrawTimestamp", async function () {
            const { regenBingo, startDrawPeriod, provideRandomness } = await loadFixture(deployBingoFixture);

            await startDrawPeriod();

            await regenBingo.drawNumber();
            await expect(regenBingo.drawNumber()).to.be.revertedWith("Waiting the cooldown");
        });
    });

    describe("Claiming prize", function () {
        it("Draws all numbers, a card eventually win", async function () {
            const { regenBingo, donationAddress, signer1, signer2, startDrawPeriod, provideRandomness } = await loadFixture(deployBingoFixture);

            await regenBingo.connect(signer1).mint(signer1.address, 1, { value: mintPrice });

            await startDrawPeriod();

            const requestId = await regenBingo.$lastRequestId();
            await provideRandomness(requestId);

            for (let i = 0; i < 90; i++) {
                await regenBingo.drawNumber();
                await time.increaseTo(Number(await regenBingo.nextDrawTimestamp()));
            }

            let winnerTokenId = 1;
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

        it("Cannot claim before the game starts", async function () {
            const { regenBingo, signer1 } = await loadFixture(deployBingoFixture);

            await regenBingo.mint(signer1.address, 1, { value: mintPrice });

            await expect(regenBingo.claimPrize(1)).to.be.revertedWith("Not drawing");
        });

        it("Invalid cards can not claim", async function () {
            const { regenBingo, startDrawPeriod } = await loadFixture(deployBingoFixture);
            
            await startDrawPeriod();

            await expect(regenBingo.claimPrize(0)).to.be.revertedWith("Invalid token ID");
            await expect(regenBingo.claimPrize(1)).to.be.revertedWith("Invalid token ID");
            await expect(regenBingo.claimPrize(42)).to.be.revertedWith("Invalid token ID");
        });

        it("Losing cards can not claim", async function () {
            const { regenBingo, signer1, startDrawPeriod } = await loadFixture(deployBingoFixture);

            await regenBingo.mint(signer1.address, 1, { value: mintPrice });
            
            await startDrawPeriod();

            await expect(regenBingo.claimPrize(1)).to.be.revertedWith("Ineligible");
        });
    });

    describe("SVG Generation", function () {
        // Format is like the following:
        // Donating 0.1 ETH ?? Donation Name ?? 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc ?? January 29, 2023 05:28 UTC
        it("Rolling text test (Donating)", async function() {
            const { regenBingo, donationAddress, firstDrawTimestamp, donationName, signer1 } = await loadFixture(deployBingoFixture);
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
                "December"
            ];

            const tx = await regenBingo.mint(signer1.address, 1, { value: mintPrice });
            await tx.wait();

            const tokenURI = await regenBingo.tokenURI(1);
            console.log(tokenURI)
            const decodedTokenURI = JSON.parse(Buffer.from(tokenURI.split(',')[1], 'base64').toString());
            console.log(decodedTokenURI)
            const decodedImage = Buffer.from(decodedTokenURI['image'].split(',')[1], 'base64').toString();

            console.log(tokenURI)
            console.log(decodedTokenURI)
            
            const date = new Date(firstDrawTimestamp * 1000);
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
            const expectedRollingText = 'Donating ' + donationAmount + ' ETH ?? ' + donationName + ' ?? ' + String(donationAddress).toLowerCase() + ' ?? ' + dateString;
            const foundRollingText = decodedImage.match(/Donat.*UTC/)?.toString();

            expect(expectedRollingText).to.equal(foundRollingText);
        })
    })
});
