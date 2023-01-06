pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {MilkaBiddingUtils} from "./MilkaBiddingUtils.sol";

contract MilkaQueueBidding is MilkaBiddingUtils {
    uint256 MIN_TIME = 10 * 60;
    uint256 public constant QUEUE_COUNT = 3;

    Product[QUEUE_COUNT] propArray;

    modifier hashExists(uint256 hashId) {
        for (uint256 i = 0; i < QUEUE_COUNT; i++) {
            require(propArray[i].hashId != hashId);
        }
        _;
    }

    constructor(uint256 minTime) {
        MIN_TIME = minTime;
    }

    /**
        comm: Init new bidding;
        $hashId: hash of your bidding;
        $title: title of your bidding;
        $description: description of your bidding;
        $minValue: start price on your bidding;
     */
    function createBidding(
        uint256 hashId,
        bytes32 title,
        bytes32 description,
        uint256 minValue
    ) public hashExists(hashId) {
        int256 prodArrayIndexMaybe = _getFreeProposal(hashId);
        if (prodArrayIndexMaybe == -1) return;
        uint256 prodArrayIndex = uint256(prodArrayIndexMaybe);

        propArray[prodArrayIndex].hashId = hashId;
        propArray[prodArrayIndex].biddingCreator = payable(msg.sender);
        propArray[prodArrayIndex].title = title;
        propArray[prodArrayIndex].description = description;
        propArray[prodArrayIndex].createDate = block.timestamp;
        propArray[prodArrayIndex].addityProcent = 5;
        propArray[prodArrayIndex].nextMinValue = minValue;
        propArray[prodArrayIndex].currentDeltaTime = MIN_TIME;

        _updateEndTime(prodArrayIndex);

        emit CreatedBidding(
            hashId,
            title,
            description,
            propArray[prodArrayIndex].biddingCreator
        );
    }

    /**
        comm: by this function user can buy some item with $hashId;
        $hashId: id of item, which you want buy;

        throw exceptions, if:
            *) $hashId == 0 or can't find item with this $hashId;
            *) your value is less than minimum value of item;

     */
    function buyItem(uint256 hashId) public payable returns (bool) {
        require(hashId != 0);
        int256 prodArrayIndexMaybe = _getPropByHash(hashId);
        require(prodArrayIndexMaybe != -1, "Uknown hashId");
        uint256 propIndex = uint256(prodArrayIndexMaybe);

        if (_timeCheck(propIndex)) return false;

        require(
            msg.value >= propArray[propIndex].nextMinValue,
            "Value is incorrect"
        );

        if (propArray[propIndex].currentOwner != address(0)) {
            propArray[propIndex].currentOwner.transfer(
                propArray[propIndex].value
            );
        }
        propArray[propIndex].currentOwner = payable(msg.sender);

        _updateProductPrice(propIndex, msg.value);
        _updateEndTime(propIndex);
        return true;
    }

    function currentAddress(uint256 hashId) public view returns (address) {
        uint256 propIndex = _getUintHashIdOrRequire(hashId);
        return propArray[propIndex].currentOwner;
    }

    function currentDeltaTime(uint256 hashId) public view returns (uint256) {
        uint256 propIndex = _getUintHashIdOrRequire(hashId);

        return propArray[propIndex].currentDeltaTime;
    }

    function tryFinishBidding(uint256 hashId) public returns (bool) {
        uint256 propIndex = _getUintHashIdOrRequire(hashId);

        if (block.timestamp >= propArray[propIndex].endDate) {
            _finishBidding(propIndex);
            return true;
        }

        return false;
    }

    // ----------------------//

    function _getUintHashIdOrRequire(uint256 hashId)
        private
        view
        returns (uint256)
    {
        require(hashId != 0);
        int256 prodArrayIndexMaybe = _getPropByHash(hashId);
        require(prodArrayIndexMaybe != -1, "Uknown hashId");
        uint256 propIndex = uint256(prodArrayIndexMaybe);
        return propIndex;
    }

    /**
        comm: update time of item, which we can take by the index $prodArrayIndex;
     */
    function _updateEndTime(uint256 prodArrayIndex) private {
        propArray[prodArrayIndex].endDate = MilkaBiddingUtils.calcUpdatedTime(
            block.timestamp,
            MIN_TIME
        );
    }

    /**
        comm: finish bidding of item, which we can take by the index $prodArrayIndex;
     */
    function _finishBidding(uint256 prodArrayIndex) private {
        if (propArray[prodArrayIndex].currentOwner != address(0))
            propArray[prodArrayIndex].biddingCreator.transfer(
                propArray[prodArrayIndex].value
            );

        emitFinishedBidding(propArray[prodArrayIndex]);
    }

    /**
        comm: returns index of first free element in the queue or (-1), if can't find;
     */
    function _getFreeProposal(uint256 hashId) private returns (int256) {
        for (uint256 i = 0; i < QUEUE_COUNT; i++) {
            _timeCheck(i);
        }
        for (uint256 i = 0; i < QUEUE_COUNT; i++) {
            if (propArray[i].endDate == 0) return int256(i);
        }

        emit MilkaBiddingUtils.RejectedProposal(hashId);
        return -1;
    }

    /**
        comm: returns index of element with $hashId or (-1);
     */
    function _getPropByHash(uint256 hashId) private view returns (int256) {
        for (uint256 i = 0; i < 3; i++) {
            // try return index
            if (propArray[i].hashId == hashId) return int256(i);
        }
        return -1;
    }

    /**
        comm: check, that element with index $propIndex has free time or close his bidding;
     */
    function _timeCheck(uint256 propIndex) private returns (bool) {
        if (
            block.timestamp > propArray[propIndex].endDate &&
            propArray[propIndex].endDate != 0
        ) {
            _finishBidding(propIndex);
            _clearProp(propIndex);
            return true;
        }
        return false;
    }

    /**
        comm: update prive of element with $propIndex;
     */
    function _updateProductPrice(uint256 propIndex, uint256 msgValue) private {
        propArray[propIndex].value = msgValue;
        propArray[propIndex].nextMinValue =
            msgValue +
            (msgValue / 100) *
            propArray[propIndex].addityProcent;
    }

    function _clearProp(uint256 propIndex) private {
        delete propArray[propIndex];
    }

    function getTimeStampEnd(uint256 hashId) public view returns (uint256) {
        uint256 propIndex = _getUintHashIdOrRequire(hashId);

        return propArray[propIndex].endDate;
    }
}
