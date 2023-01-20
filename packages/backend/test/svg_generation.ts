import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RegenBingoSVG", function () {

  async function deployRegenBingoSVGFixture() {

    const RegenBingoSVG = await ethers.getContractFactory("contracts/RegenBingoSVG.sol:RegenBingoSVG");
    const regenBingoSVG = await RegenBingoSVG.deploy();

    return { regenBingoSVG };
  }

  describe("Deployment", function () {
    it("Deployment test", async function () {
      const { regenBingoSVG } = await loadFixture(deployRegenBingoSVGFixture);

      console.log("regenBingoMetadata address is: ", regenBingoSVG.address);
    });
  });

  describe("GenerateImageSVG", function () {
    it("Image SVG test: 9 number 3 of them lucky", async function () {
      const { regenBingoSVG } = await loadFixture(deployRegenBingoSVGFixture);

      const tokenId = 0;
      const numbers = [[1,2,3,0,0,0,0,0,0],[0,0,0,1,2,3,0,0,0],[0,0,0,0,0,0,1,2,3]];
      const covered = [[1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1]];

      const svg = await regenBingoSVG.generateTokenSVG(tokenId, numbers, covered);
      console.log("Token svg is: ", svg);
    })
    it("Image SVG test: 9 two digits number 3 of them lucky", async function () {
        const { regenBingoSVG } = await loadFixture(deployRegenBingoSVGFixture);

        const tokenId = 1;
        const numbers = [[11,12,13,0,0,0,0,0,0],[0,0,0,11,12,13,0,0,0],[0,0,0,0,0,0,11,12,13]];
        const covered = [[1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1]];
  
        const svg = await regenBingoSVG.generateTokenSVG(tokenId, numbers, covered);
        console.log("Token svg is: ", svg);
      })
      it("Image SVG test: 9 number all of them lucky", async function () {
        const { regenBingoSVG } = await loadFixture(deployRegenBingoSVGFixture);
        
        const tokenId = 2;
        const numbers = [[11,12,13,0,0,0,0,0,0],[0,0,0,11,12,13,0,0,0],[0,0,0,0,0,0,11,12,13]];
        const covered = [[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1]];
  
        const svg = await regenBingoSVG.generateTokenSVG(tokenId, numbers, covered);
        console.log("Token svg is: ", svg);
      })
      it("Image SVG test: No number but all of them lucky", async function () {
        const { regenBingoSVG } = await loadFixture(deployRegenBingoSVGFixture);
  
        const tokenId = 3;
        const numbers = [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]];
        const covered = [[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1]];
  
        const svg = await regenBingoSVG.generateTokenSVG(tokenId, numbers, covered);
        console.log("Token svg is: ", svg);
      })
  })

});
