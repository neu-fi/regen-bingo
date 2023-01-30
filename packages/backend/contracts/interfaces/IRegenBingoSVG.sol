interface IRegenBingoSVG {
    function generateTokenSVG(
        uint256 tokenId,
        uint8[9][3] calldata numbersMatrix,
        bool[9][3] calldata isDrawnMatrix,
        uint8 score,
        uint256 donationAmount,
        string memory donationName,
        address donationAddress,
        bool isBingoFinished,
        uint256 drawTimestamp
    ) external view returns (string memory);
}
