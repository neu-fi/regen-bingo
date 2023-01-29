import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RegenBingoMetadata", function () {

  async function deployRegenBingoMetadataFixture() {

    const DateTime = await ethers.getContractFactory("BokkyPooBahsDateTimeContract");
    const dateTime = await DateTime.deploy();

    const RegenBingoSVG = await ethers.getContractFactory("RegenBingoSVG");
    const regenBingoSVG = await RegenBingoSVG.deploy(dateTime.address);

    const RegenBingoMetadata = await ethers.getContractFactory("RegenBingoMetadata");
    const regenBingoMetadata = await RegenBingoMetadata.deploy(regenBingoSVG.address);

    return { regenBingoMetadata };
  }

  describe("Generate Metadata", function () {
    it("Contract URI", async function () {
      const { regenBingoMetadata } = await loadFixture(deployRegenBingoMetadataFixture);

      const URI = await regenBingoMetadata.generateContractURI();
      const splittedURI = URI.split(',')[1];
      const expectedURI = '{"name":"RegenBingo","description":"RegenBingo is a simple experimental game to raise ETH for public goods funding while entertaining us greenpilled regens.","image":"...","external_url":"https://www.regen.bingo"}';
      const encodedExpectedURI = Buffer.from(expectedURI).toString('base64');
      console.log()
      expect(encodedExpectedURI).to.equal(splittedURI);
    });

  });
});
