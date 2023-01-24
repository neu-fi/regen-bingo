// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IRegenBingoMetadata.sol";

contract RegenBingo is ERC721Enumerable {
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
        address _metadataGenerator
    ) ERC721(_name, _symbol) {
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
        require(bingoState == BingoState.MINT, "It is not mint period");
        require(msg.value == mintPrice, "Incorrect payment amount");
        // Using totalSupply() so that one can mint multiple different cards in a block
        uint256 tokenId = uint256(
            keccak256(
                abi.encodePacked(totalSupply(), msg.sender, block.timestamp)
            )
        );
        _mint(msg.sender, tokenId);
    }

    function mintMultiple(uint256 mintCount) external payable {
        require(bingoState == BingoState.MINT, "It is not mint period");
        require(msg.value == mintPrice * mintCount, "Incorrect payment amount");
        for (uint256 i = 0; i < mintCount; i++) {
            // Using totalSupply() so that one can mint multiple different cards in a block
            uint256 tokenId = uint256(
                keccak256(
                    abi.encodePacked(totalSupply(), msg.sender, block.timestamp)
                )
            );
            _mint(msg.sender, tokenId);
        }
    }

    function drawNumber() external returns (uint256) {
        require(bingoState == BingoState.DRAW, "It is not draw period");
        require(
            block.timestamp > lastDrawTime + drawNumberCooldownSeconds,
            "Draw too soon"
        );
        // TODO: Use VRF

        uint256 nonce = 0;
        uint256 number = 1 +
            (uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.difficulty, nonce)
                )
            ) % 90);

        while (drawnNumbers.contains(number)) {
            number =
                1 +
                (uint256(
                    keccak256(
                        abi.encodePacked(
                            number,
                            block.timestamp,
                            block.difficulty,
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

    function claimPrize(uint256 id) external {
        require(bingoState != BingoState.FINISHED, "Game Over");
        _requireMinted(id);
        require(coveredNumbers(id) == 15, "INELIGIBLE");
        donationAddress.call{value: address(this).balance / 2}("");
        address payable winner = payable(ownerOf(id));
        winner.call{value: address(this).balance}("");
        bingoState = BingoState.FINISHED;
        emit ClaimPrize(id, winner);
    }

    function startDrawPeriod() external {
        require(bingoState == BingoState.MINT);
        require(block.timestamp > drawTimestamp, "It is not draw period yet");
        bingoState = BingoState.DRAW;
        emit DrawStarted();
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
        require(ownerOf(tokenId) != address(0), "INVALID_TOKEN_ID");
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
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                numbers[row][column] = getNumberByCoordinates(
                    tokenId,
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
        require(ownerOf(tokenId) != address(0), "INVALID_TOKEN_ID");
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                if (
                    drawnNumbers.contains(
                        getNumberByCoordinates(tokenId, row, column)
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
        require(ownerOf(tokenId) != address(0), "INVALID_TOKEN_ID");
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                if (
                    drawnNumbers.contains(
                        getNumberByCoordinates(tokenId, row, column)
                    )
                ) {
                    count++;
                }
            }
        }
    }

    function getNumberByCoordinates(
        uint256 tokenId,
        uint256 row,
        uint256 column
    ) public view returns (uint256) {
        uint8[2][9][3] memory layout = LAYOUTS[tokenId % LAYOUTS_COUNT];
        if (layout[row][column][0] == 0) {
            return 0;
        } else {
            return layout[row][column][0] + (tokenId % layout[row][column][1]);
        }
    }

    function getDrawnNumbers() public view returns (uint256[] memory) {
        return drawnNumbers.values();
    }
}
