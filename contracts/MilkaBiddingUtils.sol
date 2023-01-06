pragma solidity ^0.8.0;

abstract contract MilkaBiddingUtils {
    event CreatedBidding(
        uint256 hashId,
        bytes32 title,
        bytes32 description,
        address payable currentOwner
    );
    event AcceptedProposal(
        uint256 hashId,
        bytes32 title,
        bytes32 description,
        address payable currentOwner,
        uint256 value
    );
    event CancelProposal(uint256 hashId, bytes32 title, bytes32 description);
    event RejectedProposal(uint256 hashId);

    struct Product {
        uint256 hashId;
        uint256 createDate;
        uint256 endDate;
        uint256 currentDeltaTime;
        uint256 value;
        uint256 nextMinValue;
        address payable currentOwner;
        address payable biddingCreator;
        bytes32 title;
        bytes32 description;
        uint256 addityProcent;
        bool isEndBidding;
    }

    function emitFinishedBidding(Product memory prod) public {
        if (prod.currentOwner == address(0)) {
            emit CancelProposal(prod.hashId, prod.title, prod.description);
        } else {
            emit AcceptedProposal(
                prod.hashId,
                prod.title,
                prod.description,
                prod.currentOwner,
                prod.value
            );
        }
    }

    function calcUpdatedTime(uint256 currTime, uint256 deltaTime)
        public
        pure
        returns (uint256)
    {
        return currTime + deltaTime;
    }
}
