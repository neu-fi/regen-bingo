// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;
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
}
