//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0; //better to use a fixed version in production

import "./IsOwner.sol";

contract AflScoreTracker is IsOwner {
    
    struct Game {
        uint gameID;
        address gameOwner;
        string[2] teams;
        uint8[2] team1Score;
        uint8[2] team2Score;
        bool scoreFinalised;
    }
    
    enum teamChoices {home, away}
    
    Game[] public games;
    uint id;
    uint constant GOAL_POINTS = 6;
    uint constant BEHIND_POINTS = 1;
    
    //these are only viewable outside the contract
    event gameCreated(Game);
    event gameScoreUpdated(Game);
    event gameScoreFinalised(Game);
    
    modifier canEdit(Game memory _currentGame) {
        require(_currentGame.gameOwner == msg.sender || owner == msg.sender);
        _;
    }
    
    mapping(address=>uint) contributions;
    mapping(uint=>address) gameToOwner;
    mapping(address=>uint) ownerGameCount;
    
    function createGame(string calldata _teamA, string calldata _teamB) external returns(Game memory){
        Game memory currentGame;
        
        currentGame.gameID = id;
        currentGame.gameOwner = msg.sender;
        currentGame.teams[0] = _teamA;
        currentGame.teams[1] = _teamB;
        currentGame.team1Score = [0,0];
        currentGame.team2Score = [0,0];
        currentGame.scoreFinalised = false;
        
        games.push(currentGame);
        id++;
        gameToOwner[currentGame.gameID] = msg.sender;
        ownerGameCount[msg.sender]++;
        contributions[msg.sender]++;
        emit gameCreated(currentGame);
        
        return currentGame;
    }
    
    function getGameContext(uint _gameID) external view returns(string memory){
        Game memory currentGame = games[_gameID];
        string memory completionStatus;
        
        if(currentGame.scoreFinalised == true){
            completionStatus = "Final Score";
        }else {
            completionStatus = "Ongoing";
        }
        
        return string(bytes.concat(bytes(currentGame.teams[0]), bytes(" vs "), bytes(currentGame.teams[1]), bytes(": "), bytes(completionStatus)));
    }
    
    function getGameScore(uint _gameID) external view returns(uint[2] memory){
        Game storage currentGame = games[_gameID];
        uint team1TotalScore;
        uint team2TotalScore;
        
        team1TotalScore = currentGame.team1Score[0]*GOAL_POINTS + currentGame.team1Score[1]*BEHIND_POINTS;
        team2TotalScore = currentGame.team2Score[0]*GOAL_POINTS + currentGame.team2Score[1]*BEHIND_POINTS;
        
        return [team1TotalScore, team2TotalScore];
    }
    
    function getContributions(address _contributer) external view returns(uint){
       return contributions[_contributer];
    }
    
    function getGamesDeployed(address _gameDeployer) external view returns(uint){
        return ownerGameCount[_gameDeployer];
    }
    
    function incrementGoal(uint _gameID, teamChoices _team) external {
        Game storage currentGame = games[_gameID];
        require(!currentGame.scoreFinalised);
        
        if(_team == teamChoices.home){
            currentGame.team1Score[0]++;
        }else if(_team == teamChoices.away){
            currentGame.team2Score[0]++;
        }
        
        contributions[msg.sender]++;
        emit gameScoreUpdated(currentGame);
    }
    
    function incrementBehind(uint _gameID, teamChoices _team) external {
        Game storage currentGame = games[_gameID];
        require(!currentGame.scoreFinalised);
        
        if(_team == teamChoices.home){
            currentGame.team1Score[1]++;
        }else if(_team == teamChoices.away){
            currentGame.team2Score[1]++;
        }
        
        contributions[msg.sender]++;
        emit gameScoreUpdated(currentGame);
    }
    
    function setScore(uint _gameID, uint8 _team1Goals, uint8 _team1Behinds, uint8 _team2Goals, uint8 _team2Behings) public canEdit(games[_gameID]) {
        Game storage currentGame = games[_gameID];
        
        currentGame.team1Score = [_team1Goals, _team1Behinds];
        currentGame.team2Score = [_team2Goals, _team2Behings];
        
        contributions[msg.sender]++;
        emit gameScoreUpdated(currentGame);
    }
    
    function finaliseScore(uint _gameID) public canEdit(games[_gameID]) {
        Game storage currentGame = games[_gameID];
        
        currentGame.scoreFinalised = true;
        emit gameScoreFinalised(currentGame);
    }
}
