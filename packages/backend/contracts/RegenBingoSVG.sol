// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/IRegenBingoSVG.sol";

contract RegenBingoSVG is IRegenBingoSVG {
    uint256 constant xOffset = 250;
    uint256 constant yOffset = 935;
    uint256 constant circleXOffset = 300;
    uint256 constant circleYOffset = 900;
    string[5] backgroundColors = [
        "#FF7F50",
        "#CCCCFF",
        "#40E0D0",
        "#6495ED",
        "#9FE2BF"
    ];

    string constant defs =
        string(
            abi.encodePacked(
                "<defs>",
                '<path id="text-path-a" d="M0 0 L5400 0 Z"/>',
                '<text id="rolling-text-right" text-rendering="optimizeSpeed">',
                '<textPath xlink:href="#text-path-a" textLength="1600" font-size="35" font-weight="500">',
                "The Gitcoin Alpha Round * 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 * January 31, 2023",
                '<animate attributeName="startOffset" values="0; 1700" dur="10s" repeatCount="indefinite"/> ',
                "</textPath>",
                "</text>",
                "</defs>"
            )
        );

    string constant styles =
        string(
            abi.encodePacked(
                "<style>",
                "text {",
                "font-family: Monaco;",
                "font-size:100px;",
                "font-weight:500;}",
                "polygon {",
                "stroke:black; stroke-width:1;}",
                ".a{",
                "fill:#57b592;}",
                ".b{",
                "fill:#bde4df;}",
                "</style>"
            )
        );

    string constant cardPattern =
        string(
            abi.encodePacked(
                '<pattern id="bg" width="0.111111111111" height="0.333333333333">',
                '<polygon points="0,0 0,200 200,200" style="fill:#57b592; stroke:black; stroke-width:1"/>',
                '<polygon points="0,0 200,0 200,200" style="fill:#f8ce47; stroke:black; stroke-width:1"/>',
                '<rect id="x" x="20" y="20" width="160" height="160" style="fill: #fcf2b1; stroke:black ; stroke-width:1"/>'
                "</pattern>"
            )
        );

    string constant header =
        string(
            abi.encodePacked(
                '<polygon class="b" points="200,500 200,800 2000,800 2000,500" />',
                '<polygon class="a" points="200,500 200,800 350,650" style="fill:#f8ce47"/>',
                '<polygon class="a" points="2000,500 2000,800 1850,650" style="fill:#f8ce47"/>',
                '<rect id="x" x="220" y="520" width="1760" height="260" style="fill: #fcf2b1; stroke:black; stroke-width:1"/>',
                '<text x="700" y="710" style="font-size:150">Regen Bingo</text>'
            )
        );

    string constant footer =
        string(
            abi.encodePacked(
                '<polygon class="b" points="200,1400 200,1500 2000,1500 2000,1400"/>',
                '<polygon class="a" points="200,1400 200,1500 250,1450"/>',
                '<polygon class="a" points="2000,1400 2000,1500 1950,1450"/>',
                '<rect id="x" x="220" y="1420" width="1760" height="60" style="fill: #fcf2b1; stroke:black; stroke-width:1"/>',
                '<clipPath id="clip">',
                '<rect x="230" y="1420" width="1740" height="60"/>',
                "</clipPath>",
                '<g clip-path="url(#clip)">',
                '<use x="-1400" y="1460" href="#rolling-text-right"/>',
                '<use x="300" y="1460" href="#rolling-text-right"/>',
                "</g>"
            )
        );

    function generateTokenSVG(
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered
    ) external view returns (string memory) {
        string memory background;
        uint256 colorIndex = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    msg.sender
                )
            )
        ) % 5;
        string memory bgColor = backgroundColors[colorIndex];

        background = string(
            abi.encodePacked(
                "<rect fill=",
                '"',
                bgColor,
                '"',
                'x="0" y="0" width="2200" height="2200"/>'
            )
        );

        return (
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2200 2200">',
                    defs,
                    styles,
                    background,
                    cardPattern,
                    "<g>",
                    '<rect fill="url(#bg)" x="200" y="800" width="1800" height="600"/>',
                    '<animateTransform attributeName="transform" attributeType="XML" type="rotate" values="1;-1;1" dur="9s" repeatCount="indefinite"/>',
                    '<animateMotion dur="17s" repeatCount="indefinite" path="M20,50 C20,-50 180,150 180,50 C180-50 20,150 20,50 z"/>',
                    _generateNumbers(numbers, covered),
                    header,
                    footer,
                    "</g>",
                    "</svg>"
                )
            )
        );
    }

    function _generateNumbers(
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered
    ) internal pure returns (string memory) {
        string memory output;
        for (uint256 i = 0; i < 3; i++) {
            for (uint256 j = 0; j < 9; j++) {
                if (numbers[i][j] > 0) {
                    output = string(
                        abi.encodePacked(
                            output,
                            _generateNumberSVG(
                                i,
                                j,
                                numbers[i][j],
                                covered[i][j]
                            )
                        )
                    );
                }
            }
        }
        return output;
    }

    function _generateNumberSVG(
        uint256 y,
        uint256 x,
        uint256 number,
        bool covered
    ) internal pure returns (string memory) {
        string memory output;
        string memory xCordinate;
        string memory yCordinate;
        string memory circleX = Strings.toString(x * 200 + circleXOffset);
        string memory circleY = Strings.toString(y * 200 + circleYOffset);

        if (number < 10) {
            xCordinate = Strings.toString(x * 200 + xOffset + 25);
        } else {
            xCordinate = Strings.toString(x * 200 + xOffset);
        }
        yCordinate = Strings.toString(y * 200 + yOffset);

        if (covered) {
            output = string(
                abi.encodePacked(
                    '<circle fill="#ee2d25" cx=',
                    '"',
                    circleX,
                    '"',
                    "cy=",
                    '"',
                    circleY,
                    '"',
                    'r="75"></circle>'
                )
            );
        }

        output = string(
            abi.encodePacked(
                output,
                "<text x=",
                '"',
                xCordinate,
                '"',
                "y=",
                '"',
                yCordinate,
                '"',
                ">",
                Strings.toString(number),
                "</text>"
            )
        );

        return output;
    }
}
