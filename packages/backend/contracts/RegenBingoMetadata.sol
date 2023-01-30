// SPDX-License-Identifier: MIT
// @author Neufi Limited (neu.fi)

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/IRegenBingoSVG.sol";
import "./interfaces/IRegenBingoMetadata.sol";

string constant CONTRACT_METADATA = '{"name":"Regen Bingo","description":"A win-win game for regens! The first one with a full suite takes half of the pool. The other half is donated.","image":"ipfs://QmaGjcDG48ynW9htCKshQB4HvkPBjWSPuJR7QmWaWfe7Df","external_url":"https://regen.bingo"}';
contract RegenBingoMetadata is IRegenBingoMetadata {
    IRegenBingoSVG public svgGenerator;

    constructor(address _svgGeneratorAddress) {
        svgGenerator = IRegenBingoSVG(_svgGeneratorAddress);
    }

    function generateTokenURI(
        uint256 tokenId,
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered,
        uint256 donationAmount,
        string memory donationName,
        address donationAddress,
        bool isBingoFinished,
        uint256 drawTimestamp
    ) external view virtual returns (string memory) {
        string memory description = string.concat(
            'A Regen Bingo card ',
            (isBingoFinished ? 'donated' : 'donating'),
            ' to ',
            donationName,
            ' (',
            Strings.toHexString(uint256(uint160(donationAddress)), 20),
            ').'
        );

        string memory externalUrl = string.concat(
            'https://regen.bingo/cards/',
            Strings.toString(tokenId)
        );

        string memory json = string.concat(
            '{"name":"RegenBingo #',
            Strings.toString(tokenId),
            '","description":"',
            description,
            '","external_url":"',
            externalUrl,
            '","image":"',
            _generateImageStringFraction(
                tokenId,
                numbers,
                covered,
                donationAmount,
                donationName,
                donationAddress,
                isBingoFinished,
                drawTimestamp
            ),
            '","image":"',
            _generateNumbersStringFraction(numbers),
            '"}'
        );
        return string.concat('data:application/json;base64,', Base64.encode(bytes(json)));
    }

    function generateContractURI() external pure returns (string memory) {
        return string.concat('data:application/json;base64,', Base64.encode(bytes(CONTRACT_METADATA)));
    }

    function _generateImageStringFraction(
        uint256 tokenId,
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered,
        uint256 donationAmount,
        string memory donationName,
        address donationAddress,
        bool isBingoFinished,
        uint256 drawTimestamp
    ) internal view returns (string memory) {
        string memory svg = svgGenerator.generateTokenSVG(
            tokenId,
            numbers,
            covered,
            donationAmount,
            donationName,
            donationAddress,
            isBingoFinished,
            drawTimestamp
        );
        return string.concat('data:application/json;base64,', Base64.encode(bytes(svg)));
    }

    function _generateNumbersStringFraction(
        uint256[9][3] calldata numbers
    ) internal view returns (string memory) {
        string memory firstRow = string.concat(
            Strings.toString(numbers[0][0]), ',',
            Strings.toString(numbers[0][1]), ',',
            Strings.toString(numbers[0][2]), ',',
            Strings.toString(numbers[0][3]), ',',
            Strings.toString(numbers[0][4]), ',',
            Strings.toString(numbers[0][5]), ',',
            Strings.toString(numbers[0][6]), ',',
            Strings.toString(numbers[0][7]), ',',
            Strings.toString(numbers[0][8])
        );

        string memory secondRow = string.concat(
            Strings.toString(numbers[1][0]), ',',
            Strings.toString(numbers[1][1]), ',',
            Strings.toString(numbers[1][2]), ',',
            Strings.toString(numbers[1][3]), ',',
            Strings.toString(numbers[1][4]), ',',
            Strings.toString(numbers[1][5]), ',',
            Strings.toString(numbers[1][6]), ',',
            Strings.toString(numbers[1][7]), ',',
            Strings.toString(numbers[1][8])
        );

        string memory thirdRow = string.concat(
            Strings.toString(numbers[2][0]), ',',
            Strings.toString(numbers[2][1]), ',',
            Strings.toString(numbers[2][2]), ',',
            Strings.toString(numbers[2][3]), ',',
            Strings.toString(numbers[2][4]), ',',
            Strings.toString(numbers[2][5]), ',',
            Strings.toString(numbers[2][6]), ',',
            Strings.toString(numbers[2][7]), ',',
            Strings.toString(numbers[2][8])
        );

        return string.concat('[[',firstRow,'],[',secondRow,'],[',thirdRow,']]');
    }
}
