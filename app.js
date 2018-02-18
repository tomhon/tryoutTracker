var builder = require('botbuilder');
var azure = require('botbuilder-azure');
var restify = require('restify');
var config = require("./config");
var Connection = require('tedious').Connection; 
var Request = require('tedious').Request  
var TYPES = require('tedious').TYPES; 

// var Connection = require('tedious').Connection; 
// var Request = require('tedious').Request  
// var TYPES = require('tedious').TYPES;  


var sqlConfig = require('./config');
// var trackingAdaptiveCard = require('./adaptiveCard');

// var fetchPlayerList = require("./fetchPlayerList");

var sqlClient = new azure.AzureSqlClient(sqlConfig);
var sqlStorage = new azure.AzureBotStorage({ gzipData: false }, sqlClient);

// Table storage
var tableConfig = require('./tableConfig');
var tableName = tableConfig.tableName; // You define
var storageName = tableConfig.storageName; // Obtain from Azure Portal
var storageKey = tableConfig.storageKey; // Obtain from Azure Portal
var azureTableClient = new azure.AzureTableClient(tableName, storageName, storageKey);
var tableStorage = new azure.AzureBotStorage({gzipData: false}, azureTableClient);

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});





function PlayerData() {
    var date = new Date();
    this.timestamp = date.toISOString();
    this.playerNumber = 0;
    this.playerName = 'Unknown';
    this.technicalSkills = 0;
    this.gameSkills = 0;
    this.athleticism= 0;
    this.intangibles= 0;
    this.comments= '';
    this.display = true;
}

var currentPlayerData = new PlayerData;

currentPlayerData.playerNumber = 7;
currentPlayerData.playerName = 'Tom Honeybone';
currentPlayerData.technicalSkills = 4.5;
currentPlayerData.gameSkills = 3.5;
currentPlayerData.athleticism = 4.0;
currentPlayerData.intangibles = 3.0;
currentPlayerData.comments = 'Terrific ball control, excellent set pieces, needs work on communicating with team mates';

var date;

var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, function (session) {
;
    if (session.userData.playerDataArray == undefined) {
        console.log('WARNING: playerDataArray cleared'); 
        session.userData.playerDataArray = Array()};
    if (session.userData.playerDisplayArray == undefined) { session.userData.playerDisplayArray = Array()};
    // session.userData.playerDataArray.push(currentPlayerData);
    // console.log('PlayerDataArray = ' + session.userData.playerDataArray); //context Array[1]
    // session.userData.playerDisplayArray.push(0);
    session.beginDialog('mainNavigationCarousel').endDialog();

}).set('storage', tableStorage);
// }).set('storage', sqlStorage); //doesn't work!!!
// }).set('storage', inMemoryStorage);



