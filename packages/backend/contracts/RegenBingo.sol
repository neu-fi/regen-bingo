// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RegenBingo is ERC721 {
    uint256 constant LAYOUTS_COUNT = 3;

    uint256 public mintPrice;
    uint256 public drawTimestamp;
    uint256 public drawNumberCooldownSeconds;
    address payable public charityAddress;
    uint256[] public drawnNumbers;
    uint256 public lastDrawTime;
    uint256 public totalSupply;
    mapping(uint256 => bool) public isDrawn;
    mapping(uint256 => uint256) private _seeds;

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

    function mint() external payable {
        require(msg.value == mintPrice, "INVALID_PRICE");
        // Using msg.sig so that one can mint multiple different cards in a block
        uint256 seed = uint256(keccak256(abi.encodePacked(msg.sig, block.timestamp)));
        _seeds[totalSupply] = seed;
        _mint(msg.sender, totalSupply);
        totalSupply++;
    }

    function drawNumber() external returns (uint256) {
        require(block.timestamp > lastDrawTime + drawNumberCooldownSeconds, "DRAW_TOO_SOON");
        // TODO: Use VRF
        uint256 number = 1 + uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 90;
        isDrawn[number] = true;
        lastDrawTime = block.timestamp;
        return number;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(ownerOf(id) != address(0), "URI query for nonexistent token");
        //TODO: return URI
    }

    function claimPrize(uint256 id) external {
        require(15 <= coveredNumbers(id), "not winning ticket");
        charityAddress.call{value: address(this).balance / 2}("");
        payable(ownerOf(id)).call{value: address(this).balance}("");
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
            return 1 + (column * 10) + ((seed % layout[row][column]) / 10);
        }
    }

    function _getLayout(uint256 index) internal view returns (uint16[9][3] memory) {
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
}
