pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {MilkaBiddingUtils} from "./MilkaBiddingUtils.sol";

contract MilkaSingleBidding is MilkaBiddingUtils {
    uint256 MAX_TIME = 24 * 60 * 60;
    uint256 MIN_TIME = 10 * 60;
    uint256 constant DEFAULT_HASH_ID = 0;

    struct HelpFibDelta {
        uint256 a;
        uint256 b;
    }

    Product private prod;
    HelpFibDelta private prevTwoDeltaTimes;

    modifier biddingIsNotFinished() {
        require(!prod.isEndBidding, "Bidding is finished");
        _;
    }

    /**
        comm: Contructor of our bidding. We can put here his title, description, start 
            value of user's item and another options;
     */
    constructor(
        bytes32 title,
        bytes32 description,
        uint256 minValue,
        uint256 minTime,
        uint256 maxTime,
        uint256 addityProcent
    ) {
        require(
            minTime <= maxTime,
            "Please, input correct time: minTime must be less than maxTime"
        );

        prod.biddingCreator = payable(msg.sender);
        prod.title = title;
        prod.description = description;
        prod.createDate = block.timestamp;
        prod.addityProcent = addityProcent;
        prod.nextMinValue = minValue;

        if (maxTime != 0) MAX_TIME = maxTime;
        if (minTime != 0) MIN_TIME = minTime;

        prevTwoDeltaTimes.b = MIN_TIME;
        prod.currentDeltaTime = _getDeltaTime();
        _updateEndTime();

        emit MilkaBiddingUtils.CreatedBidding(
            DEFAULT_HASH_ID,
            title,
            description,
            prod.biddingCreator
        );
    }

    /**
        comm: by this function user can buy some item;
    */
    function buyItem() public payable biddingIsNotFinished returns (bool) {
        require(block.timestamp < prod.endDate, "Finish");

        require(msg.value >= prod.nextMinValue, "Value is incorrect");

        if (prod.currentOwner != address(0)) {
            prod.currentOwner.transfer(prod.value);
        }
        prod.currentOwner = payable(msg.sender);
        prod.value = msg.value;
        prod.nextMinValue =
            prod.value +
            (prod.value / 100) *
            prod.addityProcent;
        prod.currentDeltaTime = _getDeltaTime();
        _updateEndTime();
        return true;
    }

    function currentAddress() public view returns (address) {
        return prod.currentOwner;
    }

    function currentDeltaTime() public view returns (uint256) {
        return prod.currentDeltaTime;
    }

    function currentIsFinished() public view returns (bool) {
        return !prod.isEndBidding;
    }

    // ----------------------//

    /**
        comm: update Fibanachi numbers and calculate new `delta-time`
     */
    function _getDeltaTime() private returns (uint256) {
        uint256 first = prevTwoDeltaTimes.a;
        uint256 second = prevTwoDeltaTimes.b;
        uint256 prevTimeSum = first + second;

        if (MAX_TIME - prevTimeSum <= 0) {
            return MIN_TIME;
        } else {
            prevTwoDeltaTimes.a = second;
            prevTwoDeltaTimes.b = prevTimeSum;
            return (MAX_TIME - prevTimeSum);
        }
    }

    /**
        comm: update biding's end-time
     */
    function _updateEndTime() private {
        prod.endDate = MilkaBiddingUtils.calcUpdatedTime(
            block.timestamp,
            prod.currentDeltaTime
        );
    }

    /**
        comm: check, that current bidding has free time;
     */
    function tryFinishBidding() public returns (bool) {
        if (block.timestamp >= prod.endDate) {
            _finishBidding();
            return true;
        }

        return false;
    }

    /**
        comm: finish current bidding and transfer money to previous owner of this item;
     */
    function _finishBidding() private {
        prod.isEndBidding = true;

        if (prod.currentOwner != address(0)) {
            prod.biddingCreator.transfer(prod.value);
        }
        emitFinishedBidding(prod);
    }
}
