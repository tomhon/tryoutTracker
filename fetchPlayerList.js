var config = require("./config");
var Connection = require('tedious').Connection; 
var Request = require('tedious').Request  
var TYPES = require('tedious').TYPES;  



function playerData() {
    this.timestamp = '';
    this.playerNumber = 0;
    this.playerName = '';
    this.technicalSkills = 0;
    this.gameSkills = 0;
    this.athleticism= 0;
    this.intangibles= 0;
    this.comments= '';
}



// var currentPlayerData = new playerData;

    //     currentPlayerData.playerNumber = 14;
    //     currentPlayerData.playerName = 'Poppy Honeybone';
    //     currentPlayerData.technicalSkills = 4.5;
    //     currentPlayerData.gameSkills = 3.5;
    //     currentPlayerData.athleticism = 4.0;
    //     currentPlayerData.intangibles = 3.0;
    //     currentPlayerData.comments = 'Terrific ball control, excellent set pieces, needs work on communicating with team mates';
    // fetchedPlayerDataArray.push(currentPlayerData);

module.exports = function fetchPlayerList (session, addNewPlayerToPlayerDataArray) {
    console.log('Connecting to SQL');
    session.userData.playerDisplayArray = [];
    session.userData.playerDataArray = [];
    //initialize SQL connection
    var connection = new Connection(config);  
    //when connection comes up 
    connection.on('connect', function(err) {  
        if (err) {
            console.log(err); 
        } else {
            //if successful execute insert
            console.log("Connected to SQL"); 
            sqlRequestString = createSQLRequest(session.userData.tryoutDate, session.userData.tryoutAgeGroup, session.userData.tryoutGender);
            console.log(sqlRequestString);
            executeSQLRequest(sqlRequestString);
        }

    }); 
    function executeSQLRequest(sqlString) {
        console.log('Executing SQL Request');
        var retrievedData = [];
        request = new Request(sqlString, function(err) {  
                if (err) {  
                console.log('SQL request error' + err);
                console.log(sqlString);
                }  
            });  

    //unpack data from SQL query and put it in an array of objects
        request.on('row', function(columns) { 
            var retrievedData = new playerData;
            columns.forEach(function(column) { 
                if (column.value === null){
                    playerData.playerNumber = "unknown";
                } else {
                switch(column.metadata.colName) {
                    case 'playerNumber':
                        {retrievedData.playerNumber = column.value;
                        break;}
                    case 'playerName':
                        {retrievedData.playerName = column.value;
                        break;}
                    }
                }
            }); 


 
            // session.userData.playerDataArray.push(retrievedData);
            addNewPlayerToPlayerDataArray(retrievedData);
            console.log(session.userData.playerDataArray);
        });     

        request.on('requestCompleted', function () { 
            console.log('returning fetchedPlayerList');
            
            return;
        });
        connection.execSql(request);  
    }
};  

function createSQLRequest(date, ageGroup, gender) {
    sqlRequestString = "Select playerNumber, playerName from topFCPlayerList where ";
    sqlRequestString += "tryoutDate='" + date;
    sqlRequestString += "'AND playerAgeGroup='" + ageGroup;
    sqlRequestString += "'AND playerGender='" + gender + "'";
    console.log(sqlRequestString);
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
