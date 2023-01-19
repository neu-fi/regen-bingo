interface IRegenBingoMetadata {
    function generateTokenURI(
        uint256 tokenId,
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered
    ) external view virtual returns (string memory);

    function generateContractURI() external pure returns (string memory);
}
