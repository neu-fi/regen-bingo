// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IRegenBingoMetadata.sol";
import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";

contract RegenBingo is ERC721Enumerable, VRFV2WrapperConsumerBase {
    using Strings for uint256;
    using EnumerableSet for EnumerableSet.UintSet;

    enum BingoState {
        MINT,
        DRAW,
        FINISHED
    }

    // Bingo Card layouts.
    // Cells have the following format: [lowest_available_number, possible_options]
    // Given a seed, a number in the cell could be calculated as:
    // lowest_available_number + (seed % possible_options)
    // Following these rules: https://en.wikipedia.org/wiki/Bingo_card#90-ball_bingo_cards
    // Using these as templates: https://www.scribd.com/document/325121782/1-90-British-Bingo-Cards
    uint256 constant LAYOUTS_COUNT = 3;
    uint8[2][9][3][LAYOUTS_COUNT] LAYOUTS = [
        [
            [[ 1, 9], [ 0, 0], [ 0, 0], [ 0, 0], [40, 5], [56, 4], [60,10], [77, 3], [ 0, 0]],
            [[ 0, 0], [ 0, 0], [ 0, 0], [30,10], [45, 5], [53, 3], [ 0, 0], [74, 3], [80, 6]],
            [[ 0, 0], [10,10], [20,10], [ 0, 0], [ 0, 0], [50, 3], [ 0, 0], [70, 4], [86, 5]]
        ],
        [
            [[ 6, 4], [10, 5], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [66, 4], [75, 5], [80,11]],
            [[ 0, 0], [ 0, 0], [25, 5], [30,10], [40,10], [50,10], [63, 3], [ 0, 0], [ 0, 0]],
            [[ 1, 5], [15, 5], [20, 5], [ 0, 0], [ 0, 0], [ 0, 0], [60, 3], [70, 5], [ 0, 0]]
        ],
        [
            [[ 1, 5], [ 0, 0], [25, 5], [ 0, 0], [ 0, 0], [50,10], [ 0, 0], [70, 5], [88, 3]],
            [[ 0, 0], [10,10], [20, 5], [30,10], [ 0, 0], [ 0, 0], [65, 5], [ 0, 0], [84, 4]],
            [[ 6, 4], [ 0, 0], [ 0, 0], [ 0, 0], [40,10], [ 0, 0], [60, 5], [75, 5], [80, 4]]
        ]
    ];

    uint32 constant VRF_CALLBACK_GAS_LIMIT = 100000;
    uint16 constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint32 constant VRF_NUMBER_OF_WORDS = 1;
    uint256 constant VRF_REREQUEST_COOLDOWN_BLOCKS = 1000;

    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    IRegenBingoMetadata metadataGenerator;

    BingoState public bingoState;
    uint256 public mintPrice;
    uint256 public drawTimestamp;
    uint256 public drawNumberCooldownSeconds;
    uint256 public lastDrawTime;
    string public donationName;
    address payable public donationAddress;
    EnumerableSet.UintSet private drawnNumbers;

    // Chainlink VRF
    uint256 lastRequestBlockNumber;
    uint256 public lastRequestId;
    uint256 public drawSeed;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event DrawNumber(uint256 number);
    event ClaimPrize(uint256 tokenId, address winner);
    event DrawStarted();

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _mintPrice,
        uint256 _drawTimestamp,
        uint256 _drawNumberCooldownSeconds,
        string memory _donationName,
        address payable _donationAddress,
        address _metadataGenerator,
        address _linkAddress,
        address _wrapperAddress
    )
        ERC721(_name, _symbol)
        VRFV2WrapperConsumerBase(_linkAddress, _wrapperAddress)
    {
        mintPrice = _mintPrice;
        drawTimestamp = _drawTimestamp;
        drawNumberCooldownSeconds = _drawNumberCooldownSeconds;
        donationName = _donationName;
        donationAddress = _donationAddress;
        metadataGenerator = IRegenBingoMetadata(_metadataGenerator);
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function mint() external payable {
        require(bingoState == BingoState.MINT, "Minting has ended");
        require(msg.value == mintPrice, "Incorrect payment");
        _mint(msg.sender, totalSupply() + 1);
    }

    function mintMultiple(uint256 count, address to) external payable {
        require(bingoState == BingoState.MINT, "Minting has ended");
        require(msg.value == count * mintPrice, "Incorrect payment");
        for (uint256 i = 0; i < count; i++) {
            _mint(to, totalSupply() + 1);
        }
    }

    function drawNumber() external returns (uint256) {
        require(bingoState == BingoState.DRAW, "Draw has not started");
        require(
            lastDrawTime + drawNumberCooldownSeconds <= block.timestamp,
            "Draw too soon"
        );
        require(drawSeed != 0, "Waiting for the random seed");

        uint256 nonce = 0;
        uint256 number = 1 +
            (uint256(
                keccak256(
                    abi.encodePacked(
                        drawSeed,
                        nonce
                    )
                )
            ) % 90);

        while (drawnNumbers.contains(number)) {
            number =
                1 +
                (uint256(
                    keccak256(
                        abi.encodePacked(
                            drawSeed,
                            nonce
                        )
                    )
                ) % 90);
            nonce++;
        }

        drawnNumbers.add(number);
        lastDrawTime = block.timestamp;
        emit DrawNumber(number);
        return number;
    }

    function claimPrize(uint256 tokenId) external {
        require(bingoState != BingoState.FINISHED, "Game Over");
        _requireMinted(tokenId);
        require(coveredNumbers(tokenId) == 15, "INELIGIBLE");
        donationAddress.call{value: address(this).balance / 2}("");
        address payable winner = payable(ownerOf(tokenId));
        winner.call{value: address(this).balance}("");
        bingoState = BingoState.FINISHED;
        emit ClaimPrize(tokenId, winner);
    }

    function startDrawPeriod() external {
        require(bingoState == BingoState.MINT);
        require(drawTimestamp <= block.timestamp, "It is not draw period yet");

        bingoState = BingoState.DRAW;
        emit DrawStarted();
        _requestDrawSeed();
    }

    function rerequestDrawSeed() external {
        if (bingoState == BingoState.DRAW && drawSeed == 0 && lastRequestBlockNumber + VRF_REREQUEST_COOLDOWN_BLOCKS <= block.number) {
            _requestDrawSeed();
        }
    }

    /*//////////////////////////////////////////////////////////////
                          PUBLIC VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        return
            metadataGenerator.generateTokenURI(
                tokenId,
                numbers(tokenId),
                covered(tokenId),
                mintPrice / 2,
                donationName,
                donationAddress,
                bingoState == BingoState.FINISHED,
                drawTimestamp
            );
    }

    function numbers(uint256 tokenId)
        public
        view
        returns (uint256[9][3] memory numbers)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        uint256 tokenSeed = _tokenSeed(tokenId);
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                numbers[row][column] = getNumberByCoordinates(
                    tokenSeed,
                    row,
                    column
                );
            }
        }
    }

    function covered(uint256 tokenId)
        public
        view
        returns (bool[9][3] memory covered)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        uint256 tokenSeed = _tokenSeed(tokenId);
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                if (
                    drawnNumbers.contains(
                        getNumberByCoordinates(tokenSeed, row, column)
                    )
                ) {
                    covered[row][column] = true;
                }
            }
        }
    }

    function coveredNumbers(uint256 tokenId)
        public
        view
        returns (uint256 count)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        uint256 tokenSeed = _tokenSeed(tokenId);
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                if (
                    drawnNumbers.contains(
                        getNumberByCoordinates(tokenSeed, row, column)
                    )
                ) {
                    count++;
                }
            }
        }
    }

    function getNumberByCoordinates(
        uint256 tokenSeed,
        uint256 row,
        uint256 column
    ) public view returns (uint256) {
        uint8[2][9][3] memory layout = LAYOUTS[tokenSeed % LAYOUTS_COUNT];
        if (layout[row][column][0] == 0) {
            return 0;
        } else {
            return layout[row][column][0] + (tokenSeed % layout[row][column][1]);
        }
    }

    function getDrawnNumbers() public view returns (uint256[] memory) {
        return drawnNumbers.values();
    }

    /*//////////////////////////////////////////////////////////////
                          INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function _tokenSeed(uint256 tokenId)
        internal
        view
        returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(address(this), tokenId)));
    }
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        if (drawSeed == 0 && _requestId == lastRequestId) {
            drawSeed = _randomWords[0];
        }
    }

    function _requestDrawSeed() internal {
        lastRequestBlockNumber = block.number;
        uint256 requestId = requestRandomness(
            VRF_CALLBACK_GAS_LIMIT,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_NUMBER_OF_WORDS
        );
        lastRequestId = requestId;
    }
}
