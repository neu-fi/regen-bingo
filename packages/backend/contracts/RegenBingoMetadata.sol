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
        bool[9][3] calldata covered
    ) external view returns (string memory) {
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name":"RegenBingo #',
                        Strings.toString(tokenId),
                        '","description":"...","numbers":',
                        _generateNumbersStringFraction(numbers),
                        ',"covered":',
                        _generateCoveredStringFraction(covered),
                        ',"image":"',
                        _generateImageStringFraction(tokenId, numbers, covered),
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

    function _generateNumbersStringFraction(
        uint256[9][3] calldata numbers
    ) internal view returns (string memory) {
        string memory firstRow = string(abi.encodePacked(
            Strings.toString(numbers[0][0]) ,',',
            Strings.toString(numbers[0][1]) ,',',
            Strings.toString(numbers[0][2]) ,',',
            Strings.toString(numbers[0][3]) ,',',
            Strings.toString(numbers[0][4]) ,',',
            Strings.toString(numbers[0][5]) ,',',
            Strings.toString(numbers[0][6]) ,',',
            Strings.toString(numbers[0][7]) ,',',
            Strings.toString(numbers[0][8])
        ));

        string memory secondRow = string(abi.encodePacked(
            Strings.toString(numbers[1][0]) ,',',
            Strings.toString(numbers[1][1]) ,',',
            Strings.toString(numbers[1][2]) ,',',
            Strings.toString(numbers[1][3]) ,',',
            Strings.toString(numbers[1][4]) ,',',
            Strings.toString(numbers[1][5]) ,',',
            Strings.toString(numbers[1][6]) ,',',
            Strings.toString(numbers[1][7]) ,',',
            Strings.toString(numbers[1][8])
        ));

        string memory thirdRow = string(abi.encodePacked(
            Strings.toString(numbers[2][0]) ,',',
            Strings.toString(numbers[2][1]) ,',',
            Strings.toString(numbers[2][2]) ,',',
            Strings.toString(numbers[2][3]) ,',',
            Strings.toString(numbers[2][4]) ,',',
            Strings.toString(numbers[2][5]) ,',',
            Strings.toString(numbers[2][6]) ,',',
            Strings.toString(numbers[2][7]) ,',',
            Strings.toString(numbers[2][8])
        ));

        return string(abi.encodePacked('[[',firstRow,'],[',secondRow,'],[',thirdRow,']]'));
    }

    function _generateCoveredStringFraction(
        bool[9][3] calldata covered
    ) internal view returns (string memory) {
        string memory firstRow = string(abi.encodePacked(
            (covered[0][0] ? 'true' : 'false'), ',',
            (covered[0][1] ? 'true' : 'false'), ',',
            (covered[0][2] ? 'true' : 'false'), ',',
            (covered[0][3] ? 'true' : 'false'), ',',
            (covered[0][4] ? 'true' : 'false'), ',',
            (covered[0][5] ? 'true' : 'false'), ',',
            (covered[0][6] ? 'true' : 'false'), ',',
            (covered[0][7] ? 'true' : 'false'), ',',
            (covered[0][8] ? 'true' : 'false')
         ));

        string memory secondRow = string(abi.encodePacked(
            (covered[1][0] ? 'true' : 'false'), ',',
            (covered[1][1] ? 'true' : 'false'), ',',
            (covered[1][2] ? 'true' : 'false'), ',',
            (covered[1][3] ? 'true' : 'false'), ',',
            (covered[1][4] ? 'true' : 'false'), ',',
            (covered[1][5] ? 'true' : 'false'), ',',
            (covered[1][6] ? 'true' : 'false'), ',',
            (covered[1][7] ? 'true' : 'false'), ',',
            (covered[1][8] ? 'true' : 'false')
         ));

        string memory thirdRow = string(abi.encodePacked(
            (covered[2][0] ? 'true' : 'false'), ',',
            (covered[2][1] ? 'true' : 'false'), ',',
            (covered[2][2] ? 'true' : 'false'), ',',
            (covered[2][3] ? 'true' : 'false'), ',',
            (covered[2][4] ? 'true' : 'false'), ',',
            (covered[2][5] ? 'true' : 'false'), ',',
            (covered[2][6] ? 'true' : 'false'), ',',
            (covered[2][7] ? 'true' : 'false'), ',',
            (covered[2][8] ? 'true' : 'false')
         ));

        return string(abi.encodePacked('[[',firstRow,'],[',secondRow,'],[',thirdRow,']]'));
    }
    function _generateImageStringFraction(
        uint256 tokenId,
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered
    ) internal view returns (string memory) {
        string memory svg = svgGenerator.generateTokenSVG(tokenId, numbers, covered);
        return string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svg))
            )
        );
    }
}
