var Botkit = require('botkit')

var accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN  
var verifyToken = process.env.FACEBOOK_VERIFY_TOKEN  
var port = process.env.PORT

if (!accessToken) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required but missing')  
if (!verifyToken) throw new Error('FACEBOOK_VERIFY_TOKEN is required but missing')  
if (!port) throw new Error('PORT is required but missing')

var controller = Botkit.facebookbot({  
  access_token: accessToken,
  verify_token: verifyToken
})

var bot = controller.spawn()

controller.setupWebserver(port, function (err, webserver) {  
  if (err) return console.log(err)
  controller.createWebhookEndpoints(webserver, bot, function () {
    console.log('Ready')
  })
})


/* SAY HELLO!!!! */
/*controller.hears(['hello', 'hi', 'hey'], 'message_received', function (bot, message) {  
    bot.reply(message, "Hi there!");
})*/




/* *****************************
   GLOBAL FUNCTIONS
***************************** */


var httpGet = function(url) {
	return new Promise(function(resolve, reject) {

		https.get(url, function(res) {

			var body = '';

			res.on('data', function(data) {
				data = data.toString();
				body += data;
			});

			res.on('end', function() {
				body = JSON.parse(body);
				var stories = body;
				resolve(stories);
			});

		}).on('error', function(err) {
			reject(err)
		});

	})
}


var handleError = function(bot, message, err) {

	console.log(err);

	var reply = "Oops! Looks like there was an error. Here are the details..";

	bot.reply(message, reply, function(err, response) {

		bot.reply(message, err, function(err, response) {

			var reply = "Email ire@ireaderinokun.com to report this bug."
			bot.reply(message, reply);

		});

	});

}


/* *****************************
	CHOOSE CATEGORY
***************************** */

var chooseCategoryPrompt = function(bot, message) {

	var reply = "Choose a category...";

	bot.reply(message, reply, function(err, response) {

		var categories = [
			{
				"title": "Tech",
				"buttons":[
					{
						"type":"postback",
						"payload": "getPosts_tech",
						"title":"Today's Hunts"
					},
					{
						"type":"postback",
						"payload": "getPosts_tech_1",
						"title":"Yesterday's Hunts"
					}
				]
			},
			{
				"title": "Games",
				"buttons":[
					{
						"type":"postback",
						"payload": "getPosts_games",
						"title":"Today's Hunts"
					},
					{
						"type":"postback",
						"payload": "getPosts_games_1",
						"title":"Yesterday's Hunts"
					}
				]
			},
			{
				"title": "Podcasts",
				"buttons":[
					{
						"type":"postback",
						"payload": "getPosts_podcasts",
						"title":"Today's Hunts"
					},
					{
						"type":"postback",
						"payload": "getPosts_podcasts_1",
						"title":"Yesterday's Hunts"
					}
				]
			},
			{
				"title": "Books",
				"buttons":[
					{
						"type":"postback",
						"payload": "getPosts_books",
						"title":"Today's Hunts"
					},
					{
						"type":"postback",
						"payload": "getPosts_books_1",
						"title":"Yesterday's Hunts"
					}
				]
			}
		]

		bot.reply(message, {
			attachment: {
			  type: 'template',
			  payload: {
				template_type: 'generic',
				elements: categories
			  }
			}
		})

	})

}



/* *****************************
	CONTROLLER
***************************** */



/****  KEYWORDS ************************/

controller.hears(['hello', 'hi', 'hey'], 'message_received', function (bot, message) {
	var reply = "Hi there! I have some hunts for you";
	bot.reply(message, reply, function(err, response) {
		if (err) handleError(bot, message, err);
		chooseCategoryPrompt(bot, message);
	});
})

controller.hears(['category', 'categories'], 'message_received', function (bot, message) {
	chooseCategoryPrompt(bot, message);
})
