// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "packages/backend/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RegenBingo is ERC721 {
    uint256 public mintPrice;
    uint256 public drawTimestamp;
    uint256 public drawNumberCooldownSeconds;
    address payable public charityAddress;

    uint256[] public drawnNumbers;
    uint256 public lastDrawTime;
    uint256 public totalSupply;

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
        _mint(msg.sender, totalSupply);
        totalSupply++;
    }

    function drawNumber() external returns (uint256) {
        require(block.timestamp > lastDrawTime + drawNumberCooldownSeconds, "DRAW_TOO_SOON");
        uint256 number = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 99;
        drawnNumbers.push(number);
        lastDrawTime = block.timestamp;
        return number;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(ownerOf(id) != address(0), "URI query for nonexistent token");
        //TODO: return URI
    }

    function claimPrize(uint256 id) external {
        require(_isWinningTicket(id), "not winning ticket");
        charityAddress.call{value: address(this).balance / 2}("");
        payable(ownerOf(id)).call{value: address(this).balance}("");
    }

    function _isWinningTicket(uint256 id) internal returns (bool) {}
}
