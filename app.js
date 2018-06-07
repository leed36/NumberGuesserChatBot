/*Daniel lee

  Creating a chat bot using node.js for the first time
  Description: The bot will guess for the user's number between 1 to 10
  and will have some personality to it.
  */

var restify = require('restify');
var builder = require('botbuilder');

var name;
var reprompt = false;
var secondAct = false;
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

//receives and echoes back
var bot = new builder.UniversalBot(connector, [
   function (session) {
      if (!secondAct) {
         session.send("Hello, I think I'm ChatBot or Chatting Robot. And I will miraculously guess your number.");
         session.beginDialog('firstActivity');
      }
   },
   function (session, results) {
      if (results.response === "no") {
         session.send("Awww, I guess I messed up. ");
      } else {
         session.send("Oh I actually got it. Thank you for playing! I hope you have fun with Ferdinand.");
      }
      session.send("*ChatBot leaves* *Ferdinand enters*")
      session.send("Hello there, My name is Ferdinand and I would like to quiz your math skills.");
      session.beginDialog('secondActivity');
   }

]).set('storage', inMemoryStorage);


bot.dialog('firstActivity', [
   function(session) {
      if (!reprompt) {
         builder.Prompts.text(session, "What is your name?");
      } else {
         reprompt = false;
         session.send("Let's try this again. Type anything to continue or goodbye to stop.");
      }
   },
   function (session, results) {
      session.dialogData.name = results.response;
      name = results.response;
      session.send("Hi " + name + "! Please think of a number between 1 - 10 and remember it.");
      builder.Prompts.confirm(session, "Is your number greater than 5? Yes or No.");

   },
   function (session, results) {
      session.dialogData.grtrFive = results.response;
      builder.Prompts.number(session, "What is your number multiplied by 4?");
   },
   function (session, results) {
      session.dialogData.multFour = results.response;
      var number = divide4(results.response);
      if (number % 1 === 0) {
         secondAct = true;
         session.send("Your number is " + number);
         builder.Prompts.confirm(session, "Am I right?");
      } else {
         session.send("You multiplied your number incorrectly.");
         reprompt = true;
         session.replaceDialog('firstActivity');
      }
   }
])
.endConversationAction('endConversationAction', 'Ok, goodbye!', {
    matches: /^goodbye$/i
})
.beginDialogAction('helpAction', 'help', { matches: /^help$/i });

bot.dialog('help', function(session, args, next) {
   var msg = "Sorry, I don't know what to do either. -.-";
   session.endDialog(msg);
})

bot.dialog('secondActivity', [
   function(session) {
      
   }
])
.endConversationAction('endConversationAction', 'Ok, goodbye!', {
    matches: /^goodbye$/i
})
.beginDialogAction('helpAction', 'help2', { matches: /^help$/i });

bot.dialog('help2', function(session, args, next) {
   var msg = "Umm I'll just repeat what I said.";
   session.endDialog(msg);
})
//function for dividing the number given in one of the dialogs
function divide4(x) {
   return (x / 4);
};

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
