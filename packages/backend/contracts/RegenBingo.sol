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
    uint256 constant LAYOUTS_COUNT = 10;
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

    // Bingo card layouts
    uint256[LAYOUTS_COUNT] private layouts = [
        74531863127069656875678005463629317377624456585407760715211671503378212480908,
        84733770693983134393286414926143418191632064005497261285059935046721726341764,
        88892850850319190340242688960817664513518456655726863909825725454469825060928,
        85615516063282425514350087369392836674708439228389954229085207788303887704128,
        82025225875150254732266191914090518340421847287971611702527960659275601731648,
        81428084179800062446453646573230984879745244988152209000518516361294873969284,
        70657384472911031446975028864715540995046624405935865290481737135510018089024,
        96073477329873783590368928870704280664394527774970734350082854071566790058628,
        71254418773555781409572465841860736354607880829542776466442355105762863825540,
        81712411770574619635979783041230964642099925492660987369159605175257838198848
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
        uint256 layout = layouts[tokenSeed % LAYOUTS_COUNT];
                

        for(uint256 i = 0; i < 15; i++) {
            uint256 row = layout % 4; // 2 bits for number of rows
            layout /= 4;
            uint256 column = layout % 16; // // 4 bits for the number of columns
            layout /= 16;
            uint256 floorNumber = layout % 128; // 7 bits for the range start number
            layout /= 128;
            uint256 range = layout % 16; // 4 bits for the number range length
            layout /= 16;
            numberMatrix[row][column] = uint8(floorNumber + tokenSeed % range);
        }
    }

    function isDrawnMatrix(uint256 tokenId)
        public
        view
        returns (bool[COLUMNS_COUNT][ROWS_COUNT] memory isDrawnMatrix)
    {
        require(ownerOf(tokenId) != address(0), "Invalid card");
        uint8[COLUMNS_COUNT][ROWS_COUNT] memory matrix = numberMatrix(tokenId);

        for (uint256 row = 0; row < ROWS_COUNT; row++) {
            for (uint256 column = 0; column < COLUMNS_COUNT; column++) {
                isDrawn(matrix[row][column]) ? true : false;
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
