import { expect } from "chai";
import { ethers } from "hardhat";
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

        const DateTimeContract = await ethers.getContractFactory("DateTimeContract");
        const dateTimeContract = await DateTimeContract.deploy();
        await dateTimeContract.deployed();

        const RegenBingoSVG = await ethers.getContractFactory("RegenBingoSVG");
        const regenBingoSVG = await RegenBingoSVG.deploy(dateTimeContract.address);
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
            regenBingoMetadata.address
        );
        await regenBingo.deployed();

        return { regenBingo, signer1, signer2, donationAddress, drawTimestamp };
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
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();

            await expect(regenBingo.mint({ value: mintPrice })).to.be.revertedWith(
                "Minting has ended"
            );
        });
    });

    describe("Drawing numbers", function () {
        it("Draws one number correctly", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();
            let tx = await regenBingo.drawNumber();
            let receipt = await tx.wait();
            let drawnNumber = Number(receipt.events[0].data);

            expect(drawnNumber).to.be.within(1, 90);
            expect(await regenBingo.lastDrawTime()).to.equal(await time.latest());
            expect(await regenBingo.getDrawnNumbers()).deep.includes(BigNumber.from(drawnNumber));
        });

        it("Draws multiple numbers correctly", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();
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
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();

            await regenBingo.drawNumber();

            await expect(regenBingo.drawNumber()).to.be.revertedWith("Draw too soon");
        });
    });

    describe("Claiming prize", function () {
        it("All cards eventually win", async function () {
            const { regenBingo, donationAddress, signer1, signer2 } = await loadFixture(deployBingoFixture);

            await regenBingo.connect(signer1).mint({ value: mintPrice });

            await time.increase(drawCooldownSeconds);
            await (await regenBingo.startDrawPeriod()).wait();

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
});
