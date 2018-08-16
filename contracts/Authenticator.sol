pragma solidity ^0.4.23;
// solidity version
import "./ECRecovery.sol";
contract Authenticator{
    using ECRecovery for bytes32;
    // Stores Global Preferences that can be claimed to third parties 
    mapping(uint => string) global_Preferences;
    
    // Stores each user preferences 
    mapping(address=> mapping (uint => bool)) user_pref_map;
    
    // Current count of preference choices in our contract
    uint preflength;
    
    // Currently active Proposal to Vote
    uint curr_proposalID;
    
    mapping(uint=> Proposal) curr_proposals;
    function addNewGlobalPreferences()public{
        global_Preferences[preflength]=curr_proposals[curr_proposalID].new_pref;
        preflength++;
    }
    
    function enroll(bool[] _prefList) public returns(bool){
        for(uint _prefCount=0; _prefCount<preflength;_prefCount++){
            user_pref_map[msg.sender][_prefCount]=_prefList[_prefCount];
        }
        return true;
    }
    
    function getInformation() public returns(bool[]){
        bool[] _userPrefs;
        for(uint _prefCount=0; _prefCount<preflength;_prefCount++){
            _userPrefs.push(user_pref_map[msg.sender][_prefCount]);
            
        }
        return _userPrefs;
    }
    
    function getUserPreference(address _usrAddr, uint _prefOrder) public returns(bool){
        return user_pref_map[_usrAddr][_prefOrder];
    }
    
    struct Proposal{
        uint startBlock;
        uint period;
        string new_pref;
        uint upCount;
        uint downCount;
        mapping(address=>bool) isVoted;
    }
    
    function checkCurrentProposal() {
        if(curr_proposals[curr_proposalID].startBlock+curr_proposals[curr_proposalID].period<=block.number){
            if(curr_proposals[curr_proposalID].upCount>curr_proposals[curr_proposalID].downCount&& curr_proposals[curr_proposalID].upCount>1){
                addNewGlobalPreferences();
            }
            clearProposal();
        }
    }
    
    modifier notVoted(){
        require(curr_proposals[curr_proposalID].isVoted[msg.sender]==false);
        _;
    }
    
    modifier existingProposal(){
        require(bytes(curr_proposals[curr_proposalID].new_pref).length>0 && curr_proposals[curr_proposalID].startBlock+curr_proposals[curr_proposalID].period>block.number);
        _;
    }
    
    function proposeNewPreference(string _pref, uint _period)public returns(bool){
        checkCurrentProposal();
        if(curr_proposals[curr_proposalID].startBlock==0){
            curr_proposals[curr_proposalID].startBlock=block.number;
            curr_proposals[curr_proposalID].period=_period;
            curr_proposals[curr_proposalID].new_pref=_pref;
            curr_proposals[curr_proposalID].upCount=0;
            curr_proposals[curr_proposalID].downCount=0;
            return true;
        }
        else{
            return false;
        }

    }
    
    function clearProposal()private {
        curr_proposalID++;
    }
    
    function getCurrentProposal() public view returns(uint,uint,string,uint,uint,uint){
        return(curr_proposals[curr_proposalID].startBlock, curr_proposals[curr_proposalID].period, curr_proposals[curr_proposalID].new_pref,curr_proposals[curr_proposalID].upCount, curr_proposals[curr_proposalID].downCount,block.number);
    }
    
    function voteForProposal(bool _Vote) public notVoted existingProposal {
        if(_Vote){
            curr_proposals[curr_proposalID].upCount++;
        }
        else{
            curr_proposals[curr_proposalID].downCount++;
        }
        curr_proposals[curr_proposalID].isVoted[msg.sender] = true;
    }
    
    function getGlobalPreference(uint _prefOrder)public view returns(string){
        return global_Preferences[_prefOrder];
    }
    function getPrefLength() public view returns(uint){
        return preflength;
    }
    
    function getAddressFromSigned(bytes32 _hashOfMsg, bytes _signedMessage) public returns(address){
        address recoveredAddress = _hashOfMsg.recover(_signedMessage);
        return recoveredAddress;
    }
    
    function Authenticator(){
        global_Preferences[0] = "Use GeoLocation";
        global_Preferences[1] = "Push Notifications";
        global_Preferences[2] = "Allow cookies";
        preflength=3;
    }
    
}