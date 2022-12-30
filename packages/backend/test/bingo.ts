import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

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

        it("does not allow minting with incorrect payment", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await expect(bingo.mint({ value: ethers.utils.parseEther("0.2") })).to.be.revertedWith(
                "Incorrect payment amount"
            );

            await expect(bingo.mint({ value: ethers.utils.parseEther("0.05") })).to.be.revertedWith(
                "Incorrect payment amount"
            );
        });

        it("does not allow minting after draw", async function () {
            const { bingo } = await loadFixture(deployBingoFixture);

            await time.increase(3600);

            await expect(bingo.mint({ value: ethers.utils.parseEther("0.1") })).to.be.revertedWith(
                "Draw already started"
            );
        });
    });
});
