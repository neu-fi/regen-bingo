import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { network } from "hardhat";

const name = "RegenBingo";
const symbol = "BINGO";
const mintPrice = ethers.utils.parseEther("0.1");
const drawNumberCooldownSeconds = 60 * 5; // 5 minutes

describe("RegenBingo", function () {
    async function deployBingoFixture() {

        const DateTime = await ethers.getContractFactory("contracts/DateTimeContract.sol:DateTimeContract");
        const dateTime = await DateTime.deploy();
        await dateTime.deployed();

        const [signer1, signer2, signer3] = await ethers.getSigners();
        const drawTimestamp = (await time.latest()) + 3600;
        const donationAddress = signer3.address;
        const donationName = 'The Gitcoin Alpha Round';

        const RegenBingoSVG = await ethers.getContractFactory("RegenBingoSVG");
        const regenBingoSVG = await RegenBingoSVG.deploy(dateTime.address);
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

        return { regenBingo, signer1, signer2, donationAddress, donationName, drawTimestamp };
    }

    describe("Deployment", function () {
        it("Should set constructor arguments correctly", async function () {
            const { regenBingo, donationAddress, donationName, drawTimestamp } = await loadFixture(deployBingoFixture);

            expect(await regenBingo.name()).to.equal(name);
            expect(await regenBingo.symbol()).to.equal(symbol);
            expect(await regenBingo.mintPrice()).to.equal(mintPrice);
            expect(await regenBingo.drawTimestamp()).to.equal(drawTimestamp);
            expect(await regenBingo.drawNumberCooldownSeconds()).to.equal(drawNumberCooldownSeconds);
            expect(await regenBingo.donationAddress()).to.equal(donationAddress);
            expect(await regenBingo.donationName()).to.equal(donationName);
        });
    });

    describe("Minting", function () {
        it("Mints correctly", async function () {
            const { regenBingo, signer1 } = await loadFixture(deployBingoFixture);

            await regenBingo.mint({ value: ethers.utils.parseEther("0.1") });

            expect(await regenBingo.balanceOf(signer1.address)).to.equal(1);
            expect(await regenBingo.totalSupply()).to.equal(1);
            expect(await regenBingo.ownerOf(0)).to.equal(signer1.address);
        });

        it("Does not allow minting with incorrect payment", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await expect(regenBingo.mint({ value: ethers.utils.parseEther("0.2") })).to.be.revertedWith(
                "Incorrect payment amount"
            );

            await expect(regenBingo.mint({ value: ethers.utils.parseEther("0.05") })).to.be.revertedWith(
                "Incorrect payment amount"
            );
        });

        it("Does not allow minting after draw", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            await expect(regenBingo.mint({ value: ethers.utils.parseEther("0.1") })).to.be.revertedWith(
                "Draw already started"
            );
        });

        it("Different users get different seeds in same block", async function () {
            const { regenBingo, signer1, signer2 } = await loadFixture(deployBingoFixture);

            await network.provider.send("evm_setAutomine", [false]);

            await regenBingo.connect(signer1).mint({ value: ethers.utils.parseEther("0.1") });
            await regenBingo.connect(signer2).mint({ value: ethers.utils.parseEther("0.1") });

            await network.provider.send("evm_mine");

            await network.provider.send("evm_setAutomine", [true]);

            expect(await regenBingo.getSeed(0)).to.not.equal(0);
            expect(await regenBingo.getSeed(1)).to.not.equal(0);
            expect(await regenBingo.getSeed(0)).to.not.equal(await regenBingo.getSeed(1));
        });

        it("User gets different seeds in one block", async function () {
            const { regenBingo, signer1 } = await loadFixture(deployBingoFixture);

            await network.provider.send("evm_setAutomine", [false]);

            await regenBingo.connect(signer1).mint({ value: ethers.utils.parseEther("0.1") });
            await regenBingo.connect(signer1).mint({ value: ethers.utils.parseEther("0.1") });

            await network.provider.send("evm_mine");

            await network.provider.send("evm_setAutomine", [true]);

            expect(await regenBingo.getSeed(0)).to.not.equal(0);
            expect(await regenBingo.getSeed(1)).to.not.equal(0);
            expect(await regenBingo.getSeed(0)).to.not.equal(await regenBingo.getSeed(1));
        });
    });

    describe("Drawing numbers", function () {
        it("Draws one number correctly", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            let tx = await regenBingo.drawNumber();

            let receipt = await tx.wait();

            let drawnNumber = Number(receipt.events[0].data);

            expect(drawnNumber).to.be.within(1, 90);
            expect(await regenBingo.lastDrawTime()).to.equal(await time.latest());
            expect(await regenBingo.isDrawn(drawnNumber)).to.equal(true);
        });

        it("Draws multiple numbers correctly", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            await regenBingo.drawNumber();

            await time.increase(60 * 5);

            let tx = await regenBingo.drawNumber();

            let receipt = await tx.wait();

            let drawnNumber = Number(receipt.events[0].data);

            expect(drawnNumber).to.be.within(1, 90);
            expect(await regenBingo.lastDrawTime()).to.equal(await time.latest());
            expect(await regenBingo.isDrawn(drawnNumber)).to.equal(true);
        });

        it("Does not allow drawing number before drawTimestamp", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await expect(regenBingo.drawNumber()).to.be.revertedWith("Draw not started yet");
        });

        it("Does not allow drawing number before drawNumberCooldownSeconds", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            await regenBingo.drawNumber();

            await expect(regenBingo.drawNumber()).to.be.revertedWith("Draw too soon");
        });
    });

    describe("Claiming prize", function () {
        it("Any card eventually wins", async function () {
            const { regenBingo, donationAddress, signer2 } = await loadFixture(deployBingoFixture);

            await regenBingo.mint({ value: ethers.utils.parseEther("0.1") });
            await time.increase(3600);

            for (let i = 0; i < 90; i++) {
                await regenBingo.drawNumber();
                await time.increase(60 * 5);
            }

            let winner = await regenBingo.ownerOf(0);
            let bingoBalanceBefore = await ethers.provider.getBalance(regenBingo.address);
            let donationBalanceBefore = await ethers.provider.getBalance(donationAddress);
            let winnerBalanceBefore = await ethers.provider.getBalance(winner);

            expect(bingoBalanceBefore).to.eq(ethers.utils.parseEther("0.1"));

            await regenBingo.connect(signer2).claimPrize(0);

            expect(await ethers.provider.getBalance(regenBingo.address)).to.eq(0);
            expect(await ethers.provider.getBalance(donationAddress)).to.eq(
                donationBalanceBefore.add(ethers.utils.parseEther("0.05"))
            );
            expect(await ethers.provider.getBalance(winner)).to.eq(
                winnerBalanceBefore.add(ethers.utils.parseEther("0.05"))
            );
        });

        it("Invalid cards can not claim", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await expect(regenBingo.claimPrize(0)).to.be.revertedWith("ERC721: invalid token ID");
        });

        it("Losing cards can not claim", async function () {
            const { regenBingo } = await loadFixture(deployBingoFixture);

            await regenBingo.mint({ value: ethers.utils.parseEther("0.1") });

            await expect(regenBingo.claimPrize(0)).to.be.revertedWith("INELIGIBLE");
        });
    });
});
