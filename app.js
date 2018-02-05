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
}

var playerDataArray = Array(playerData);

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

    session.send("You said: %s", session.message.text);
    date = new Date();
    currentPlayerData.timestamp = date.toISOString();
    playerDataArray.push(currentPlayerData);
    session.userData.playerTracking = playerDataArray;
    session.beginDialog('playerAndGameDetails').endDialog();


}).set('storage', sqlStorage);

//dialog to display player and game details
bot.dialog('playerAndGameDetails', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([

        new builder.HeroCard(session)
        .title(session.userData.matchState + " Player Details")
        .subtitle("Click to update information")
        .buttons([
            builder.CardAction.imBack(session, "Update Player Name", "Name: " + session.userData.playerName ),
            builder.CardAction.imBack(session, "Update Player Number", "Number: " + session.userData.playerNumber ),
            builder.CardAction.imBack(session, "Update Team", "Team: " + session.userData.playerTeam ),
            builder.CardAction.imBack(session, "Update Club", "Club: " + session.userData.playerClub ),
            builder.CardAction.imBack(session, "Player Time", "Player Time: " + moment(session.userData.totalPlayerElapsedTime).format('mm:ss') ),
            builder.CardAction.imBack(session, "Game Time", "Game Time: " + moment(session.userData.totalGameElapsedTime).format('mm:ss') )

        ]),
        new builder.HeroCard(session)
            .title(session.userData.matchState + " Game Details")
            .subtitle("Click to update information")

            .buttons([
                builder.CardAction.imBack(session, "Kick Off", "Kick Off"),
                builder.CardAction.imBack(session, "Update Home Team", session.userData.playerClub + ": " + session.userData.playerTeamHomeAway ),
                builder.CardAction.imBack(session, "Update Opponent Team", "Opponent Team: " + session.userData.opponentTeam ),
                builder.CardAction.imBack(session, "Update Opponent Club", "Opponent Club: " + session.userData.opponentClub ),
                builder.CardAction.imBack(session, "Update Game Location", "Game Location: " + session.userData.gameLocation ),
                builder.CardAction.imBack(session, "Update Game Field", "Field Number: " + session.userData.gameField )
            ]),
            new builder.HeroCard(session)
            .title("Maintenance")
            .subtitle("Click to update information")
            .buttons([
                builder.CardAction.imBack(session, "Delete Game Data", "Track New Game" ),
                builder.CardAction.imBack(session, "Delete Player Data", "Track New Player" )
            ])

    ]);
    session.send(msg);
    session.endDialog(); //should never get called
});




var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {

   console.log('%s listening to %s', server.name, server.url); 

});



server.post('/api/messages', connector.listen());