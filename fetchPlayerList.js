var config = require("./config");
var Connection = require('tedious').Connection; 
var Request = require('tedious').Request  
var TYPES = require('tedious').TYPES;  

function PlayerData() {
    this.timestamp = '';
    this.playerNumber = 0;
    this.playerName = 'New Player';
    this.technicalSkills = 0;
    this.gameSkills = 0;
    this.athleticism= 0;
    this.intangibles= 0;
    this.comments= '';
}

module.exports = function fetchPlayerList(session) {
    console.log('Connecting to SQL');
    function localPlayerDataArray(player) {
        session.userData.playerDataArray.push(player)
    };
    session.userData.playerDisplayArray = [];
    session.userData.playerDataArray = [];
    localPlayerDataArray(new PlayerData());
 
    //initialize SQL connection
    var connection = new Connection(config);  //global context
    //when connection comes up 
    connection.on('connect', function(err) {
        // test code - delete
        if (err) {
            console.log(err); 
        } else {
            //if successful execute insert
            console.log("SQL connection successful"); 
            sqlRequestString = createSQLRequest(session.userData.tryoutDate, session.userData.tryoutAgeGroup, session.userData.tryoutGender);
            console.log(sqlRequestString); //connection context
            executeSQLRequest(sqlRequestString);
            connection.execSql(request); 
        }

    }); 
    function executeSQLRequest(sqlString) {
        console.log('Executing SQL Request');
        request = new Request(sqlString, function(err) {
 
                if (err) {  
                console.log('SQL request error' + err);
                console.log(sqlString);
                    }  
                });  
    //unpack data from SQL query and put it in an array of objects
        request.on('row', function(columns) { 
            console.log('From request.on row>>> session.userData.tryoutDate = ' + session.userData.tryoutDate )
            var retrievedPlayer = new PlayerData;
            columns.forEach(function(column) { 
                if (column.value === null){
                    playerData.playerNumber = "unknown";
                } else {
                switch(column.metadata.colName) {
                    case 'playerNumber':
                        {retrievedPlayer.playerNumber = column.value;
                        break;}
                    case 'playerName':
                        {retrievedPlayer.playerName = column.value;
                        break;}
                    }
                }
            }); 
            localPlayerDataArray(retrievedPlayer);
            console.log("Callback added new player " + retrievedPlayer.playerNumber);
        });     
        request.on('requestCompleted', function () { 
            console.log('returning fetchedPlayerList'); //request context
            return;
        });
    }
};  

function createSQLRequest(date, ageGroup, gender) {
    sqlRequestString = "Select playerNumber, playerName from topFCPlayerList where ";
    sqlRequestString += "tryoutDate='" + date;
    sqlRequestString += "'AND playerAgeGroup='" + ageGroup;
    sqlRequestString += "'AND playerGender='" + gender + "'";
    return sqlRequestString;
}
// CREATE TABLE [dbo].[topFCPlayerList]
// (
// 	[Id] INT NOT NULL PRIMARY KEY,
// 	[playerNumber] INT NOT NULL,
// 	[playerName] nvarchar (30),
// 	[tryoutDate] nvarchar (10),
// 	[playerAgeGroup] nvarchar (10),
// 	[playerGender] nvarchar (10)
// )
