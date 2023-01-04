import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { network } from "hardhat";

describe("RegenBingo", function () {
    async function deployBingoFixture() {
        const RegenBingo = await ethers.getContractFactory("RegenBingo");
        const [addr1, addr2, charity] = await ethers.getSigners();

        const name = "RegenBingo";
        const symbol = "BINGO";
        const mintPrice = ethers.utils.parseEther("0.1");
        const drawTimestamp = (await time.latest()) + 3600;
        const drawInterval = 60 * 5; // 5 minutes
        const charityAddress = charity.address;

        const bingo = await RegenBingo.deploy(
            name,
            symbol,
            mintPrice,
            drawTimestamp,
            drawInterval,
            charityAddress
        );
        await bingo.deployed();

        return { bingo, addr1, addr2, charity, drawTimestamp };
    }

    describe("Deployment", function () {
        it("Should set constructor arguments correctly", async function () {
            const { bingo, charity, drawTimestamp } = await loadFixture(deployBingoFixture);

            expect(await bingo.name()).to.equal("RegenBingo");
            expect(await bingo.symbol()).to.equal("BINGO");
            expect(await bingo.mintPrice()).to.equal(ethers.utils.parseEther("0.1"));
            expect(await bingo.drawTimestamp()).to.equal(drawTimestamp);
            expect(await bingo.drawNumberCooldownSeconds()).to.equal(60 * 5);
            expect(await bingo.charityAddress()).to.equal(charity.address);
        });
    });

    describe("Minting", function () {
        it("Mints correctly", async function () {
            const { bingo, addr1 } = await loadFixture(deployBingoFixture);

            await bingo.mint({ value: ethers.utils.parseEther("0.1") });

            expect(await bingo.balanceOf(addr1.address)).to.equal(1);
            expect(await bingo.totalSupply()).to.equal(1);
            expect(await bingo.ownerOf(0)).to.equal(addr1.address);
        });

        it("Does not allow minting with incorrect payment", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await expect(bingo.mint({ value: ethers.utils.parseEther("0.2") })).to.be.revertedWith(
                "Incorrect payment amount"
            );

            await expect(bingo.mint({ value: ethers.utils.parseEther("0.05") })).to.be.revertedWith(
                "Incorrect payment amount"
            );
        });

        it("Does not allow minting after draw", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            await expect(bingo.mint({ value: ethers.utils.parseEther("0.1") })).to.be.revertedWith(
                "Draw already started"
            );
        });

        it("Different users get different seeds in same block", async function () {
            const { bingo, addr1, addr2 } = await loadFixture(deployBingoFixture);

            await network.provider.send("evm_setAutomine", [false]);

            await bingo.connect(addr1).mint({ value: ethers.utils.parseEther("0.1") });
            await bingo.connect(addr2).mint({ value: ethers.utils.parseEther("0.1") });

            await network.provider.send("evm_mine");

            await network.provider.send("evm_setAutomine", [true]);

            expect(await bingo.getSeed(0)).to.not.equal(0);
            expect(await bingo.getSeed(1)).to.not.equal(0);
            expect(await bingo.getSeed(0)).to.not.equal(await bingo.getSeed(1));
        });

        it("User gets different seeds in one block", async function () {
            const { bingo, addr1 } = await loadFixture(deployBingoFixture);

            await network.provider.send("evm_setAutomine", [false]);

            await bingo.connect(addr1).mint({ value: ethers.utils.parseEther("0.1") });
            await bingo.connect(addr1).mint({ value: ethers.utils.parseEther("0.1") });

            await network.provider.send("evm_mine");

            await network.provider.send("evm_setAutomine", [true]);

            expect(await bingo.getSeed(0)).to.not.equal(0);
            expect(await bingo.getSeed(1)).to.not.equal(0);
            expect(await bingo.getSeed(0)).to.not.equal(await bingo.getSeed(1));
        });
    });

    describe("Drawing numbers", function () {
        it("Draws one number correctly", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            let tx = await bingo.drawNumber();

            let receipt = await tx.wait();

            let drawnNumber = Number(receipt.events[0].data);

            expect(drawnNumber).to.be.within(1, 90);
            expect(await bingo.lastDrawTime()).to.equal(await time.latest());
            expect(await bingo.isDrawn(drawnNumber)).to.equal(true);
        });

        it("Draws multiple numbers correctly", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            await bingo.drawNumber();

            await time.increase(60 * 5);

            let tx = await bingo.drawNumber();

            let receipt = await tx.wait();

            let drawnNumber = Number(receipt.events[0].data);

            expect(drawnNumber).to.be.within(1, 90);
            expect(await bingo.lastDrawTime()).to.equal(await time.latest());
            expect(await bingo.isDrawn(drawnNumber)).to.equal(true);
        });

        it("Does not allow drawing number before drawTimestamp", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await expect(bingo.drawNumber()).to.be.revertedWith("Draw not started yet");
        });

        it("Does not allow drawing number before drawInterval", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            await bingo.drawNumber();

            await expect(bingo.drawNumber()).to.be.revertedWith("Draw too soon");
        });
    });

    describe("Claiming prize", function () {
        it("Any card eventually wins", async function () {
            const { bingo, charity, addr2 } = await loadFixture(deployBingoFixture);

            await bingo.mint({ value: ethers.utils.parseEther("0.1") });
            await time.increase(3600);

            for (let i = 0; i < 90; i++) {
                await bingo.drawNumber();
                await time.increase(60 * 5);
            }

            let winner = await bingo.ownerOf(0);
            let bingoBalanceBefore = await ethers.provider.getBalance(bingo.address);
            let charityBalanceBefore = await ethers.provider.getBalance(charity.address);
            let winnerBalanceBefore = await ethers.provider.getBalance(winner);

            expect(bingoBalanceBefore).to.eq(ethers.utils.parseEther("0.1"));

            await bingo.connect(addr2).claimPrize(0);

            expect(await ethers.provider.getBalance(bingo.address)).to.eq(0);
            expect(await ethers.provider.getBalance(charity.address)).to.eq(
                charityBalanceBefore.add(ethers.utils.parseEther("0.05"))
            );
            expect(await ethers.provider.getBalance(winner)).to.eq(
                winnerBalanceBefore.add(ethers.utils.parseEther("0.05"))
            );
        });

        it("Invalid cards can not claim", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await expect(bingo.claimPrize(0)).to.be.revertedWith("ERC721: invalid token ID");
        });

        it("Losing cards can not claim", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await bingo.mint({ value: ethers.utils.parseEther("0.1") });

            await expect(bingo.claimPrize(0)).to.be.revertedWith("INELIGIBLE");
        });
    });
});
