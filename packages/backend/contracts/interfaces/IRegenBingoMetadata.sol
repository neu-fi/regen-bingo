interface IRegenBingoMetadata {
    function generateTokenURI(
        uint256 tokenId,
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered,
        uint256 donationAmount,
        string memory donationName,
        address donationAddress,
        bool isBingoFinished,
        uint256 drawTimestamp
    ) external view virtual returns (string memory);

    function generateContractURI() external pure returns (string memory);
}
