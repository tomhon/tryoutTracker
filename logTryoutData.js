var config = require("./config");

var Connection = require('tedious').Connection; 
var Request = require('tedious').Request  
var TYPES = require('tedious').TYPES;  

module.exports = function logTryoutData (userDataToLog, coachName) {

    //initialize SQL connection
    
    var toLogPlayerDataArray = userDataToLog.playerDataArray;

    toLogPlayerDataArray.forEach(function(item) {
        var connection = new Connection(config);  

        connection.on('connect', function(err) {  
            if (err) {
                console.log(err); 
            } else {
                //if successful execute insert
                console.log("Connected to SQL"); 
                executeSQLInsert(
                    createSQLRequest(coachName, item, 
                        userDataToLog.tryoutDate, userDataToLog.tryoutAgeGroup, userDataToLog.tryoutGender)
                        );  
            }
        }); 
        function executeSQLInsert(sqlString) {
            console.log(sqlString);
            request = new Request(sqlString, function(err) {  
                    if (err) {  
                    console.log(err);
                    console.log(sqlString);
                    }  
                });  
            connection.execSql(request);  
        }
    })
};  

function createSQLRequest(coach, toLogPlayer, tryoutDate, tryoutAgeGroup, tryoutGender) {
    var sqlRequestString = "INSERT INTO dbo.tryoutTrackingTable (";
            sqlRequestString += "username,";
            sqlRequestString += "playerDataTimeStamp,";
            sqlRequestString += "playerNumber,";
            sqlRequestString += "playerName,";
            sqlRequestString += "technicalSkills,";
            sqlRequestString += "gameSkills,";
            sqlRequestString += "athleticism,";
            sqlRequestString += "intangibles,";
            sqlRequestString += "comments,";
            sqlRequestString += "tryoutDate,";
            sqlRequestString += "tryoutGender,";
            sqlRequestString += "tryoutAgeGroup ";
            
        sqlRequestString += ") VALUES ("
            sqlRequestString += "'" + coach  + "',";
            sqlRequestString += "'" + toLogPlayer.timestamp  + "',";
            sqlRequestString += "" + toLogPlayer.playerNumber  + ",";
            sqlRequestString += "'" + toLogPlayer.playerName  + "',";
            sqlRequestString += "" + toLogPlayer.technicalSkills  + ",";
            sqlRequestString += "" + toLogPlayer.gameSkills  + ",";
            sqlRequestString += "" + toLogPlayer.athleticism  + ",";
            sqlRequestString += "" + toLogPlayer.intangibles  + ",";
            sqlRequestString += "'" + toLogPlayer.comments  + "',";
            sqlRequestString += "'" + tryoutDate  + "',";
            sqlRequestString += "'" + tryoutAgeGroup  + "',";
            sqlRequestString += "'" + tryoutGender  + "')";
    return sqlRequestString;
}