//dialog to display player and game details
bot.dialog('mainNavigationCarousel', function (session) {


    // session.userData.playerDataArray = localPlayerDataArray;
    // console.log(session.userData.playerDataArray);
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    setupHeroCard = new builder.HeroCard(session)
    .title('Select Players to Track')
    .subtitle("Select Date, Age Group & Gender to load Player Data. Then select individual players to track.")
    .buttons([
        builder.CardAction.imBack(session, "selectPlayer", "Select Player#" ),
        builder.CardAction.imBack(session, "selectDate", "Tryout Date: " + session.userData.tryoutDate ),
        builder.CardAction.imBack(session, "selectAgeGroup", "Age Group: " + session.userData.tryoutAgeGroup ),
        builder.CardAction.imBack(session, "selectGender", "Gender: " + session.userData.tryoutGender),
        builder.CardAction.imBack(session, "storeData", "Tryout Complete - Save Results" )
    ]);

    function createPlayerHeroCard(session, playerIndex) {
        // console.log('createPlayerHeroCard called with' + playerNumber)
        playerHeroCard = new builder.HeroCard(session)
        .title('Player #' + session.userData.playerDataArray[playerIndex].playerNumber + " " + session.userData.playerDataArray[playerIndex].playerName )
        .subtitle(session.userData.playerDataArray[playerIndex].comments)
        .buttons([
            builder.CardAction.imBack(session, "updateTechnicalSkills"+session.userData.playerDataArray[playerIndex].playerNumber, "Technical Skills: " + session.userData.playerDataArray[playerIndex].technicalSkills ),
            builder.CardAction.imBack(session, "updateGameSkills"+session.userData.playerDataArray[playerIndex].playerNumber, "Game Skills: " + session.userData.playerDataArray[playerIndex].gameSkills),
            builder.CardAction.imBack(session, "updateAthleticism"+session.userData.playerDataArray[playerIndex].playerNumber, "Athleticism: " + session.userData.playerDataArray[playerIndex].athleticism ),
            builder.CardAction.imBack(session, "updateIntangibles"+session.userData.playerDataArray[playerIndex].playerNumber, "Intangibles: " + session.userData.playerDataArray[playerIndex].intangibles ),
            builder.CardAction.imBack(session, "updateComments"+session.userData.playerDataArray[playerIndex].playerNumber, "Add Comments" ),
            builder.CardAction.imBack(session, "closePlayer"+session.userData.playerDataArray[playerIndex].playerNumber, "Close this Player" ),
        ])
        return playerHeroCard;
    }
    msg.addAttachment(setupHeroCard); //context Array(1)
    //add a new heroCard for each player set to display - display in reverse order
    // session.userData.playerDataArray.forEach(function(element, index) {
    //     if (session.userData.playerDataArray[index].display) {
    //         msg.addAttachment(createPlayerHeroCard(session,index));
    //     }
    if (!(session.userData.playerDisplayArray == undefined)) {
    session.userData.playerDisplayArray.forEach(function(element, index) {
            msg.addAttachment(createPlayerHeroCard(session,element));
        });
    }
    session.send(msg);
    session.endDialog();
});

var logTryoutData = require("./logTryoutData");

