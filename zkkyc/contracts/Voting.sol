// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 < 0.9.0;

contract Voting {
    // create a structs for each candidates
    struct Candidate {
        uint id;
        uint numberOfVotes;
        string name;   
    }

    struct Voter {
        uint id;
        uint candidat;
        uint code;
        address voter;
    }

    

    // list odf all candidates
    Candidate[] public candidates;

    // List of voters
    Voter[] public voters;

    //This will be the owner's address
    address public owner;
    

    //Create a voting start and end session
    uint public votingStart;
    uint public votingEnd;

    // create an election status
    bool public electionStarted;

    event DebugEvent(string message);

    event Voted(address indexed voter, uint candidateId);
    event ElectionStarted(string[] candidates, uint votingStart, uint votingEnd);

    // Restrict creating election to the owner

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized to start an election");
        _;
    }

    //Check if an election is ongoing
    modifier electionOngoing() {
        require(electionStarted, "No election yet");
        _;
    }


    // create a contructor 
    constructor(){
        owner = msg.sender;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    // to start an election
    function startElection(string[] memory _candidates) public onlyOwner {
        require(checkElectionPeriod()==false, "Election is currently ongoing");
        require(isOdd(voters.length), "pair voter is not possible, please add voters");
        for(uint i = 0; i < _candidates.length; i++){
            // Adding candidates with IDs starting from 1
            candidates.push(
                Candidate({id: i + 1, name: _candidates[i], numberOfVotes: 0})
            );
        }
        electionStarted = true;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + 500;
        //votingEnd = block.timestamp + (8 hours);
        emit ElectionStarted(_candidates, votingStart, votingEnd);
    }

    // vote function
function voteTo(uint _id, uint _code) public electionOngoing {
        require(checkElectionPeriod(), "Election period has ended");
        require(checkVoterEligibility(_code), "You aren't eligible to vote");
        require(checkCandidat(_id), "The candidat not exist");
        
        for(uint i=0; i < candidates.length; i++) {
            if (candidates[i].id == _id) {
                candidates[i].numberOfVotes++;
            }
        }
        
        emit DebugEvent("Je suis apres candidats");
        for(uint i=0; i < voters.length; i++) {
            if(msg.sender == voters[i].voter){
                voters[i].candidat = _id;
            }
            
        }
        
        emit Voted(msg.sender, _id);
    }

    // to add a new candidate
    function addBulkVoter(address [] memory listAdressVoters, string [] memory codes) public onlyOwner {
        require(!electionStarted, "Election start");
        require(listAdressVoters.length == codes.length, "Election start");
        require(isOdd(listAdressVoters.length), "The number of voters must be odd");
        for(uint i=0; i < listAdressVoters.length; i++) {
            voters.push(
                Voter({
                    id: i+ 1,
                    candidat: 0,
                    code: uint(keccak256(abi.encodePacked(codes[i]))) % 10 ** 12,
                    voter: listAdressVoters[i]
                })
            );
        }
        
    }

    

    function addVoter(address voter, string memory code) public onlyOwner {
        require(!electionStarted, "Election start");
        require(!checkVoter(voter), "Voter exist");
        
            voters.push(
                Voter({
                    id: voters.length + 1,
                    candidat: 0,
                    code: uint(keccak256(abi.encodePacked(code))) % 10 ** 12,
                    voter: voter
                })
            );
    }

    function isOdd(uint _number) internal pure returns (bool) {
        return _number % 2 != 0;
    }

    function checkVoter(address voter) public view returns (bool){
        for (uint i = 0; i < voters.length; i++) {
            if (voters[i].voter == voter) {
                return true;   
            }
        }
        return false;
    }


    
    function checkIfVoted(address _addr) public electionOngoing view returns (bool){
        // Check if the sender has already voted
        bool voterVoted = false;
        for(uint i=0; i < voters.length; i++) {
            if(_addr == voters[i].voter && voters[i].candidat != 0){
                voterVoted = true;
            }
        }

        return voterVoted;
    }
    
    function checkCandidat(uint _id) public view returns (bool){
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].id == _id) {
                return true;   
            }
        }
        return false;
    }
    function checkVoterEligibility(uint _code) public view returns (bool) {
        for (uint i = 0; i < voters.length; i++) {
            if (voters[i].code == _code && voters[i].candidat == 0 && msg.sender == voters[i].voter) {
                    return true;   
            }
        }
        return false; 
    }

    // general check voters status 
