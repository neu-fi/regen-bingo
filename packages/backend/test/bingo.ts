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
        const drawTimestamp = await time.latest();
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

        return { bingo, addr1, addr2, charity };
    }

    describe("Deployment", function () {});
});
