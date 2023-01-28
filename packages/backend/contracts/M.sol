// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";
import "hardhat/console.sol";

contract M is ConfirmedOwner, VRFV2WrapperConsumerBase {
    uint32 constant public VRF_CALLBACK_GAS_LIMIT = 500000;
    uint16 constant public VRF_REQUEST_CONFIRMATIONS = 3;
    uint32 constant public VRF_NUMBER_OF_WORDS = 1;
    uint256 constant public VRF_REREQUEST_COOLDOWN_BLOCKS = 100;

    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    
    uint256 lastRequestBlockNumber;
    uint256 public lastRequestId;
    uint256 public drawSeed;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event WhatWeWant();

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _linkAddress,
        address _wrapperAddress
    )
        ConfirmedOwner(msg.sender)
        VRFV2WrapperConsumerBase(_linkAddress, _wrapperAddress)
    {
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        console.log("WhatWeWant");
        console.log(_requestId);
        console.log(lastRequestId);
        console.log(_randomWords[0]);
        console.log(drawSeed);
        if (drawSeed == 0 && _requestId == lastRequestId) {
            drawSeed = _randomWords[0];
            console.log("updated drawSeed");
            console.log(drawSeed);
            console.log("updated drawSeed");
        }
        console.log("WhatWeWant");
        emit WhatWeWant();
    }

    function _requestDrawSeed() public {
        console.log("_requestDrawSeed");
        uint256 balance = LINK.balanceOf(address(this));
        uint256 price = VRF_V2_WRAPPER.calculateRequestPrice(VRF_CALLBACK_GAS_LIMIT);
        require (price <= balance, "Unsufficient LINK balance");
        uint256 requestId = requestRandomness(
            VRF_CALLBACK_GAS_LIMIT,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_NUMBER_OF_WORDS
        );
        lastRequestId = requestId;
        lastRequestBlockNumber = block.number;
        console.log(lastRequestBlockNumber);
        console.log(drawSeed);
        console.log("_requestDrawSeed");
    }
}
