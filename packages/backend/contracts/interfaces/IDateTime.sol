interface IDateTime {
    function timestampToDate(uint256)
        external
        pure
        returns (
            uint256,
            uint256,
            uint256
        );

    function timestampToDateTime(uint256 timestamp)
        external
        pure
        returns (
            uint256 year,
            uint256 month,
            uint256 day,
            uint256 hour,
            uint256 minute,
            uint256 second
        );
}
