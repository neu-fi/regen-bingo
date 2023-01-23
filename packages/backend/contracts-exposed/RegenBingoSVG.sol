// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../contracts/RegenBingoSVG.sol";

contract $RegenBingoSVG is RegenBingoSVG {
    bytes32 public __hh_exposed_bytecode_marker = "hardhat-exposed";

    constructor(address _dateTimeContractAddress) RegenBingoSVG(_dateTimeContractAddress) {}

    function $xOffset() external pure returns (uint256) {
        return xOffset;
    }

    function $yOffset() external pure returns (uint256) {
        return yOffset;
    }

    function $circleXOffset() external pure returns (uint256) {
        return circleXOffset;
    }

    function $circleYOffset() external pure returns (uint256) {
        return circleYOffset;
    }

    function $backgroundColors() external view returns (string[40] memory) {
        return backgroundColors;
    }

    function $Months() external view returns (string[12] memory) {
        return Months;
    }

    function $dateTimeContract() external view returns (IDateTime) {
        return dateTimeContract;
    }

    function $defs1() external pure returns (string memory) {
        return defs1;
    }

    function $defs2() external pure returns (string memory) {
        return defs2;
    }

    function $styles() external pure returns (string memory) {
        return styles;
    }

    function $cardPattern() external pure returns (string memory) {
        return cardPattern;
    }

    function $header() external pure returns (string memory) {
        return header;
    }

    function $footer() external pure returns (string memory) {
        return footer;
    }

    function $_generateRollingText(uint256 donationAmount,string calldata donationName,address donationAddress,bool isBingoFinished,uint256 drawTimestamp) external view returns (string memory ret0) {
        (ret0) = super._generateRollingText(donationAmount,donationName,donationAddress,isBingoFinished,drawTimestamp);
    }

    function $_generateDate(uint256 timestamp) external view returns (string memory ret0) {
        (ret0) = super._generateDate(timestamp);
    }

    function $_convertWEIToEtherInString(uint256 amount) external pure returns (string memory ret0) {
        (ret0) = super._convertWEIToEtherInString(amount);
    }

    function $_generateNumbers(uint256[9][3] calldata numbers,bool[9][3] calldata covered) external pure returns (string memory ret0) {
        (ret0) = super._generateNumbers(numbers,covered);
    }

    function $_generateNumberSVG(uint256 y,uint256 x,uint256 number,bool covered) external pure returns (string memory ret0) {
        (ret0) = super._generateNumberSVG(y,x,number,covered);
    }

    function $_generatePillPattern(uint256 tokenId) external pure returns (string memory ret0) {
        (ret0) = super._generatePillPattern(tokenId);
    }

    receive() external payable {}
}
