//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0; //better to use a fixed version in production

contract AflScoreTracker {
    
    struct Game {
        uint gameID;
        address gameOwner;
        string[2] teams;
        uint8[2] team1Score;
        uint8[2] team2Score;
    }
    
    address owner;
    Game[] public games;
    uint id;
    
    event gameCreated(Game);
    event gameScoreUpdated(Game);
    
    modifier canEdit(Game memory _currentGame) {
        require(_currentGame.gameOwner == msg.sender || owner == msg.sender);
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    mapping(address=>uint) contributions;
    mapping(uint=>address) gameToOwner;
    mapping(address=>uint) ownerGameCount;
    
    function createGame(string memory _teamA, string memory _teamB) external returns(Game memory){
        Game memory currentGame;
        
        currentGame.gameID = id;
        currentGame.gameOwner = msg.sender;
        currentGame.teams[0] = _teamA;
        currentGame.teams[1] = _teamB;
        currentGame.team1Score = [0,0];
        currentGame.team2Score = [0,0];
        
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
        string memory gameContext = concatContextStr(currentGame.teams[0], currentGame.teams[1]);
        return gameContext;
    }
    
    function getGameScore(uint _gameID) external view returns(uint[2] memory){
        Game storage currentGame = games[_gameID];
        uint team1TotalScore;
        uint team2TotalScore;
        
        team1TotalScore = currentGame.team1Score[0]*6 + currentGame.team1Score[1];
        team2TotalScore = currentGame.team2Score[0]*6 + currentGame.team2Score[1];
        
        return [team1TotalScore, team2TotalScore];
    }
    
    function getContributions(address _contributer) external view returns(uint){
       return contributions[_contributer];
    }
    
    function getGamesDeployed(address _gameDeployer) external view returns(uint){
        return ownerGameCount[_gameDeployer];
    }
    
    function incrementGoal(uint _gameID, uint8 _teamID) external {
        Game storage currentGame = games[_gameID];
        
        if(_teamID == 0){
            currentGame.team1Score[0]++;
        }else if(_teamID == 1){
            currentGame.team2Score[0]++;
        }
        
        contributions[msg.sender]++;
        emit gameScoreUpdated(currentGame);
    }
    
    function incrementBehind(uint _gameID, uint8 _teamID) external {
        Game storage currentGame = games[_gameID];
        
        if(_teamID == 0){
            currentGame.team1Score[1]++;
        }else if(_teamID == 1){
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
    
    function concatContextStr(string memory _team1, string memory _team2) private pure returns(string memory) {
        return string(abi.encodePacked(_team1, " vs ", _team2));
    }
}