// Dialog to select date 
bot.dialog('storeData', [
    function (session) {
        builder.Prompts.confirm(session, "Are you sure you want to save your tryout tracking data?");
    },
    function (session, results) {
        if (results.response) {
            session.userData.tryoutComplete = true;
            session.save();
            logTryoutData(session.userData, session.message.user.name);
        } else {

        }
        // session.userData.tryoutComplete = false;
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /storeData/i });

// Dialog to select date 
bot.dialog('selectDate', [
    function (session) {
        builder.Prompts.confirm(session, "This deletes all the data you've entered. Are you sure you want to proceed?");
    },
    function (session, results, next) {
        if (results.response) {
            builder.Prompts.time(session, "Please select Tryout date");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response != undefined) {
        session.userData.tryoutDate = builder.EntityRecognizer.resolveTime([results.response]).toISOString().slice(0,10);
        if (session.userData.tryoutDate && session.userData.tryoutAgeGroup && session.userData.tryoutGender) {
            loadPlayerDataArray(session);
            // console.log(session.userData.playerDataArray);
            }
        }
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectDate/i });

// Dialog to select Age Group 
bot.dialog('selectAgeGroup', [
    function (session) {
        builder.Prompts.confirm(session, "This deletes all the data you've entered. Are you sure you want to proceed?");
    },
    function (session, results, next) {
        if (results.response) {
            builder.Prompts.choice(session, "Please select age group", "U10|U11|U12|U13|U14|U15|U16|U17|U18|U19", {listStyle:3});
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response != undefined) {
        session.userData.tryoutAgeGroup = results.response.entity;
        if (session.userData.tryoutDate && session.userData.tryoutAgeGroup && session.userData.tryoutGender) {
            loadPlayerDataArray(session);
            // console.log(session.userData.playerDataArray);
            }
        }
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectAgeGroup/i });

// Dialog to select Age Group 
bot.dialog('selectGender', [
    function (session) {
        builder.Prompts.confirm(session, "This deletes all the data you've entered. Are you sure you want to proceed?");
    },
    function (session, results, next) {
        if (results.response) {
            builder.Prompts.choice(session, "Please select gender", "Boys|Girls", {listStyle:3});
        } else {
            next()
        }
    },
    function (session, results, next) {
        if (results.response != undefined) {
        session.userData.tryoutGender = results.response.entity;
        session.userData.dialogContext = this;
        if (session.userData.tryoutDate && session.userData.tryoutAgeGroup && session.userData.tryoutGender) {
            loadPlayerDataArray(session);
            // console.log(session.userData.playerDataArray);
            }
        }
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectGender/i });

// Dialog to get data 
bot.dialog('fetchData', [
    function (session) {
        var dummySession = Array ();
        dummySession.userData = {
            playerDataArray: [],
            tryoutDate: '02/09/2018',
            tryoutGender: 'Boys',
            tryoutAgeGroup: 'U14'
        };
        fetchPlayerList(session);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /fetchData/i });

// Dialog to display data 
bot.dialog('displayData', [
    function (session) {
        session.send('displayData');
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /displayData/i });

// Dialog to select player 
bot.dialog('selectPlayer', [
    function (session) {
        builder.Prompts.number(session, "Please select player number to track");
    },
    function (session, results) {
        // check to see if number already has a playerData object, if not create new one //
        // console.log('Player number to track '+ results.response);
        indexToDisplay = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==results.response});
        // console.log('Index to Display= ' + indexToDisplay);
        if (indexToDisplay == -1) 
            {   var newPlayerData = new PlayerData;
                newPlayerData.playerNumber = results.response;
                date = new Date();
                newPlayerData.timestamp = date.toISOString();
                session.userData.playerDataArray.push(newPlayerData);
                //find index of last element of playerDataArray
                indexToDisplay = session.userData.playerDataArray.unshift() - 1;
                // console.log('new playerTracking object added');
            };
        session.userData.playerDisplayArray.splice(0,0,indexToDisplay);
        session.save();
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectPlayer/i });

// Dialog to close player 
bot.dialog('closePlayer', [
    function (session) {
        // console.log('closePlayer called');
        //strips 'closePlayer' from the message that called the dialog
        playerNumberToClose = session.message.text.slice(11);
        playerDataIndexToClose = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToClose);
        });
        playerDisplayIndexToClose = session.userData.playerDisplayArray.findIndex(function(currentValue, index) {
            return session.userData.playerDisplayArray[index]==playerDataIndexToClose;
        });
        session.userData.playerDisplayArray.splice(playerDisplayIndexToClose,1);
        console.log('Closing Display Index' + playerDisplayIndexToClose);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /closePlayer/i });

// Dialog to update Game Skills Score 
bot.dialog('updateTechnicalSkills', [
    function (session) {
        // console.log('updateTechnicalSkills called');
        //strips updateTechnicalSkills' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(21);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        // console.log('Update Index' + indexToUpdate);
        builder.Prompts.number(session, "Please enter new Game Skills score (1-5)");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].technicalSkills = results.response;
        var date = new Date();
        session.userData.playerDataArray[indexToUpdate].timestamp = date.toISOString();
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        // console.log("Player " + playerNumberToUpdate + " Technical Skills set to " + session.userData.playerDataArray[indexToUpdate].technicalSkills);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateTechnicalSkills/i });

function movePlayerToFrontOfDisplay (session, playerDataArrayIndex) {
    playerDisplayIndexToMoveToFront = session.userData.playerDisplayArray.findIndex(function(currentValue, index) {
        return session.userData.playerDisplayArray[index]==playerDataArrayIndex;
    });
    session.userData.playerDisplayArray.splice(playerDisplayIndexToMoveToFront,1);
    session.userData.playerDisplayArray.splice(0,0,playerDataArrayIndex);
}


// Dialog to update Game Skills Score 
bot.dialog('updateGameSkills', [
    function (session) {
        // console.log('updateGameSkills called');
        //strips updateGameSkills' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(16);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        // console.log('Update Index' + indexToUpdate);
        builder.Prompts.number(session, "Please enter new Game Skills score (1-5)");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].gameSkills = results.response;
        var date = new Date();
        session.userData.playerDataArray[indexToUpdate].timestamp = date.toISOString();
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        // console.log("Player " + playerNumberToUpdate + " Game Skills set to " + session.userData.playerDataArray[indexToUpdate].gameSkills);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateGameSkills/i });

// Dialog to update athleticism Score 
bot.dialog('updateAthleticism', [
    function (session) {
        // console.log('updateathleticism called');
        //strips updateGameSkills' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(17);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        // console.log('Update Index' + indexToUpdate);
        builder.Prompts.number(session, "Please enter new Game Skills score (1-5)");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].athleticism = results.response;
        var date = new Date();
        session.userData.playerDataArray[indexToUpdate].timestamp = date.toISOString();
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        // console.log("Player " + playerNumberToUpdate + " Game Skills set to " + session.userData.playerDataArray[indexToUpdate].athleticism);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateAthleticism/i });

// Dialog to update athleticism Score 
bot.dialog('updateIntangibles', [
    function (session) {
        // console.log('updateIntangibles called');
        //strips updateGameSkills' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(17);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        // console.log('Update Index' + indexToUpdate);
        builder.Prompts.number(session, "Please enter new Game Skills score (1-5)");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].intangibles = results.response;
        var date = new Date();
        session.userData.playerDataArray[indexToUpdate].timestamp = date.toISOString();
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        // console.log("Player " + playerNumberToUpdate + " Game Skills set to " + session.userData.playerDataArray[indexToUpdate].intangibles);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateIntangibles/i });

// Dialog to update athleticism Score 
bot.dialog('updateComments', [
    function (session) {
        // console.log('updateComments called');
        //strips updateComments' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(14);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        // console.log('Update Index' + indexToUpdate);
        builder.Prompts.text(session, "Please enter add additional comments");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].comments += (results.response + ", ");
        var date = new Date();
        session.userData.playerDataArray[indexToUpdate].timestamp = date.toISOString();
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        // console.log("Player " + playerNumberToUpdate + " Comments set to " + session.userData.playerDataArray[indexToUpdate].comments);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateComments/i });

//spin up the web server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {

   console.log('%s listening to %s', server.name, server.url); 

});

server.post('/api/messages', connector.listen());

// web interface
server.get('/', restify.serveStatic({
    directory: __dirname,
    default: '/index.html',
   }));

//load player data from SQL 
function loadPlayerDataArray (session) {
    session.userData.playerDataArray = [];
    session.userData.playerDisplayArray = [];
    localPlayerDataArray.forEach(function(item){
        if (session.userData.tryoutDate == item.tryoutDate 
            && session.userData.tryoutAgeGroup == item.playerAgeGroup 
            && session.userData.tryoutGender == item.playerGender) 
            {
                session.userData.playerDataArray.push(item);
            }
    })
}

var localPlayerDataArray = Array ();

var connection = new Connection(config);  //global context

//when connection comes up 
connection.on('connect', function(err) {
    // test code - delete
    if (err) {
        console.log(err); 
    } else {
        //if successful execute insert
        console.log("SQL connection successful"); 
        // sqlRequestString = createSQLRequest(session.userData.tryoutDate, session.userData.tryoutAgeGroup, session.userData.tryoutGender);
        sqlRequestString="Select * from topFCPlayerList"
        console.log(sqlRequestString); //connection context
        executeSQLRequest(sqlRequestString);
        connection.execSql(request); 
    }

}); 

function executeSQLRequest(sqlString) {
    // console.log('Executing SQL Request');
    request = new Request(
        sqlString, 
        function(err) {
            if (err) {  
            console.log('SQL request error' + err);
            console.log(sqlString);
                } 
            return; 
            });  
            
    //unpack data from SQL query and put it in an array of objects
    request.on('row', function(columns) { 
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
                case 'tryoutDate':
                    {retrievedPlayer.tryoutDate = column.value;
                    break;}
                case 'playerAgeGroup':
                    {retrievedPlayer.playerAgeGroup = column.value;
                    break;}
                case 'playerGender':
                    {retrievedPlayer.playerGender = column.value;
                    break;}
                }
            }
        }); 
        localPlayerDataArray.push(retrievedPlayer);
        console.log("Callback added new player " + retrievedPlayer.playerNumber);
        return;
    }); 

    request.on('requestCompleted', function () { 
        // console.log('returning fetchedPlayerList'); //request context
        // console.log(localPlayerDataArray);
        return;
    });
};