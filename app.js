var builder = require('botbuilder');
var azure = require('botbuilder-azure');
var restify = require('restify');


var sqlConfig = require('./config');
// var trackingAdaptiveCard = require('./adaptiveCard');




var sqlClient = new azure.AzureSqlClient(sqlConfig);

var sqlStorage = new azure.AzureBotStorage({ gzipData: false }, sqlClient);

var connector = new builder.ChatConnector({

    appId: process.env.MICROSOFT_APP_ID,

    appPassword: process.env.MICROSOFT_APP_PASSWORD

});

function playerData() {
    this.timestamp = '';
    this.playerNumber = 0;
    this.playerName = '';
    this.technicalSkills = 0;
    this.gameSkills = 0;
    this.athleticism= 0;
    this.intangibles= 0;
    this.comments= '';
    this.display = true;
}



var currentPlayerData = new playerData;

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
    session.beginDialog('mainNavigationCarousel').endDialog();

});
// }).set('storage', sqlStorage);

//dialog to display player and game details
bot.dialog('mainNavigationCarousel', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    setupHeroCard = new builder.HeroCard(session)
    .title('Select Players to Track')
    .subtitle("Click to update information")
    .buttons([
        builder.CardAction.imBack(session, "TryoutDate", "Tryout Date: " + session.userData.tryoutDate ),
        builder.CardAction.imBack(session, "Age Group", "Age Group: " + session.userData.tryoutAgeGroup ),
        builder.CardAction.imBack(session, "Gender", "Gender: " + session.userData.tryoutGender ),
        builder.CardAction.imBack(session, "selectPlayer", "Select Player#" )
    ]);

    function createPlayerHeroCard(session, playerNumber) {
        // console.log('createPlayerHeroCard called with' + playerNumber)
        playerHeroCard = new builder.HeroCard(session)
        .title('Player #' + session.userData.playerDataArray[playerNumber].playerNumber)
        .subtitle(session.userData.playerDataArray[playerNumber].comments)
        .buttons([
            builder.CardAction.imBack(session, "updateTechnicalSkills"+session.userData.playerDataArray[playerNumber].playerNumber, "Technical Skills: " + session.userData.playerDataArray[playerNumber].technicalSkills ),
            builder.CardAction.imBack(session, "updateGameSkills"+session.userData.playerDataArray[playerNumber].playerNumber, "Game Skills: " + session.userData.playerDataArray[playerNumber].gameSkills),
            builder.CardAction.imBack(session, "updateAthleticism"+session.userData.playerDataArray[playerNumber].playerNumber, "Athleticism: " + session.userData.playerDataArray[playerNumber].athleticism ),
            builder.CardAction.imBack(session, "updateIntangibles"+session.userData.playerDataArray[playerNumber].playerNumber, "Intangibles: " + session.userData.playerDataArray[playerNumber].intangibles ),
            builder.CardAction.imBack(session, "updateComments"+session.userData.playerDataArray[playerNumber].playerNumber, "Add Comments" ),
            builder.CardAction.imBack(session, "closePlayer"+session.userData.playerDataArray[playerNumber].playerNumber, "Close this Player" ),
        ])
        return playerHeroCard;
    }

    msg.addAttachment(setupHeroCard);
    //add a new heroCard for each player set to display
    session.userData.playerDataArray.forEach(function(element, index) {
        if (session.userData.playerDataArray[index].display) {
            msg.addAttachment(createPlayerHeroCard(session,index));
        }
    });
    session.send(msg);
    session.endDialog(); //should never get called
});

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
        if (!(indexToDisplay == -1)) 
            {session.userData.playerDataArray[indexToDisplay].display=true;} 
            else 
            {   
                var newPlayerData = new playerData;
                newPlayerData.playerNumber = results.response;
                date = new Date();
                newPlayerData.timestamp = date.toISOString();
                session.userData.playerDataArray.push(newPlayerData);
                console.log('new playerTracking object added');
            };
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /selectPlayer/i });

// Dialog to close player 
bot.dialog('closePlayer', [
    function (session) {
        console.log('closePlayer called');
        //strips 'closePlayer' from the message that called the dialog
        playerNumberToClose = session.message.text.slice(11);

        indexToClose = session.userData.playerDataArray.findIndex(function(currentValue, index) {
            return session.userData.playerDataArray[index].playerNumber==parseInt(playerNumberToClose);
        });
        console.log('Closing Index' + indexToClose);
        session.userData.playerDataArray[indexToClose].display=false;
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
        console.log("Player " + playerNumberToUpdate + " Technical Skills set to " + session.userData.playerDataArray[indexToUpdate].technicalSkills);
        session.beginDialog('mainNavigationCarousel').endDialog();
    }
]).triggerAction({ matches: /updateTechnicalSkills/i });


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