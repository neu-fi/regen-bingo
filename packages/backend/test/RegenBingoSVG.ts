import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe('RegenBingoSVG', function () {

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

  describe('ETH converter', function () {
      it('Ether to wei: 1 ether', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1e18));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        expect(ether).to.equal('1.00 ETH');
      })
      it('Ether to wei: 0.1 ether', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1e17));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        expect(ether).to.equal('0.1 ETH');
      })
      it('Ether to wei: 0.005 ether', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1e15 * 5));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        expect(ether).to.equal('0.005 ETH');
      })
      it('Ether to wei: 1 wei', async function () {
        const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

        const wei = ethers.BigNumber.from(String(1));
        const ether = await regenBingoSVG.$_convertWEIToEtherInString(ethers.BigNumber.from(wei));
        expect(ether).to.equal('0.000000000000000001 ETH');
      })
  })

  describe('Rolling Text Generator', function () {
    it('Game is finished (Donated)', async function () {
      const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

      const args = [
        ethers.BigNumber.from(String(1e18)),
        'Gitcoin Alpha Round',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        true,
        ethers.BigNumber.from(String(Number(Date.now())))
      ]

      const rollingText = await regenBingoSVG.$_generateRollingText(...args);
      const donationStatusText = rollingText.split(' ')[0];

      expect(donationStatusText).to.equal('Donated');
    });
    
    it('Game is not finished (Donating)', async function () {
      const { regenBingoSVG } = await loadFixture(deployExposedRegenBingoSVGFixture);

      const args = [
        ethers.BigNumber.from(String(1e18)),
        'Gitcoin Alpha Round',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        false,
        ethers.BigNumber.from(String(Number(Date.now())))
      ];

      const rollingText = await regenBingoSVG.$_generateRollingText(...args);
      const donationStatusText = rollingText.split(' ')[0];

      expect(donationStatusText).to.equal('Donating');
    });
  });


});
