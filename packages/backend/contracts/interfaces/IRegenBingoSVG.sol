interface IRegenBingoSVG {
    function generateTokenSVG(
        uint256[9][3] calldata numbers,
        bool[9][3] calldata covered
    ) external view returns (string memory);
}