function generalVoterStatus() public view electionOngoing returns (uint) {
        uint totalVoters = 0;
        for (uint i = 0; i < voters.length; i++) {
            if (voters[i].candidat > 0) {
                totalVoters++; 
            }
        }
        uint totalPossibleVoters = voters.length;
        uint percentage = 0;
        if(totalPossibleVoters > 0) {
            percentage = (totalVoters * 100) / totalPossibleVoters;
        }
        return percentage;
    }

    

    // get the number of votes
    function retrieveVotes() public view returns (Candidate[] memory) {
        require(block.timestamp >= votingEnd, "Election period has not ended");
        return candidates;
    }

    // get the number of votes
    function retrieveInfoVote(address _voter) public view returns (Voter memory) {
        require(block.timestamp >= votingEnd, "Election period has not ended");
        Voter memory voterData;
       for (uint i = 0; i < voters.length; i++) {
            if(voters[i].voter == _voter){
                voterData = voters[i];
            }
        }
        return voterData;
    }

    function listCandidates() public view returns (string[] memory, uint[] memory) {
        string[] memory names = new string[](candidates.length);
        uint[] memory ids = new uint[](candidates.length);

        for (uint i = 0; i < candidates.length; i++) {
            names[i] = candidates[i].name;
            ids[i] = candidates[i].id;
        }

        return (names, ids);
    }

    // List voters
    function getAllVoters() public view returns ( uint[] memory, uint[] memory, string[] memory) {
        uint[] memory ids = new uint[](voters.length);
        uint[] memory candidats = new uint[](voters.length);
        string[] memory addresses = new string[](voters.length);

        for (uint i = 0; i < voters.length; i++) {
            string memory voterAddress = addressToString(voters[i].voter);

            ids[i] = voters[i].id; 
            candidats[i] = voters[i].candidat;
            addresses[i] = string(abi.encodePacked(substring(voterAddress, 0, 8), "xxxxxxxx"));
        }

        return (ids, candidats, addresses);
    }

    function addressToString(address _addr) internal pure returns(string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function substring(string memory str, uint startIndex, uint length) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(startIndex + length <= strBytes.length, "Invalid substring length");
        
        bytes memory result = new bytes(length);
        for (uint i = 0; i < length; i++) {
            result[i] = strBytes[startIndex + i];
        }
        return string(result);
    }

    // get the number of votes
    function winnerRetrieve() public view returns (Candidate memory) {
        require(block.timestamp >= votingEnd, "Election period has not ended");
        uint maxVotes = 0;
        Candidate memory winner;

        for(uint i = 0; i < candidates.length; i++) {
            if(candidates[i].numberOfVotes > maxVotes) {
                maxVotes = candidates[i].numberOfVotes;
                winner = candidates[i];
            }
        }

        return winner;
    }

    //monitor the election time
    function electionTimer() public view returns (uint) {
        if (block.timestamp >= votingEnd) {
            return 0; 
        } else {
            return votingEnd - block.timestamp; 
        }
    }

    // check if election period is still ongoing
    function checkElectionPeriod() internal returns (bool) {
        if (electionTimer() == 0) {
            electionStarted = false;
            return false; 
        } else {
            return true; 
        }
    }

    function codeForVoters(address _addr) public view returns (uint) {
        bool isVoter = false;
        uint voterCode;

        for(uint i = 0; i < voters.length; i++) {
            if (voters[i].voter == _addr) {
                isVoter = true;
                voterCode = voters[i].code;
                break;
            }
        }

        require(isVoter, "You are not voter");

        return voterCode;
    }


    function restartAllData() public {
        delete candidates;
        delete voters;
    }


}