import { expect } from "chai";
import { ethers } from "hardhat";
import { impersonateAccount, loadFixture, mine} from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";

// See the following test for similar examples:
// https://github.com/smartcontractkit/hardhat-starter-kit/blob/main/test/unit/RandomNumberDirectFundingConsumer.spec.js
describe("Chainlink contract integrations", function () {
    async function deployBingoFixture() {
        const [signer1, signer2] = await ethers.getSigners();

        // Deploymnets //

        const LinkTokenFactory = await ethers.getContractFactory("LinkToken");
        const linkToken = await LinkTokenFactory.deploy();
        await linkToken.deployed();

        const coordinatorFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        const vrfCoordinatorV2Mock = await coordinatorFactory.deploy(
            BigNumber.from('100000000000000000'), // 0.1 LINK
            1e9, // 0.000000001 LINK per gas
        );
        await vrfCoordinatorV2Mock.deployed();

        const mockV3AggregatorFactory = await ethers.getContractFactory("MockV3Aggregator");
        const mockV3Aggregator = await mockV3AggregatorFactory.deploy(
            18,
            BigNumber.from(String(3e16)) // 0.003
        );
        await mockV3Aggregator.deployed();

        const wrapperFactory = await ethers.getContractFactory("VRFV2Wrapper");
        const vrfV2Wrapper = await wrapperFactory.deploy(
            linkToken.address,
            mockV3Aggregator.address,
            vrfCoordinatorV2Mock.address
        );
        await vrfV2Wrapper.deployed();

        const M = await ethers.getContractFactory("M");
        const m = await M.deploy(
            linkToken.address,
            vrfV2Wrapper.address
        );
        await m.deployed();

        // Configurations //

        const wrapperGasOverhead = BigNumber.from(60_000)
        const coordinatorGasOverhead = BigNumber.from(52_000)
        const wrapperPremiumPercentage = 10
        const maxNumWords = 10

        await (await vrfV2Wrapper.connect(signer1).setConfig(
            wrapperGasOverhead,
            coordinatorGasOverhead,
            wrapperPremiumPercentage,
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
            maxNumWords
        )).wait();
        
        console.log("signer1")
        console.log("x")
        console.log(signer1.address)
        console.log((await linkToken.balanceOf(signer1.address)).toString())
        console.log("signer1")

        // fund subscription. The Wrapper's subscription id is 1
        await (await vrfCoordinatorV2Mock.connect(signer1).fundSubscription(1, BigNumber.from(String(100 * 1e18)))).wait() // 100 LINK

        console.log("await vrfCoordinatorV2Mock.getSubscription(1)")
        console.log(await vrfCoordinatorV2Mock.getSubscription(1))
        console.log("await vrfCoordinatorV2Mock.getSubscription(1)")

        console.log("signer1")
        console.log("y")
        console.log(signer1.address)
        console.log((await linkToken.balanceOf(signer1.address)).toString())
        console.log("signer1")
        const linkAmount = "30295175758851622800";
        await (await linkToken.connect(signer1).transfer(m.address, linkAmount)).wait();

        console.log("signer1")
        console.log("z")
        console.log(signer1.address)
        console.log((await linkToken.balanceOf(signer1.address)).toString())
        console.log("signer1")

        return { m, signer1, signer2, linkToken, vrfCoordinatorV2Mock, vrfV2Wrapper };
    }
    describe("M", async function () {
        it("The minimal test", async function () {
            const { m, signer1, linkToken, vrfCoordinatorV2Mock, vrfV2Wrapper } = await loadFixture(deployBingoFixture);

            // {
            //     const lastRequestId = await m.lastRequestId();
            //     console.log("lastRequestId")
            //     console.log(lastRequestId)
            //     console.log("lastRequestId")
            // }

            // {
            //     const wrapperLinkBalance = await linkToken.balanceOf(vrfV2Wrapper.address);
            //     console.log("wrapperLinkBalance")
            //     console.log(wrapperLinkBalance)
            //     console.log("wrapperLinkBalance")
            // }

            // {
            //     const mLinkBalance = await linkToken.balanceOf(m.address);
            //     console.log("mLinkBalance")
            //     console.log(mLinkBalance)
            //     console.log("mLinkBalance")
            // }

            await m._requestDrawSeed();

            // {
            //     const lastRequestId = await m.lastRequestId();
            //     console.log("lastRequestId")
            //     console.log(lastRequestId)
            //     console.log("lastRequestId")
            // }≈

            // {
            //     const wrapperLinkBalance = await linkToken.balanceOf(vrfV2Wrapper.address);
            //     console.log("wrapperLinkBalance")
            //     console.log(wrapperLinkBalance)
            //     console.log("wrapperLinkBalance")
            // }

            // {
            //     const mLinkBalance = await linkToken.balanceOf(m.address);
            //     console.log("mLinkBalance")
            //     console.log(mLinkBalance)
            //     console.log("mLinkBalance")
            // }

            mine(await m.VRF_REQUEST_CONFIRMATIONS());

            // Add ETH to Coordinator to pay for gas
            await ethers.provider.send("hardhat_setBalance", [
                vrfCoordinatorV2Mock.address,
                "0x56BC75E2D63100000",
              ]);
            
            impersonateAccount(vrfCoordinatorV2Mock.address);
            let coordinator = await ethers.getSigner(vrfCoordinatorV2Mock.address);

            let rawTx = await vrfV2Wrapper.connect(coordinator).rawFulfillRandomWords(1, [42]);
            
            await expect( rawTx ).to.emit(m, "WhatWeWant");

            /*
            const rawTx = vrfCoordinatorV2Mock.connect(signer1).fulfillRandomWordsWithOverride(
                await m.lastRequestId(),
                vrfV2Wrapper.address,
                [42],
                {
                    gasLimit: await m.VRF_CALLBACK_GAS_LIMIT()
                }
            );
            */
            // await expect( rawTx )
            //     .to.emit(vrfCoordinatorV2Mock, "RandomWordsFulfilled")
            //     .to.emit(m, "WhatWeWant")

            const tx = await rawTx;
            const txReciept = await tx.wait(1);
            console.log("the transaction details are:");
            console.log(txReciept);

            const drawSeed = await m.drawSeed();
            console.log("drawSeed")
            console.log(drawSeed)
            console.log("drawSeed")
            
            expect(drawSeed).to.not.equal(BigNumber.from("0"));
        });
    });
});
