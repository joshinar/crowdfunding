// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    mapping(address => uint) public contributors;
    address payable public owner;
    uint public timeline;
    uint public fundingGoal;
    uint public raisedAmount;

    constructor(uint _timeline, uint _fundingGoal) {
        timeline = block.timestamp + _timeline;
        fundingGoal = _fundingGoal;
        owner = payable(msg.sender);
    }

    modifier _onlyOwner() {
        require(msg.sender == owner, "Only owner can calll this function");
        _;
    }

    // checks if crowdfunding timeline has paased
    modifier _checkTimeline() {
        require(
            timeline >= block.timestamp,
            "Crowdfunding timeline has passed"
        );
        _;
    }

    // checks if refund can be issued if timeline & goal amount is not reached
    modifier _isEligibleForRefund() {
        require(
            block.timestamp > timeline && raisedAmount < fundingGoal,
            "You are not eligble for refund"
        );
        _;
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    function checkUserBalance(address _address) private view returns (bool) {
        return contributors[_address] > 0;
    }

    function sendFunds() public payable _checkTimeline {
        require(msg.value > 0, "Amount cannot be 0");
        contributors[msg.sender] += msg.value;
        raisedAmount += msg.value;
    }

    function getRefund() public _isEligibleForRefund {
        require(checkUserBalance(msg.sender), "Not enough Balance");
        (bool success, ) = msg.sender.call{value: contributors[msg.sender]}("");
        require(success, "Failed to issue refund");
        contributors[msg.sender] = 0;
    }

    //  withdraw amount to owner address post crowdfunding completion
    function withdraw() public _onlyOwner {
        require(raisedAmount >= fundingGoal, "Funding goal amount not reached");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Unable to withdraw");
    }
}
