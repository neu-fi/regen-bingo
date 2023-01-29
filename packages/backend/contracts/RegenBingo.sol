// SPDX-License-Identifier: MIT
// @author Neufi Limited (neu.fi)

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";
import "erc721a/contracts/ERC721A.sol";
import "./interfaces/IRegenBingoMetadata.sol";

contract RegenBingo is ERC721A, VRFV2WrapperConsumerBase {
    enum BingoState {
        MINT,
        DRAW,
        FINISHED
    }

    // Bingo card layouts.
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

    // Drawn numbers have index of "90 - drawnNumbersCount" or larger in the "numbers" array.
    uint8[90] numbers = [
         1,  2,  3,  4,  5,  6,  7,  8,  9,  10,
        11, 12, 13, 14, 15, 16, 17, 18, 19,  20,
        21, 22, 23, 24, 25, 26, 27, 28, 29,  30,
        31, 32, 33, 34, 35, 36, 37, 38, 39,  40,
        41, 42, 43, 44, 45, 46, 47, 48, 49,  50,
        51, 52, 53, 54, 55, 56, 57, 58, 59,  60,
        61, 62, 63, 64, 65, 66, 67, 68, 69,  70,
        71, 72, 73, 74, 75, 76, 77, 78, 79,  80,
        81, 82, 83, 84, 85, 86, 87, 88, 89,  90
    ];
    uint8 public drawnNumbersCount;

    IRegenBingoMetadata metadataGenerator;

    BingoState public bingoState;
    uint256 public mintPrice;
    uint256 public firstDrawTimestamp;
    uint256 public nextDrawTimestamp;
    uint256 public drawNumberCooldownMultiplier;
    string public donationName;
    address payable public donationAddress;

    // Chainlink VRF
    uint256 lastRequestBlockNumber;
    uint256 lastRequestId;
    uint256 drawSeed;

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
        uint256 _firstDrawTimestamp,
        uint256 _drawNumberCooldownMultiplier,
        string memory _donationName,
        address payable _donationAddress,
        address _metadataGenerator,
        address _linkAddress,
        address _wrapperAddress
    )
        ERC721A(_name, _symbol)
        VRFV2WrapperConsumerBase(_linkAddress, _wrapperAddress)
    {
        mintPrice = _mintPrice;
        firstDrawTimestamp = _firstDrawTimestamp;
        drawNumberCooldownMultiplier = _drawNumberCooldownMultiplier;
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
        _mint(msg.sender, 1);
    }

    function mintMultiple(address to, uint256 quantity) external payable {
        require(bingoState == BingoState.MINT, "Minting has ended");
        require(msg.value == quantity * mintPrice, "Incorrect payment");
        _mint(to, quantity);
    }

    function drawNumber() external {
        require(bingoState == BingoState.DRAW, "Draw has not started");
        require(nextDrawTimestamp <= block.timestamp, "Waiting the cooldown");

        // Pick a randomNumberIndex from the not yet drawn side.
        uint256 randomNumberIndex = (drawSeed + drawnNumbersCount) % (90 - drawnNumbersCount);

        // Increase drawnNumbersCount, i.e. reduce the caret of (drawnNumbersCount - 1)
        drawnNumbersCount++;

        // Swap randomNumberIndex and (90 - drawnNumbersCount)
        uint8 randomNumber = numbers[randomNumberIndex];
        numbers[randomNumberIndex] = numbers[90 - drawnNumbersCount];
        numbers[90 - drawnNumbersCount] = randomNumber;

        // Side effects
        nextDrawTimestamp = block.timestamp + drawNumberCooldownMultiplier * drawnNumbersCount;
        emit DrawNumber(randomNumber);
    }

    function claimPrize(uint256 tokenId) external {
        require(bingoState == BingoState.DRAW, "Game is over");
        require(_exists(tokenId), "Invalid token ID");
        require(coveredNumbers(tokenId) == 15, "Ineligible");
        donationAddress.call{value: address(this).balance / 2}("");
        address payable winner = payable(ownerOf(tokenId));
        winner.call{value: address(this).balance}("");
        bingoState = BingoState.FINISHED;
        emit ClaimPrize(tokenId, winner);
    }

    function startDrawPeriod() external {
        require(bingoState == BingoState.MINT, "Draw already started");
        require(firstDrawTimestamp <= block.timestamp, "Hold down");

        bingoState = BingoState.DRAW;
        emit DrawStarted();
        _requestDrawSeed();
    }

    function rerequestDrawSeed() external {
        if (bingoState == BingoState.DRAW && drawSeed == 0 && lastRequestBlockNumber + VRF_REREQUEST_COOLDOWN_BLOCKS <= block.number) {
            _requestDrawSeed();
        }
    }

    /**
     * @dev Returns an array of token IDs owned by `owner`.
     *
     * This function scans the ownership mapping and is O(`totalSupply`) in complexity.
     * It is meant to be called off-chain.
     *
     * See {ERC721AQueryable-tokensOfOwnerIn} for splitting the scan into
     * multiple smaller scans if the collection is large enough to cause
     * an out-of-gas error (10K collections should be fine).
     *
     * Taken from https://github.com/chiru-labs/ERC721A/blob/main/contracts/extensions/ERC721AQueryable.sol
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenIdsLength = balanceOf(owner);
        uint256[] memory tokenIds;
        assembly {
            // Grab the free memory pointer.
            tokenIds := mload(0x40)
            // Allocate one word for the length, and `tokenIdsMaxLength` words
            // for the data. `shl(5, x)` is equivalent to `mul(32, x)`.
            mstore(0x40, add(tokenIds, shl(5, add(tokenIdsLength, 1))))
            // Store the length of `tokenIds`.
            mstore(tokenIds, tokenIdsLength)
        }
        address currOwnershipAddr;
        uint256 tokenIdsIdx;
        for (uint256 i = _startTokenId(); tokenIdsIdx != tokenIdsLength; ) {
            TokenOwnership memory ownership = _ownershipAt(i);
            assembly {
                // if `ownership.burned == false`.
                if iszero(mload(add(ownership, 0x40))) {
                    // if `ownership.addr != address(0)`.
                    // The `addr` already has it's upper 96 bits clearned,
                    // since it is written to memory with regular Solidity.
                    if mload(ownership) {
                        currOwnershipAddr := mload(ownership)
                    }
                    // if `currOwnershipAddr == owner`.
                    // The `shl(96, x)` is to make the comparison agnostic to any
                    // dirty upper 96 bits in `owner`.
                    if iszero(shl(96, xor(currOwnershipAddr, owner))) {
                        tokenIdsIdx := add(tokenIdsIdx, 1)
                        mstore(add(tokenIds, shl(5, tokenIdsIdx)), i)
                    }
                }
                i := add(i, 1)
            }
        }
        return tokenIds;
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
                numberMatrix(tokenId),
                isDrawnMatrix(tokenId),
                mintPrice / 2,
                donationName,
                donationAddress,
                bingoState == BingoState.FINISHED,
                firstDrawTimestamp
            );
    }

    function numberMatrix(uint256 tokenId)
        public
        view
        returns (uint256[9][3] memory numberMatrix)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        uint256 tokenSeed = _tokenSeed(tokenId);
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                numberMatrix[row][column] = getNumberByCoordinates(
                    tokenSeed,
                    row,
                    column
                );
            }
        }
    }

    function isDrawnMatrix(uint256 tokenId)
        public
        view
        returns (bool[9][3] memory isDrawnMatrix)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        uint256 tokenSeed = _tokenSeed(tokenId);
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                if (
                    isDrawn(
                        getNumberByCoordinates(tokenSeed, row, column)
                    )
                ) {
                    isDrawnMatrix[row][column] = true;
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
                    isDrawn(
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
    ) public view returns (uint8) {
        uint8[2][9][3] memory layout = LAYOUTS[tokenSeed % LAYOUTS_COUNT];
        if (layout[row][column][0] == 0) {
            return 0;
        } else {
            return layout[row][column][0] + uint8(tokenSeed % layout[row][column][1]);
        }
    }

    function getDrawnNumbers() public view returns (uint8[] memory) {
        uint8[] memory drawnNumbers = new uint8[](drawnNumbersCount);
        for (uint8 i = 0; i < drawnNumbersCount; i++) {
            drawnNumbers[i] = numbers[89 - i];
        }
        return drawnNumbers;
    }

    function isDrawn(uint8 number) public view returns (bool) {
        uint8[] memory drawnNumbers = new uint8[](drawnNumbersCount);
        for (uint8 i = 0; i < drawnNumbersCount; i++) {
            if (number == numbers[89 - i]) {
                return true;
            }
        }
        return false;
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

    function _startTokenId() internal view override returns (uint256) {
        return 1;
    }
}
