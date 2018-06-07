/*Daniel lee

  Creating a chat bot using node.js for the first time
  Description: The bot will guess for the user's number between 1 to 10
  and will have some personality to it.
  */

var restify = require('restify');
var builder = require('botbuilder');

//holds the memory from the bot
var inMemoryStorage = new builder.MemoryBotStorage();

//Setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
   console.log('%s listening to %s', server.name, server.url);
   }
);

//Creates chat connector for communicating
var connector = new builder.ChatConnector(
   {
      appId: process.env.MicrosoftAppId,
      appPassword: process.env.MicrosoftAppPassword
   }
);

//listens for messages
server.post('/api/messages', connector.listen());
var name;
function divide4(x) {
   return (x / 4);
};
//receives and echoes back
var bot = new builder.UniversalBot(connector, [
   function (session) {
      session.send("Hello, I think I'm a ChatBot or Chatting Robot. And I will miraculously guess a number.");
      session.beginDialog('askForName');
   },
   function (session, results) {
      session.dialogData.name = results.response;
      name = results.response;
      session.beginDialog('askForNumber');
   },
   function (session, results) {
      session.dialogData.greaterThan5 = results.response;
      session.beginDialog('askForMath');
   },
   function (session,results) {
      session.dialogData.mathNumber = results.response;
      session.endConversation("Your number is " + divide4(results.response));
   }
]).set('storage', inMemoryStorage);



bot.dialog('askForName', [
   function(session) {
      builder.Prompts.text(session, "What is your name?");
   },
   function (session, results) {
      session.endDialogWithResult(results);
   }
])
.beginDialogAction('nameHelpAction', 'help', { matches: /^help$/i });

bot.dialog('help', function(session, args, next) {
   var msg = "Sorry, I don't know what to do either. -.-";
   session.endDialog(msg);
})

//ask user to think of a number
bot.dialog('askForNumber', [
   function (session) {
      session.send("Hi " + name + "! Please think of a number between 1 - 10 and remember it.");
      builder.Prompts.text(session, "Is your number greater than 5? Yes or No.");
   },
   function (session, results) {
      session.endDialogWithResult(results);
   }
])
.beginDialogAction('nameHelpAction', 'help', { matches: /^help$/i });

bot.dialog('askForMath', [
   function(session) {
      builder.Prompts.text(session, "What is your number multiplied by 4?");
   },
   function (session, results) {
      session.endDialogWithResult(results);
   }
])
.beginDialogAction('nameHelpAction', 'help', { matches: /^help$/i });

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
