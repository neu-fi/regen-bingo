// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract RegenBingo is ERC721 {
    using Strings for uint256;

    uint256 constant LAYOUTS_COUNT = 3;

    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    uint256 public mintPrice;
    uint256 public drawTimestamp;
    uint256 public drawNumberCooldownSeconds;
    uint256 public lastDrawTime;
    uint256 public totalSupply;
    address payable public charityAddress;
    mapping(uint256 => bool) public isDrawn;
    mapping(uint256 => uint256) private _seeds;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event DrawNumber(uint256 number);
    event ClaimPrize(uint256 tokenId, address winner);

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
        require(msg.value == mintPrice, "Incorrect payment amount");
        require(block.timestamp < drawTimestamp, "Draw already started");
        // Using totalSupply so that one can mint multiple different cards in a block
        uint256 seed = uint256(keccak256(abi.encodePacked(totalSupply, msg.sender, block.timestamp)));
        _seeds[totalSupply] = seed;
        _mint(msg.sender, totalSupply);
        totalSupply++;
    }

    function drawNumber() external returns (uint256) {
        require(block.timestamp > drawTimestamp, "Draw not started yet");
        require(block.timestamp > lastDrawTime + drawNumberCooldownSeconds, "Draw too soon");
        // TODO: Use VRF
        uint256 number = 1 + uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 90;
        isDrawn[number] = true;
        lastDrawTime = block.timestamp;
        emit DrawNumber(number);
        return number;
    }

    function claimPrize(uint256 id) external {
        require(coveredNumbers(id) == 15, "INELIGIBLE");
        charityAddress.call{value: address(this).balance / 2}("");
        address payable winner = payable(ownerOf(id));
        winner.call{value: address(this).balance}("");
        emit ClaimPrize(id, winner);
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
                if (isDrawn[getNumberByCoordinates(id, row, column)]) {
                    count++;
                }
            }
        }
    }

    function getNumberByCoordinates(uint256 id, uint256 row, uint256 column) public view returns (uint256) {
        uint256 seed = _seeds[id];
        uint16[9][3] memory layout = _getLayout(seed % LAYOUTS_COUNT);
        if (layout[row][column] == 0) {
            return 0;
        } else {
            return 1 + (column * 10) + ((seed % layout[row][column]) % 10);
        }
    }

    function getSeed(uint256 id) public view returns (uint256) {
        return _seeds[id];
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _getLayout(uint256 index) internal pure returns (uint16[9][3] memory) {
        return [
            [
                [1009, 0, 1013, 1019, 0, 1021, 0, 0, 1031],
                [1033, 0, 0, 1039, 1049, 0, 0, 1051, 1061],
                [0, 1063, 0, 1069, 0, 1087, 1091, 0, 1093]
            ],
            [
                [0, 1097, 1103, 0, 0, 0, 1109, 1117, 1123],
                [1129, 0, 1151, 0, 1153, 0, 0, 1163, 1171],
                [0, 0, 1181, 1187, 0, 1193, 0, 1201, 1213]
            ],
            [
                [1217, 0, 0, 1223, 1229, 0, 1231, 0, 1237],
                [0, 1249, 1259, 0, 1277, 1279, 1283, 0, 0],
                [0, 1289, 1291, 0, 0, 1297, 1301, 1303, 0]
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
}
