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

    uint256 constant LAYOUTS_COUNT = 3;

    uint256 constant PRIME_1 = 345748237736302043954346415468961719667;
    uint256 constant PRIME_2 = 346898908343340269085095797543225285067;
    uint256 constant PRIME_3 = 349436888172124469953802313936204793639;
    uint256 constant PRIME_4 = 350775825975224662536471623247112070683;
    uint256 constant PRIME_5 = 351826028875514156289400300739130052693;
    uint256 constant PRIME_6 = 352412280970268348994551642119472945107;
    uint256 constant PRIME_7 = 352481965297794116322788845643729736229;
    uint256 constant PRIME_8 = 355662614806814143955140513875615460687;
    uint256 constant PRIME_9 = 359319764875976259388138010914940262119;
    uint256 constant PRIME_10 = 364474025646518244225535015089205405063;
    uint256 constant PRIME_11 = 365535512377247765880241266596284033459;
    uint256 constant PRIME_12 = 366207651054021111846380872598610590333;
    uint256 constant PRIME_13 = 370011511959930685076007398472051834473;
    uint256 constant PRIME_14 = 375675342105268259527879793250735537607;
    uint256 constant PRIME_15 = 385276465729037003106999007892189232991;

    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    IRegenBingoMetadata metadataGenerator;

    BingoState public bingoState;
    uint256 public mintPrice;
    uint256 public drawTimestamp;
    uint256 public drawNumberCooldownSeconds;
    uint256 public lastDrawTime;
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
        address payable _donationAddress,
        address _metadataGenerator
    ) ERC721(_name, _symbol) {
        mintPrice = _mintPrice;
        drawTimestamp = _drawTimestamp;
        drawNumberCooldownSeconds = _drawNumberCooldownSeconds;
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
        uint256 tokenId = uint256(keccak256(abi.encodePacked(totalSupply(), msg.sender, block.timestamp)));
        require(!_containsDuplicates(tokenId), "This card has duplicate numbers");
        _mint(msg.sender, tokenId);
    }

    function drawNumber() external returns (uint256) {
        require(bingoState == BingoState.DRAW, "It is not draw period");
        require(block.timestamp > lastDrawTime + drawNumberCooldownSeconds, "Draw too soon");
        // TODO: Use VRF

        uint256 nonce = 0;
        uint256 number = 1 + uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, nonce))) % 90;

        while (drawnNumbers.contains(number)) {
            number = 1 + uint256(keccak256(abi.encodePacked(number, block.timestamp, block.difficulty, nonce))) % 90;
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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "INVALID_TOKEN_ID");

        uint256[9][3] memory numbers;
        bool[9][3] memory covered;
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                numbers[row][column] = getNumberByCoordinates(tokenId, row, column);
                if (drawnNumbers.contains(numbers[row][column])) {
                    covered[row][column] = true;
                }
            }
        }

        return metadataGenerator.generateTokenURI(tokenId, numbers, covered);
    }

    function coveredNumbers(uint256 tokenId) public view returns (uint256 count) {
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                if (drawnNumbers.contains(getNumberByCoordinates(tokenId, row, column))) {
                    count++;
                }
            }
        }
    }

    function getNumberByCoordinates(uint256 tokenId, uint256 row, uint256 column) public pure returns (uint256) {
        uint256[9][3] memory layout = _getLayout(tokenId % LAYOUTS_COUNT);
        if (layout[row][column] == 0) {
            return 0;
        } else {
            return 1 + (column * 10) + ((tokenId % layout[row][column]) % 10);
        }
    }

    function getDrawnNumbers() public view returns (uint256[] memory) {
        return drawnNumbers.values();
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _getLayout(uint256 index) internal pure returns (uint256[9][3] memory) {
        return [
            [
                [PRIME_1, 0, PRIME_2, PRIME_3, 0, PRIME_4, 0, 0, PRIME_5],
                [PRIME_6, 0, 0, PRIME_7, PRIME_8, 0, 0, PRIME_9, PRIME_10],
                [0, PRIME_11, 0, PRIME_12, 0, PRIME_13, PRIME_14, 0, PRIME_15]
            ],
            [
                [0, PRIME_10, PRIME_14, 0, 0, 0, PRIME_9, PRIME_11, PRIME_8],
                [PRIME_15, 0, PRIME_5, 0, PRIME_12, 0, 0, PRIME_4, PRIME_13],
                [0, 0, PRIME_1, PRIME_6, 0, PRIME_2, 0, PRIME_7, PRIME_3]
            ],
            [
                [PRIME_13, 0, 0, PRIME_15, PRIME_6, 0, PRIME_7, 0, PRIME_12],
                [0, PRIME_1, PRIME_14, 0, PRIME_2, PRIME_3, PRIME_11, 0, 0],
                [0, PRIME_5, PRIME_4, 0, 0, PRIME_10, PRIME_8, PRIME_9, 0]
            ]
        ][index];
    }

    function _toNonZeroString(uint256 number) internal pure returns (string memory) {
        if (number != 0) {
            return Strings.toString(number);
        } else {
            return "";
        }
    }

    function _containsDuplicates(uint256 tokenId) internal pure returns (bool) {
        for (uint256 row = 0; row < 3; row++) {
            bytes memory numbers = new bytes(90);
            for (uint256 column = 0; column < 9; column++) {
                uint256 numberInCoordinate = getNumberByCoordinates(tokenId, row, column);
                if (numberInCoordinate == 0) {
                    continue;
                } else {
                    if (numbers[numberInCoordinate - 1] == 0) {
                        numbers[numberInCoordinate - 1] = 0x01;
                    } else {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
