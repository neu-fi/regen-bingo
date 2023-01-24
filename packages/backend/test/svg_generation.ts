import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RegenBingoSVG", function () {

  async function deployRegenBingoSVGFixture() {

    const DateTime = await ethers.getContractFactory("contracts/DateTimeContract.sol:DateTimeContract");
    const dateTime = await DateTime.deploy();
    await dateTime.deployed();

    const RegenBingoSVG = await ethers.getContractFactory("contracts/RegenBingoSVG.sol:RegenBingoSVG");
    const regenBingoSVG = await RegenBingoSVG.deploy(dateTime.address);

    return { regenBingoSVG };
  }

  async function deployExposedRegenBingoSVGFixture() {
    
    const DateTime = await ethers.getContractFactory("contracts/DateTimeContract.sol:DateTimeContract");
    const dateTime = await DateTime.deploy();
    await dateTime.deployed()

    const RegenBingoSVG = await ethers.getContractFactory("contracts-exposed/RegenBingoSVG.sol:$RegenBingoSVG");
    const regenBingoSVG = await RegenBingoSVG.deploy(dateTime.address);

    return { regenBingoSVG };
  }

  describe("Deployment", function () {
    it("Deployment test", async function () {
      const { regenBingoSVG } = await loadFixture(deployRegenBingoSVGFixture);

      console.log("regenBingoMetadata address is: ", regenBingoSVG.address);
    });
  });

  describe("GenerateImageSVG", function () {
      it('Ether to wei: 1 ether', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1e18));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        console.log("1e18 wei is: ", ether)
      })
      it('Ether to wei: 0.1 ether', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1e17));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        console.log("1e17 wei is: ", ether)
      })
      it('Ether to wei: 0.01 ether', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1e16));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        console.log("1e16 wei is: ", ether)
      })
      it('Ether to wei: 0.001 ether', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1e15));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        console.log("1e15 wei is: ", ether)
      })
      it('Ether to wei: 0.005 ether', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1e15 * 5));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        console.log("1e15 * 5 wei is: ", ether)
      })
  })

});
