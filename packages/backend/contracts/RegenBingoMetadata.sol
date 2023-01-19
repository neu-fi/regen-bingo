// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/IRegenBingoSVG.sol";
import "./interfaces/IRegenBingoMetadata.sol";

contract RegenBingoMetadata is IRegenBingoMetadata {
    IRegenBingoSVG svgGenerator;

    constructor(address _svgGeneratorAddress) {
        svgGenerator = IRegenBingoSVG(_svgGeneratorAddress);
    }

    function generateTokenURI(
        uint256 tokenId,
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered
    ) external view virtual returns (string memory) {
        string memory svg = svgGenerator.generateTokenSVG(tokenId, numbers, covered);
        string memory image = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svg))
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        "RegenBingo",
                        " #",
                        Strings.toString(tokenId),
                        '", "description": "...", "image": "',
                        image,
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
                        abi.encodePacked(
                            '{"name":"RegenBingo"'
                            '","description":"RegenBingo is a simple experimental game to raise ETH for public goods funding while entertaining us greenpilled regens.","image":"'
                            ""
                            '","external_url":"https://www.regen.bingo"}'
                        )
                    )
                )
            );
    }
}
