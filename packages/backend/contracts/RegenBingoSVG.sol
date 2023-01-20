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
    string[40] backgroundColors = [
        "#5f9e80",
        "#909F79",
        "#9C9491",
        "#A0B59E",
        "#a3b18a",
        "#A9B9A9",
        "#b08968",
        "#b1a7a6",
        "#b57170",
        "#b5e48c",
        "#BAB86C",
        "#c9ada7",
        "#cad2c5",
        "#cbf3f0",
        "#ccd5ae",
        "#cce3de",
        "#D0C4AB",
        "#d2b48c",
        "#d4a373",
        "#d5bdaf",
        "#d9ed92",
        "#dad7cd",
        "#dcae96",
        "#dda15e",
        "#ddb892",
        "#E0BB44",
        "#e6ccb2",
        "#e9d8a6",
        "#e9edc9",
        "#eaac8b",
        "#eec643",
        "#f2c078",
        "#f5f5dc",
        "#f7c59f",
        "#fec89a",
        "#ffb5a7",
        "#ffc43d",
        "#ffdab9",
        "#ffe5b4",
        "#ffefd5"
    ];

    string constant defs =
        string(
            abi.encodePacked(
                "<defs>",
                '<g id="p"><path fill="#02E2AC" d="M10-0 10-16A1 1 0 00-10-16L-10 0z"/><path fill="#B3FFED" d="M-10 0-10 16A1 1 18 0010 16L10-0z"/></g><g id="pbg"><use href="#p" transform="translate(1600 1733) rotate(130 442 41) scale(2,2)"/><use href="#p" transform="translate(500 2133) rotate(44 11 555) scale(2,2)"/><use href="#p" transform="translate(200 2200) rotate(20 200 200) scale(2,2)"/><use href="#p" transform="translate(1000 315) rotate(130 442 41) scale(2,2)"/><use href="#p" transform="translate(50 250) rotate(80 200 200) scale(2,2)"/><use href="#p" transform="translate(444 888) rotate(160 400 400) scale(2,2)"/><use href="#p" transform="translate(400 1700) rotate(40 67 124) scale(2,2)"/><use href="#p" transform="translate(0 550) rotate(140 11 362) scale(2,2)"/><use href="#p" transform="translate(0 1100) rotate(0 200 200) scale(3,3)"/><use href="#p" transform="translate(1733 333) rotate(299 60 60) scale(3,3)"/><use href="#p" transform="translate(1312 50) rotate(99 14 21) scale(3,3)"/><use href="#p" transform="translate(2200 1993) rotate(11 414 241) scale(3,3)"/><use href="#p" transform="translate(630 0) rotate(30 124 532) scale(3,3)"/><use href="#p" transform="translate(1750 850) rotate(60 200 200) scale(3,3)"/><use href="#p" transform="translate(0 0) rotate(310 595 381) scale(3,3)"/><use href="#p" transform="translate(300 1100) rotate(180 491 372) scale(3,3)"/><use href="#p" transform="translate(2150 650) rotate(320 713 321) scale(4,4)"/><use href="#p" transform="translate(400 400) rotate(180 700 700) scale(4,4)"/><use href="#p" transform="translate(10 155) rotate(280 412 132) scale(4,4)"/><use href="#p" transform="translate(12 93) rotate(33 241 414) scale(4,4)"/><use href="#p" transform="translate(250 1997) rotate(100 200 200) scale(4,4)"/><use href="#p" transform="translate(1114 2141) rotate(51 11 410) scale(4,4)"/><use href="#p" transform="translate(-162 1693) rotate(40 414 241) scale(4,4)"/><use href="#p" transform="translate(395 113) rotate(140 241 251) scale(4,4)"/></g>',
                '<path id="pt" d="M0 0 L4800 0 Z"/>',
                '<text id="t">',
                '<textPath href="#pt" textLength="2200" font-size="35">',
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
                '<polygon class="b" points="200,500 200,800 2000,800 2000,500"/>',
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
                    _generatePillPattern(tokenId),
                    cardPattern,
                    '<g><polygon style="stroke-width: 20" points="200,500 200,1500 2000,1500 2000,500"/>'
                    '<rect fill="url(#bg)" x="200" y="800" width="1800" height="600"/>',
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
                    '" cy="',
                    circleY,
                    ' "r="75"></circle>'
                )
            );
        }

        output = string(
            abi.encodePacked(
                output,
                '<text x="',
                xCordinate,
                '" y="',
                yCordinate,
                '">',
                Strings.toString(number),
                '</text>'
            )
        );

        return output;
    }

    function _generatePillPattern(
        uint256 tokenId
    ) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<use href="#pbg" class="rotate" transform="rotate(',
                Strings.toString(uint256(keccak256(abi.encodePacked(tokenId))) % 360),
                ' 1100 1100)"/>'
            )
        );
    }
}
