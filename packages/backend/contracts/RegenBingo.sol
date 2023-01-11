// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

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

    BingoState public bingoState;
    uint256 public mintPrice;
    uint256 public drawTimestamp;
    uint256 public drawNumberCooldownSeconds;
    uint256 public lastDrawTime;
    address payable public charityAddress;
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
        address payable _charityAddress
    ) ERC721(_name, _symbol) {
        mintPrice = _mintPrice;
        drawTimestamp = _drawTimestamp;
        drawNumberCooldownSeconds = _drawNumberCooldownSeconds;
        charityAddress = _charityAddress;
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
        charityAddress.call{value: address(this).balance / 2}("");
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

    function tokenImage(uint256 tokenId) public view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "INVALID_TOKEN_ID");

        string[55] memory parts;
        parts[0] =
            '<svg viewBox="0 0 395 150" xmlns="http://www.w3.org/2000/svg"><style>text{fill:yellow;font-family:serif;font-size:30px;}</style><rect width="100%" height="100%" fill="darkgreen"/><text x="20" y="40">';
        parts[1] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 0));
        parts[2] = '</text><text x="60" y="40">';
        parts[3] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 1));
        parts[4] = '</text><text x="100" y="40">';
        parts[5] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 2));
        parts[6] = '</text><text x="140" y="40">';
        parts[7] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 3));
        parts[8] = '</text><text x="180" y="40">';
        parts[9] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 4));
        parts[10] = '</text><text x="220" y="40">';
        parts[11] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 5));
        parts[12] = '</text><text x="260" y="40">';
        parts[13] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 6));
        parts[14] = '</text><text x="300" y="40">';
        parts[15] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 7));
        parts[16] = '</text><text x="340" y="40">';
        parts[17] = _toNonZeroString(getNumberByCoordinates(tokenId, 0, 8));
        parts[18] = '</text><text x="20" y="85">';
        parts[19] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 0));
        parts[20] = '</text><text x="60" y="85">';
        parts[21] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 1));
        parts[22] = '</text><text x="100" y="85">';
        parts[23] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 2));
        parts[24] = '</text><text x="140" y="85">';
        parts[25] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 3));
        parts[26] = '</text><text x="180" y="85">';
        parts[27] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 4));
        parts[28] = '</text><text x="220" y="85">';
        parts[29] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 5));
        parts[30] = '</text><text x="260" y="85">';
        parts[31] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 6));
        parts[32] = '</text><text x="300" y="85">';
        parts[33] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 7));
        parts[34] = '</text><text x="340" y="85">';
        parts[35] = _toNonZeroString(getNumberByCoordinates(tokenId, 1, 8));
        parts[36] = '</text><text x="20" y="130">';
        parts[37] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 0));
        parts[38] = '</text><text x="60" y="130">';
        parts[39] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 1));
        parts[40] = '</text><text x="100" y="130">';
        parts[41] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 2));
        parts[42] = '</text><text x="140" y="130">';
        parts[43] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 3));
        parts[44] = '</text><text x="180" y="130">';
        parts[45] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 4));
        parts[46] = '</text><text x="220" y="130">';
        parts[47] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 5));
        parts[48] = '</text><text x="260" y="130">';
        parts[49] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 6));
        parts[50] = '</text><text x="300" y="130">';
        parts[51] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 7));
        parts[52] = '</text><text x="340" y="130">';
        parts[53] = _toNonZeroString(getNumberByCoordinates(tokenId, 2, 8));
        parts[54] = "</text></svg>";

        string memory output = string(
            abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[8])
        );
        output = string(
            abi.encodePacked(
                output, parts[9], parts[10], parts[11], parts[12], parts[13], parts[14], parts[15], parts[16]
            )
        );
        output = string(
            abi.encodePacked(
                output, parts[17], parts[18], parts[19], parts[20], parts[21], parts[22], parts[23], parts[24]
            )
        );
        output = string(
            abi.encodePacked(
                output, parts[25], parts[26], parts[27], parts[28], parts[29], parts[30], parts[31], parts[32]
            )
        );
        output = string(
            abi.encodePacked(
                output, parts[33], parts[34], parts[35], parts[36], parts[37], parts[38], parts[39], parts[40]
            )
        );
        output = string(
            abi.encodePacked(
                output, parts[41], parts[42], parts[43], parts[44], parts[45], parts[46], parts[47], parts[48]
            )
        );
        output = string(abi.encodePacked(output, parts[49], parts[50], parts[51], parts[52], parts[53], parts[54]));

        return string(abi.encodePacked("data:image/svg+xml;base64,", Base64.encode(bytes(output))));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "INVALID_TOKEN_ID");

        string memory image = tokenImage(tokenId);
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        name(),
                        " #",
                        tokenId.toString(),
                        '", "description": "...", "image": "',
                        image,
                        '"}'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function coveredNumbers(uint256 id) public view returns (uint256 count) {
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                if (drawnNumbers.contains(getNumberByCoordinates(id, row, column))) {
                    count++;
                }
            }
        }
    }

    function getNumberByCoordinates(uint256 tokenId, uint256 row, uint256 column) public view returns (uint256) {
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

    //will change to a better algorithm
    function _containsDuplicates(uint256 tokenId) internal pure returns (bool) {
        uint256[9][3] memory layout = _getLayout(tokenId % LAYOUTS_COUNT);
        for (uint256 row = 0; row < 3; row++) {
            for (uint256 column = 0; column < 9; column++) {
                if (layout[row][column] == 0) {
                    continue;
                }
                for (uint256 row2 = 0; row2 < 3; row2++) {
                    for (uint256 column2 = 0; column2 < 9; column2++) {
                        if (layout[row2][column2] == 0) {
                            continue;
                        }
                        if (row == row2 && column == column2) {
                            continue;
                        }
                        if (layout[row][column] == layout[row2][column2]) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
