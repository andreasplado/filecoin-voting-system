// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotingContract {
    struct Proposal {
        string name;
        uint256 voteCount;
    }

    address public owner;
    bool public votingOpen;

    Proposal[] public proposals;

    // voter address => has voted
    mapping(address => bool) public hasVoted;

    // events (important for frontend & explorer)
    event ProposalAdded(uint256 indexed proposalId, string name);
    event VoteCast(address indexed voter, uint256 indexed proposalId);
    event VotingStatusChanged(bool votingOpen);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier whenVotingOpen() {
        require(votingOpen, "Voting is closed");
        _;
    }

    constructor(string[] memory proposalNames) {
        owner = msg.sender;
        votingOpen = true;

        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));

            emit ProposalAdded(i, proposalNames[i]);
        }
    }

    /// Vote for a proposal by its ID
    function vote(uint256 proposalId) external whenVotingOpen {
        require(!hasVoted[msg.sender], "Already voted");
        require(proposalId < proposals.length, "Invalid proposal");

        hasVoted[msg.sender] = true;
        proposals[proposalId].voteCount += 1;

        emit VoteCast(msg.sender, proposalId);
    }

    /// Close or reopen voting
    function setVotingStatus(bool _votingOpen) external onlyOwner {
        votingOpen = _votingOpen;
        emit VotingStatusChanged(_votingOpen);
    }

    /// Get number of proposals
    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    /// Get proposal details
    function getProposal(uint256 proposalId)
        external
        view
        returns (string memory name, uint256 voteCount)
    {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal memory p = proposals[proposalId];
        return (p.name, p.voteCount);
    }
}
