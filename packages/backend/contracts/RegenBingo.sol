// SPDX-License-Identifier: MIT
// @author Neufi Limited (neu.fi)

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";
import "erc721a/contracts/ERC721A.sol";
import "./interfaces/IRegenBingoMetadata.sol";

contract RegenBingo is ERC721A, VRFV2WrapperConsumerBase {

    /*//////////////////////////////////////////////////////////////
                                ENUMS
    //////////////////////////////////////////////////////////////*/

    enum BingoState {
        MINT,
        DRAW,
        END
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint8 constant NUMBERS_COUNT = 90;
    uint256 constant LAYOUTS_COUNT = 15;
    uint256 constant ROWS_COUNT = 3;
    uint256 constant COLUMNS_COUNT = 9;
    uint32 constant VRF_CALLBACK_GAS_LIMIT = 100000;
    uint32 constant VRF_NUMBER_OF_WORDS = 1;
    uint16 constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint256 constant VRF_REREQUEST_COOLDOWN_BLOCKS = 300;

    /*//////////////////////////////////////////////////////////////
                        IMMUTABLE STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    // Not set as immutable as it increases bytecode size with optimizations
    IRegenBingoMetadata metadataGenerator;
    uint256 public mintPrice;
    uint256 public firstDrawTimestamp;
    uint256 public drawNumberCooldownMultiplier;
    address payable donationAddress;
    string public donationName;

    // Bingo card layouts.
    // Cells have the following format: [lowest_available_number, possible_options]
    // Given a seed, a number in the cell could be calculated as:
    // lowest_available_number + (seed % possible_options)
    // Following these rules: https://en.wikipedia.org/wiki/Bingo_card#90-ball_bingo_cards
    // Using these as templates: https://www.scribd.com/document/325121782/1-90-British-Bingo-Cards
    uint8[2][COLUMNS_COUNT][ROWS_COUNT][LAYOUTS_COUNT] layouts = [
        [
            [[ 0, 0], [ 0, 0], [20, 1], [30,10], [ 0, 0], [50, 3], [ 0, 0], [70, 2], [80, 4]],
            [[ 0, 0], [10, 1], [22, 8], [ 0, 0], [40,10], [54, 6], [ 0, 0], [ 0, 0], [84, 4]],
            [[ 1, 9], [12, 8], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [60,10], [73, 7], [88, 3]]
        ],
        [
            [[ 1, 4], [ 0, 0], [20, 3], [ 0, 0], [40, 4], [50,10], [ 0, 0], [ 0, 0], [80, 7]],
            [[ 5, 5], [10, 3], [23, 3], [30, 8], [45, 5], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
            [[ 0, 0], [14, 6], [26, 4], [39, 1], [ 0, 0], [ 0, 0], [ 0, 0], [70,10], [88, 3]]
        ],
        [
            [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [40, 1], [50, 7], [60, 7], [70, 7], [80, 4]],
            [[ 0, 0], [10,10], [20, 5], [ 0, 0], [ 0, 0], [58, 2], [68, 2], [ 0, 0], [84, 4]],
            [[ 0, 0], [ 0, 0], [26, 4], [30,10], [42, 8], [ 0, 0], [ 0, 0], [78, 2], [88, 3]]
        ],
        [
            [[ 0, 0], [10,10], [20, 6], [30, 1], [ 0, 0], [50, 7], [ 0, 0], [ 0, 0], [80, 8]],
            [[ 1, 8], [ 0, 0], [27, 3], [ 0, 0], [40,10], [ 0, 0], [60, 4], [70,10], [ 0, 0]],
            [[ 9, 1], [ 0, 0], [ 0, 0], [32, 8], [ 0, 0], [58, 2], [65, 5], [ 0, 0], [89, 2]]
        ],
        [
            [[ 1, 3], [10, 6], [20, 3], [ 0, 0], [ 0, 0], [50, 3], [ 0, 0], [ 0, 0], [80, 6]],
            [[ 4, 3], [17, 3], [ 0, 0], [30,10], [40,10], [53, 3], [ 0, 0], [ 0, 0], [ 0, 0]],
            [[ 7, 3], [ 0, 0], [24, 6], [ 0, 0], [ 0, 0], [56, 4], [60,10], [ 0, 0], [87, 4]]
        ],
        [
            [[ 1, 3], [10,10], [20,10], [30, 6], [ 0, 0], [ 0, 0], [60, 3], [ 0, 0], [ 0, 0]],
            [[ 4, 3], [ 0, 0], [ 0, 0], [ 0, 0], [40, 3], [50,10], [63, 3], [70,10], [ 0, 0]],
            [[ 7, 3], [ 0, 0], [ 0, 0], [37, 3], [44, 6], [ 0, 0], [66, 4], [ 0, 0], [80,11]]
        ],
        [
            [[ 1, 2], [10, 8], [ 0, 0], [ 0, 0], [40, 2], [ 0, 0], [ 0, 0], [70, 3], [80,11]],
            [[ 3, 7], [19, 1], [20, 1], [ 0, 0], [ 0, 0], [ 0, 0], [60,10], [73, 3], [ 0, 0]],
            [[ 0, 0], [ 0, 0], [22, 8], [30,10], [43, 7], [50,10], [ 0, 0], [76, 4], [ 0, 0]]
        ],
        [
            [[ 0, 0], [10, 3], [ 0, 0], [ 0, 0], [40,10], [ 0, 0], [60, 3], [70, 2], [80, 6]],
            [[ 1, 9], [13, 3], [ 0, 0], [ 0, 0], [ 0, 0], [50, 7], [64, 6], [73, 7], [ 0, 0]],
            [[ 0, 0], [16, 4], [20,10], [30,10], [ 0, 0], [58, 2], [ 0, 0], [ 0, 0], [87, 4]]
        ],
        [
            [[ 1, 6], [10,10], [ 0, 0], [30,10], [40, 7], [ 0, 0], [ 0, 0], [70, 3], [ 0, 0]],
            [[ 0, 0], [ 0, 0], [20,10], [ 0, 0], [48, 2], [ 0, 0], [60, 3], [73, 3], [80, 6]],
            [[ 7, 3], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [50,10], [64, 6], [76, 4], [87, 4]]
        ],
        [
            [[ 0, 0], [ 0, 0], [20, 1], [30, 3], [ 0, 0], [50, 7], [60, 3], [70, 3], [ 0, 0]],
            [[ 0, 0], [ 0, 0], [22, 8], [33, 3], [40, 6], [ 0, 0], [ 0, 0], [73, 3], [80,11]],
            [[ 0, 0], [ 0, 0], [ 0, 0], [36, 4], [47, 3], [58, 2], [64, 6], [76, 4], [ 0, 0]]
        ],
        [
            [[ 1, 6], [ 0, 0], [20, 2], [30,10], [ 0, 0], [ 0, 0], [60, 3], [70,10], [ 0, 0]],
            [[ 7, 3], [10, 6], [23, 7], [ 0, 0], [ 0, 0], [ 0, 0], [63, 3], [ 0, 0], [80, 4]],
            [[ 0, 0], [17, 3], [ 0, 0], [ 0, 0], [40,10], [50,10], [66, 4], [ 0, 0], [85, 6]]
        ],
        [
            [[ 1, 9], [ 0, 0], [20, 3], [ 0, 0], [40,10], [ 0, 0], [60, 3], [70,10], [ 0, 0]],
            [[ 0, 0], [10, 1], [23, 3], [ 0, 0], [ 0, 0], [50, 2], [63, 3], [ 0, 0], [80, 6]],
            [[ 0, 0], [12, 8], [26, 4], [ 0, 0], [ 0, 0], [53, 7], [66, 4], [ 0, 0], [87, 4]]
        ],
        [
            [[ 1, 2], [10, 3], [ 0, 0], [30,10], [ 0, 0], [ 0, 0], [ 0, 0], [70, 3], [80, 3]],
            [[ 0, 0], [14, 6], [20, 2], [ 0, 0], [ 0, 0], [50,10], [60, 5], [73, 3], [ 0, 0]],
            [[ 3, 7], [ 0, 0], [23, 7], [ 0, 0], [ 0, 0], [ 0, 0], [66, 4], [76, 4], [84, 7]]
        ],
        [
            [[ 1, 5], [10, 3], [ 0, 0], [ 0, 0], [ 0, 0], [50, 8], [60,10], [70, 7], [ 0, 0]],
            [[ 0, 0], [13, 3], [20, 4], [ 0, 0], [40,10], [ 0, 0], [ 0, 0], [78, 2], [80, 8]],
            [[ 6, 4], [16, 4], [25, 5], [ 0, 0], [ 0, 0], [59, 1], [ 0, 0], [ 0, 0], [89, 2]]
        ],
        [
            [[ 0, 0], [10, 1], [20, 3], [ 0, 0], [40, 3], [50, 7], [ 0, 0], [ 0, 0], [80, 4]],
            [[ 0, 0], [12, 8], [23, 3], [30, 6], [ 0, 0], [ 0, 0], [ 0, 0], [70,10], [84, 4]],
            [[ 0, 0], [ 0, 0], [26, 4], [37, 3], [44, 6], [58, 2], [ 0, 0], [ 0, 0], [88, 3]]
        ]
    ];

    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    BingoState public bingoState;
    uint256 public nextDrawTimestamp;

    // Drawn numbers have index of "90 - drawnNumbersCount" or larger in the "numbers" array.
    uint8 public drawnNumbersCount;
    uint8[NUMBERS_COUNT] numbers = [
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

    // Chainlink VRF
    uint256 vrfRandomWord;
    uint256 vrfLastRequestId;
    uint256 vfrLastRequestBlockNumber;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event DrawNumber(uint256 number);
    event ClaimPrize(uint256 tokenId, address winner);
    event DrawStarted();

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyMintState {
        require(bingoState == BingoState.MINT, "Not minting");
        _;
    }

    modifier onlyDrawState {
        require(bingoState == BingoState.DRAW, "Not drawing");
        _;
    }

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

    function mint(address to, uint256 quantity) onlyMintState external payable {
        require(msg.value == quantity * mintPrice, "Incorrect payment");

        _mint(to, quantity);
    }

    function drawNumber() onlyDrawState external {
        require(0 < vrfRandomWord, "The draw will start soon");
        require(nextDrawTimestamp <= block.timestamp, "Waiting the cooldown");

        // None of the computations below can overflow.
        // drawnNumbersCount will be up to 90 and the game will end in about 60 rounds even in low participation.
        unchecked {
            // Pick a randomNumberIndex from the not yet drawn side.
            uint256 randomNumberIndex = addmod(vrfRandomWord, drawnNumbersCount, (NUMBERS_COUNT - drawnNumbersCount));

            // Increase drawnNumbersCount, i.e. reduce the caret of undrawn vs drawn in the numbers array
            drawnNumbersCount++;

            // Swap randomNumberIndex and (90 - drawnNumbersCount)
            uint8 randomNumber = numbers[randomNumberIndex];
            numbers[randomNumberIndex] = numbers[NUMBERS_COUNT - drawnNumbersCount];
            numbers[NUMBERS_COUNT - drawnNumbersCount] = randomNumber;

            // Side effects
            nextDrawTimestamp = block.timestamp + drawNumberCooldownMultiplier * drawnNumbersCount;
            emit DrawNumber(randomNumber);
        }
    }

    function claimPrize(uint256 tokenId) onlyDrawState external {
        require(_exists(tokenId), "Invalid token ID");
        require(score(tokenId) == 15, "Ineligible");

        donationAddress.call{value: address(this).balance / 2}("");
        address payable winner = payable(ownerOf(tokenId));
        winner.call{value: address(this).balance}("");
        bingoState = BingoState.END;
        emit ClaimPrize(tokenId, winner);
    }

    function startDrawPeriod() onlyMintState external {
        require(firstDrawTimestamp <= block.timestamp, "Hold down");

        bingoState = BingoState.DRAW;
        emit DrawStarted();
        _requestVrfRandomWord();
    }

    function rerequestVrfRandomWord() onlyDrawState external {
        if (vrfRandomWord == 0 && vfrLastRequestBlockNumber + VRF_REREQUEST_COOLDOWN_BLOCKS <= block.number) {
            _requestVrfRandomWord();
        }
    }

    /*//////////////////////////////////////////////////////////////
                          EXTERNAL VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

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
                score(tokenId),
                mintPrice / 2,
                donationName,
                donationAddress,
                bingoState == BingoState.END,
                firstDrawTimestamp
            );
    }

    function numberMatrix(uint256 tokenId)
        public
        view
        returns (uint8[COLUMNS_COUNT][ROWS_COUNT] memory numberMatrix)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        uint256 tokenSeed = _tokenSeed(tokenId);
        for (uint256 row = 0; row < ROWS_COUNT; row++) {
            for (uint256 column = 0; column < COLUMNS_COUNT; column++) {
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
        returns (bool[COLUMNS_COUNT][ROWS_COUNT] memory isDrawnMatrix)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        uint256 tokenSeed = _tokenSeed(tokenId);
        for (uint256 row = 0; row < ROWS_COUNT; row++) {
            for (uint256 column = 0; column < COLUMNS_COUNT; column++) {
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

    function score(uint256 tokenId)
        public
        view
        returns (uint8 count)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        bool[COLUMNS_COUNT][ROWS_COUNT] memory matrix = isDrawnMatrix(tokenId);
        for (uint256 row = 0; row < ROWS_COUNT; row++) {
            for (uint256 column = 0; column < COLUMNS_COUNT; column++) {
                if ( matrix[row][column] ) {
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
        uint8[2][COLUMNS_COUNT][ROWS_COUNT] memory layout = layouts[tokenSeed % LAYOUTS_COUNT];
        if (layout[row][column][0] == 0) {
            return 0;
        } else {
            return layout[row][column][0] + uint8(tokenSeed % layout[row][column][1]);
        }
    }

    function getDrawnNumbers() public view returns (uint8[] memory) {
        uint8[] memory drawnNumbers = new uint8[](drawnNumbersCount);
        for (uint8 i = 0; i < drawnNumbersCount; i++) {
            drawnNumbers[i] = numbers[NUMBERS_COUNT - 1 - i];
        }
        return drawnNumbers;
    }

    function isDrawn(uint8 number) public view returns (bool) {
        uint8[] memory drawnNumbers = new uint8[](drawnNumbersCount);
        for (uint8 i = 0; i < drawnNumbersCount; i++) {
            if (number == numbers[NUMBERS_COUNT - 1 - i]) {
                return true;
            }
        }
        return false;
    }

    /*//////////////////////////////////////////////////////////////
                          INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    // Overriding VRFV2WrapperConsumerBase
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        if (vrfRandomWord == 0 && _requestId == vrfLastRequestId) {
            vrfRandomWord = _randomWords[0];
        }
    }

    function _tokenSeed(uint256 tokenId)
        internal
        view
        returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(address(this), tokenId)));
    }

    function _requestVrfRandomWord() internal {
        vfrLastRequestBlockNumber = block.number;
        uint256 requestId = requestRandomness(
            VRF_CALLBACK_GAS_LIMIT,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_NUMBER_OF_WORDS
        );
        vrfLastRequestId = requestId;
    }

    function _startTokenId() internal view override returns (uint256) {
        return 1;
    }
}
