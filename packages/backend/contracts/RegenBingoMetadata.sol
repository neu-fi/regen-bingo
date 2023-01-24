// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/IRegenBingoSVG.sol";
import "./interfaces/IRegenBingoMetadata.sol";

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
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name":"RegenBingo #',
                        Strings.toString(tokenId),
                        '","description":"...","image":"',
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
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function generateContractURI() external pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        '{"name":"RegenBingo","description":"RegenBingo is a simple experimental game to raise ETH for public goods funding while entertaining us greenpilled regens.","image":"...","external_url":"https://www.regen.bingo"}'
                    )
                )
            );
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
        return
            string(
                abi.encodePacked(
                    "data:image/svg+xml;base64,",
                    Base64.encode(bytes(svg))
                )
            );
    }
}
