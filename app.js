var builder = require('botbuilder');
var azure = require('botbuilder-azure');
var restify = require('restify');

// var Connection = require('tedious').Connection; 
// var Request = require('tedious').Request  
// var TYPES = require('tedious').TYPES;  


var sqlConfig = require('./config');
// var trackingAdaptiveCard = require('./adaptiveCard');
var fetchPlayerList = require("./fetchPlayerList");

var sqlClient = new azure.AzureSqlClient(sqlConfig);
var sqlStorage = new azure.AzureBotStorage({ gzipData: false }, sqlClient);
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

function PlayerData() {
    this.timestamp = '';
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

var bot = new builder.UniversalBot(connector, function (session) {
    session.userData.playerDataArray = Array();
    session.userData.playerDataArray.push(currentPlayerData);
    console.log(session.userData.playerDataArray);
    session.userData.playerDisplayArray = Array();
    session.userData.playerDisplayArray.push(0);
    session.beginDialog('mainNavigationCarousel').endDialog();

});
// }).set('storage', sqlStorage);




//dialog to display player and game details
bot.dialog('mainNavigationCarousel', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    setupHeroCard = new builder.HeroCard(session)
    .title('Select Players to Track')
    .subtitle("Select Date, Age Group & Gender to load Player Data. Then select individual players to track.")
    .buttons([
        builder.CardAction.imBack(session, "selectPlayer", "Select Player#" ),
        builder.CardAction.imBack(session, "selectDate", "Tryout Date: " + session.userData.tryoutDate ),
        builder.CardAction.imBack(session, "selectAgeGroup", "Age Group: " + session.userData.tryoutAgeGroup ),
        builder.CardAction.imBack(session, "selectGender", "Gender: " + session.userData.tryoutGender ),
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
    msg.addAttachment(setupHeroCard);
    //add a new heroCard for each player set to display - display in reverse order
    // session.userData.playerDataArray.forEach(function(element, index) {
    //     if (session.userData.playerDataArray[index].display) {
    //         msg.addAttachment(createPlayerHeroCard(session,index));
    //     }
    session.userData.playerDisplayArray.forEach(function(element, index) {
            msg.addAttachment(createPlayerHeroCard(session,element));
        });
    session.send(msg);
    session.endDialog(); //should never get called
});

// Dialog to select date 
bot.dialog('selectDate', [
    function (session) {
        builder.Prompts.time(session, "Please select Tryout date");
    },
    function (session, results) {
        session.userData.tryoutDate = builder.EntityRecognizer.resolveTime([results.response]).toISOString().slice(0,10);
        if (session.userData.tryoutDate && session.userData.tryoutAgeGroup && session.userData.tryoutGender) {
            session.userData.playerDataArray = fetchPlayerList(session.userData.tryoutDate,
                session.userData.tryoutAgeGroup,session.userData.tryoutGender);
            session.userData.playerDisplayArray = [];
         }
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectDate/i });

// Dialog to select Age Group 
bot.dialog('selectAgeGroup', [
    function (session) {
        builder.Prompts.choice(session, "Please select age group", "U10|U11|U12|U13|U14|U15|U16|U17|U18|U19", {listStyle:3});
    },
    function (session, results) {
        session.userData.tryoutAgeGroup = results.response.entity;
        if (session.userData.tryoutDate && session.userData.tryoutAgeGroup && session.userData.tryoutGender) {
            session.userData.playerDataArray = fetchPlayerList(session.userData.tryoutDate,
                session.userData.tryoutAgeGroup,session.userData.tryoutGender);
            session.userData.playerDisplayArray = [];
          }
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectAgeGroup/i });

// Dialog to select Age Group 
bot.dialog('selectGender', [
    function (session) {

        builder.Prompts.choice(session, "Please select gender", "Boys|Girls", {listStyle:3});
    },
    function (session, results) {
        function addToPlayerDataArray(newPlayerData){
            console.log("addToPlayerDataArray callback called" + newPlayerData);
            // globalPlayerDataArray.push(newPlayerData);
            session.userData.playerDataArray.push(newPlayerData);
        };

        session.userData.tryoutGender = results.response.entity;
        if (session.userData.tryoutDate && session.userData.tryoutAgeGroup && session.userData.tryoutGender) {
            fetchPlayerList(session, addToPlayerDataArray);
        }
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectGender/i });


// Dialog to select player 
bot.dialog('selectPlayer', [
    function (session) {
        builder.Prompts.number(session, "Please select player number to track");
    },
    function (session, results) {
        // check to see if number already has a playerData object, if not create new one //
        console.log('Player number to track '+ results.response);
        indexToDisplay = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==results.response});
        console.log('Index to Display= ' + indexToDisplay);
        if (indexToDisplay == -1) 
            {   var newPlayerData = new playerData;
                newPlayerData.playerNumber = results.response;
                date = new Date();
                newPlayerData.timestamp = date.toISOString();
                session.userData.playerDataArray.push(newPlayerData);
                //find index of last element of playerDataArray
                indexToDisplay = session.userData.playerDataArray.unshift() - 1;
                console.log('new playerTracking object added');
            };
        session.userData.playerDisplayArray.splice(0,0,indexToDisplay);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectPlayer/i });

// Dialog to close player 
bot.dialog('closePlayer', [
    function (session) {
        console.log('closePlayer called');
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
        console.log('updateTechnicalSkills called');
        //strips updateTechnicalSkills' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(21);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        console.log('Update Index' + indexToUpdate);
        builder.Prompts.number(session, "Please enter new Game Skills score (1-5)");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].technicalSkills = results.response;
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        console.log("Player " + playerNumberToUpdate + " Technical Skills set to " + session.userData.playerDataArray[indexToUpdate].technicalSkills);
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
        console.log('updateGameSkills called');
        //strips updateGameSkills' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(16);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        console.log('Update Index' + indexToUpdate);
        builder.Prompts.number(session, "Please enter new Game Skills score (1-5)");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].gameSkills = results.response;
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        console.log("Player " + playerNumberToUpdate + " Game Skills set to " + session.userData.playerDataArray[indexToUpdate].gameSkills);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateGameSkills/i });

// Dialog to update athleticism Score 
bot.dialog('updateAthleticism', [
    function (session) {
        console.log('updateathleticism called');
        //strips updateGameSkills' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(17);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        console.log('Update Index' + indexToUpdate);
        builder.Prompts.number(session, "Please enter new Game Skills score (1-5)");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].athleticism = results.response;
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        console.log("Player " + playerNumberToUpdate + " Game Skills set to " + session.userData.playerDataArray[indexToUpdate].athleticism);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateAthleticism/i });

// Dialog to update athleticism Score 
bot.dialog('updateIntangibles', [
    function (session) {
        console.log('updateIntangibles called');
        //strips updateGameSkills' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(17);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        console.log('Update Index' + indexToUpdate);
        builder.Prompts.number(session, "Please enter new Game Skills score (1-5)");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].intangibles = results.response;
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        console.log("Player " + playerNumberToUpdate + " Game Skills set to " + session.userData.playerDataArray[indexToUpdate].intangibles);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateIntangibles/i });

// Dialog to update athleticism Score 
bot.dialog('updateComments', [
    function (session) {
        console.log('updateComments called');
        //strips updateComments' from the message that called the dialog
        playerNumberToUpdate = session.message.text.slice(14);

        indexToUpdate = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToUpdate);
        });
        console.log('Update Index' + indexToUpdate);
        builder.Prompts.text(session, "Please enter add additional comments");
    },
    function (session, results) {
        session.userData.playerDataArray[indexToUpdate].comments += (", " + results.response);
        movePlayerToFrontOfDisplay(session,indexToUpdate);
        console.log("Player " + playerNumberToUpdate + " Comments set to " + session.userData.playerDataArray[indexToUpdate].comments);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateComments/i });

//spin up wthe web server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {

   console.log('%s listening to %s', server.name, server.url); 

});



server.post('/api/messages', connector.listen());

