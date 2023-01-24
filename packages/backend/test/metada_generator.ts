import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RegenBingoMetadata", function () {

  async function deployRegenBingoMetadataFixture() {

    const DateTime = await ethers.getContractFactory("contracts/DateTimeContract.sol:DateTimeContract");
    const dateTime = await DateTime.deploy();

    const RegenBingoSVG = await ethers.getContractFactory("contracts/RegenBingoSVG.sol:RegenBingoSVG");
    const regenBingoSVG = await RegenBingoSVG.deploy(dateTime.address);

    const RegenBingoMetadata = await ethers.getContractFactory("contracts/RegenBingoMetadata.sol:RegenBingoMetadata");
    const regenBingoMetadata = await RegenBingoMetadata.deploy(regenBingoSVG.address);

    return { regenBingoMetadata };
  }

  describe("Deployment", function () {
    it("Deployment test", async function () {
      const { regenBingoMetadata } = await loadFixture(deployRegenBingoMetadataFixture);

      console.log("regenBingoMetadata address is: ", regenBingoMetadata.address);
    });
  });

  describe("Generate Metadata", function () {
    it("Contract URI", async function () {
      const { regenBingoMetadata } = await loadFixture(deployRegenBingoMetadataFixture);

      const uri = await regenBingoMetadata.generateContractURI();
      console.log("Contract uri is: ", uri);
    })
    it("Token URI", async function () {
        const { regenBingoMetadata } = await loadFixture(deployRegenBingoMetadataFixture);
  
        const numbers = [[1,2,3,0,0,0,0,0,0],[0,0,0,1,2,3,0,0,0],[0,0,0,0,0,0,1,2,3]];
        const covered = [[1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1]];
        const tokenId = 1;
        const donationAmount = 100;
        const donationName = "The Gitcoin Alpha Round";
        const donationAddress = regenBingoMetadata.address;
        const isBingoFinished = true;
        const drawTimestamp = Math.floor(Date.now() / 1000);

        const uri = await regenBingoMetadata.generateTokenURI(tokenId, numbers, covered, donationAmount, donationName, donationAddress, isBingoFinished, drawTimestamp);
        console.log("Token uri is: ", uri);
      })
    });
});
