// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/IRegenBingoSVG.sol";

contract RegenBingoSVG is IRegenBingoSVG {
    uint256 constant xOffset = 240;
    uint256 constant yOffset = 935;
    uint256 constant circleXOffset = 300;
    uint256 constant circleYOffset = 900;
    string[18] backgroundColors = [
        "#709F79",
        "#5B7074"
        "#496851",
        "#9C9491",
        "#E0BB44",
        "#A0B59E",
        "#A4A57A",
        "#ffe5b4",
        "#5f9ea0",
        "#d2b48c",
        "#D0C4AB",
        "#f5f5dc",
        "#ffefd5",
        "#BAB86C",
        "#ffdab9",
        "#dcae96",
        "#b57170",
        "#A0522D"
    ];

    string constant defs =
        string(
            abi.encodePacked(
                "<defs>",
                '<path id="p" d="M0 0 L4800 0 Z"/>',
                '<text id="t">',
                '<textPath xlink:href="#p" textLength="2200" font-size="35">',
                unicode"Donating 0.05 ETH · Gitcoin Alpha Round · 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 · January 31, 2023",
                '<animate attributeName="startOffset" values="2400; 0" dur="9s" repeatCount="indefinite"/> ',
                "</textPath>",
                "</text>",
                "</defs>"
            )
        );

    string constant styles = '<style>text{font-family:Monaco;font-size:100px}svg{stroke:black;stroke-width:1}.a{fill:#57b592}.b{fill:#bde4df}.c{fill:#f8ce47}.d{fill:#fcf2b1}</style>';

    string constant cardPattern =
        string(
            abi.encodePacked(
                '<pattern id="bg" width="0.111111111111" height="0.333333333333">',
                '<polygon class="a" points="0,0 0,200 200,200"/>',
                '<polygon class="c" points="0,0 200,0 200,200"/>',
                '<rect class="d" x="20" y="20" width="160" height="160"/>'
                "</pattern>"
            )
        );

    string constant header =
        string(
            abi.encodePacked(
                '<polygon class="b" points="200,500 200,800 2000,800 2000,500" />',
                '<polygon class="c" points="200,500 200,800 350,650"/>',
                '<polygon class="c" points="2000,500 2000,800 1850,650"/>',
                '<rect class="d" x="220" y="520" width="1760" height="260"/>',
                '<text x="1100" y="650" dominant-baseline="middle" text-anchor="middle" style="font-size:150">Regen Bingo</text>'
            )
        );

    string constant footer =
        string(
            abi.encodePacked(
                '<polygon class="b" points="200,1400 200,1500 2000,1500 2000,1400"/>',
                '<polygon class="a" points="200,1400 200,1500 250,1450"/>',
                '<polygon class="a" points="2000,1400 2000,1500 1950,1450"/>',
                '<rect class="d" x="220" y="1420" width="1760" height="60"/>',
                '<clipPath id="clip">',
                '<rect x="230" y="1420" width="1740" height="60"/>',
                "</clipPath>",
                '<g clip-path="url(#clip)">',
                '<use x="-1900" y="1460" href="#t"/>',
                '<use x="500" y="1460" href="#t"/>',
                "</g>"
            )
        );

    function generateTokenSVG(
        uint256 tokenId,
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered
    ) external view returns (string memory) {
        return (
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2200 2200" style="background-color:',
                    backgroundColors[tokenId % backgroundColors.length],
                    '">',
                    defs,
                    styles,
                    cardPattern,
                    '<g><polygon style="stroke-width: 15;" points="200,500 200,1500 2000,1500 2000,500" />'
                    '<rect fill="url(#bg)" x="200" y="800" width="1800" height="600"/>',
                    '<animateTransform dur="8s" repeatCount="indefinite" attributeName="transform" attributeType="XML" type="rotate" values="1;-1;1"/>',
                    '<animateMotion dur="9s" repeatCount="indefinite" path="M-50,0 C-50,-200 50,200 50,0 C50,-200 -50,200 -50,0"/>',
                    _generateNumbers(numbers, covered),
                    header,
                    footer,
                    '</g></svg>'
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
            xCordinate = Strings.toString(x * 200 + xOffset + 35);
        } else {
            xCordinate = Strings.toString(x * 200 + xOffset);
        }
        yCordinate = Strings.toString(y * 200 + yOffset);

        if (covered) {
            output = string(
                abi.encodePacked(
                    '<circle fill="#ee2d25" cx="',
                    circleX,
                    '"cy="',
                    circleY,
                    '"r="75"></circle>'
                )
            );
        }

        output = string(
            abi.encodePacked(
                output,
                '<text x="',
                xCordinate,
                '"y="',
                yCordinate,
                '">',
                Strings.toString(number),
                '</text>'
            )
        );

        return output;
    }
}
