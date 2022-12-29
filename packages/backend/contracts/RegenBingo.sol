// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "packages/backend/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RegenBingo is ERC721 {
    uint256 public mintPrice;
    uint256 public drawTimestamp;
    uint256 public drawNumberCooldownSeconds;
    address public charityAddress;

    uint256[] public drawnNumbers;
    uint256 lastDrawTime;
    bool public won = false;

    mapping(uint256 => uint256[25]) public cardNumbers;
    mapping(uint256 => uint256) private _seeds;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _mintPrice,
        uint256 _drawTimestamp,
        uint256 _drawNumberCooldownSeconds,
        address _charityAddress
    ) ERC721(_name, _symbol) {
        mintPrice = _mintPrice;
        drawTimestamp = _drawTimestamp;
        drawNumberCooldownSeconds = _drawNumberCooldownSeconds;
        charityAddress = _charityAddress;
    }

    function buyCard(uint256 id) external payable {
        require(msg.value == CARD_PRICE, "INVALID_PRICE");
        _mint(msg.sender, id);
    }

    function drawNumber() external returns (uint256) {
        require(block.timestamp > lastDrawTime + 5 minutes, "DRAW_TOO_SOON");
        uint256 number = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 99;
        drawnNumbers.push(number);
        lastDrawTime = block.timestamp;
        return number;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(ownerOf(id) != address(0), "URI query for nonexistent token");
        //TODO: return URI
    }

    function claimWinningTicket(uint256 id) external {
        require(ownerOf(id) == msg.sender, "NOT_OWNER");
        require(!won, "ALREADY_WON");
        //TODO: check if card has winning combination
        won = true;
        payable(msg.sender).transfer(address(this).balance / 2);
    }
}
