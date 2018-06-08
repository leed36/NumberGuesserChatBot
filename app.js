/*Daniel lee

  VERSION 1 : Creating a chat bot using node.js for the first time
  Description: The bot will guess for the user's number between 1 to 10
  and will have some personality to it.
  VERSION 2 : Has another bot that is a "friend" that wants to go get food.
  */

var restify = require('restify');
var builder = require('botbuilder');

var name;
var reprompt = false;
var secondAct = false;
//holds the memory from the bot
var inMemoryStorage = new builder.MemoryBotStorage();

var restaurants = {
   "McBonald's" : {
      Name : "McBonald's",
      Description : "fast food restaurant with burgers.",
      PriceRange : "pretty cheap."
   },
   "Olive Yard" : {
      Name : "Olive Yard",
      Description : "nice italian restaurant.",
      PriceRange : "mid range."
   },
   "Sushi world" : {
      Name : "Sushi World",
      Description : "conveyor belt sushi spot.",
      PriceRange : "it can get expensive if you let loose."
   }
}

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
      if (!results.response) {
         session.send("Awww, I guess I messed up. Ferdinand is coming now.");
      } else {
         session.send("Oh I actually got it. Thank you for playing! I hope you enjoy your time with Ferdinand.");
      }
      session.send("*ChatBot leaves* \n*Ferdinand enters*")
      session.send("Hello there, My name is Ferdinand and I'm pretty hungry. Let's get food.");
      session.beginDialog('secondActivity');
   }

]).set('storage', inMemoryStorage);

//The first phase of the bot
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

//The second phase
bot.dialog('secondActivity', [
   function(session){
      builder.Prompts.choice(session, "Where do you want to eat?", restaurants);
   },
   function (session, results) {
      var place = restaurants[results.response.entity];
      session.send(place.Name + " sounds good to me. It's a " + place.Description);
      session.send("Type 'goodbye' to finish or 'cost' to get idea of restaurants.")
   }
])
.endConversationAction('endConversationAction', 'Ok, goodbye!', {
    matches: /^goodbye$/i
})
.beginDialogAction('costAction', 'cost', { matches: /^cost$|^price$/i })
.beginDialogAction('helpAction', 'help2', { matches: /^help$/i });

bot.dialog('cost', function(session, args, next) {
   var msg = "";
   var i;
   for (i in restaurants) {
      if (restaurants.hasOwnProperty(i)) {
         msg += (restaurants[i].Name + " is " + restaurants[i].PriceRange + "\n");
      }
   }
   session.endDialog(msg);
})

bot.dialog('help2', function(session, args, next) {
   var msg = "Umm I'll just repeat what I said.";
   session.endDialog(msg);
})
//function for dividing the number given in one of the dialogs
function divide4(x) {
   return (x / 4);
};
