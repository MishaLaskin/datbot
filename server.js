var Botkit = require('botkit');
var Keen = require('keen-js');

/*
var client = new Keen({
   projectId: "570143c090e4bd405cc38f9f", // String (required always)
   writeKey: "ed6a9c0ac0f8f6cc26ae277e5a6ed99bbcbf1d9227ea47e84abb25c30e9727eab4d1d61593dc1a55188d86de90f7a546fed32e637de032c17f89a486ca38dbe429a5ccfe2bf3bf3d66b6d2b4aefac465072f38da6f56caa90b21f7c387079a07",   // String (required for sending data)
   readKey: "95aa5dddb4a6b0fcbf9c8277e26444417976cc16e64513bb3d8c12a3a2161792a7eb3b414877bd903ce3ab96efc3352ca69c2d7777d9c9902dea3cfce116926725efa900ce0a8b68af545814a9d07b5c207f787f9701e69ac905762748f6531f"      // String (required for querying data)

   // protocol: "https",         // String (optional: https | http | auto)
   // host: "api.keen.io/3.0",   // String (optional)
   // requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
 });
*/


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

controller.setupWebserver(port, function(err, webserver) {
	if (err) return console.log(err)
	controller.createWebhookEndpoints(webserver, bot, function() {
		console.log('Ready')
	})
})


/* SAY HELLO!!!! */
controller.hears(['hello', 'hi', 'hey'], 'message_received', function (bot, message) {  
    bot.reply(message, "Hi there!");
})
/* FUNCTIONS FOR MAKING POST ARRAYS */


//makes 1,2,or 3 card galleries with 2 buttons

function makecards(post) {

	var messageData = [];

	var number = post.length;

	switch (number) {
		case 1:

			messageData =  {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"elements": [{
							"title": post[0].title,
							"subtitle": post[0].subtitle,
							"image_url": post[0].image_url,
							"buttons": [{
								"type": "postback",
								"title": post[0].btn1title,
								"payload": post[0].btn1payload
							}, {
								"type": "postback",
								"title": post[0].btn2title,
								"payload": post[0].btn2payload,
							}],
						}]
					}
				}
			
			break;
		case 2:

			messageData =  {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"elements": [{
							"title": post[0].title,
							"subtitle": post[0].subtitle,
							"image_url": post[0].image_url,
							"buttons": [{
								"type": "postback",
								"title": post[0].btn1title,
								"payload": post[0].btn1payload
							}, {
								"type": "postback",
								"title": post[0].btn2title,
								"payload": post[0].btn2payload,
							}],
						}, {
							"title": post[1].title,
							"subtitle": post[1].subtitle,
							"image_url": post[1].image_url,
							"buttons": [{
								"type": "postback",
								"title": post[1].btn1title,
								"payload": post[1].btn1payload
							}, {
								"type": "postback",
								"title": post[1].btn2title,
								"payload": post[1].btn2payload,
							}],
						}]
					}
				}
			
			break;
		case 3:
			messageData =  {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"elements": [{
							"title": post[0].title,
							"subtitle": post[0].subtitle,
							"image_url": post[0].image_url,
							"buttons": [{
								"type": "postback",
								"title": post[0].btn1title,
								"payload": post[0].btn1payload
							}, {
								"type": "postback",
								"title": post[0].btn2title,
								"payload": post[0].btn2payload,
							}],
						}, {
							"title": post[1].title,
							"subtitle": post[1].subtitle,
							"image_url": post[1].image_url,
							"buttons": [{
								"type": "postback",
								"title": post[1].btn1title,
								"payload": post[1].btn1payload
							}, {
								"type": "postback",
								"title": post[1].btn2title,
								"payload": post[1].btn2payload,
							}],
						}, {
							"title": post[2].title,
							"subtitle": post[2].subtitle,
							"image_url": post[2].image_url,
							"buttons": [{
								"type": "postback",
								"title": post[2].btn1title,
								"payload": post[2].btn1payload
							}, {
								"type": "postback",
								"title": post[2].btn2title,
								"payload": post[2].btn2payload,
							}],
						}]
					}
				}
			
				break;
		default:
			messageData = "Oops! There was an error. Email misha@meetclaire, our Chief Bug Squasher."

	}

	return messageData;



}



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

			var reply = "Email misha@meetclaire.co to report this bug."
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

		var categories = [{
			"title": "Tech",
			"buttons": [{
				"type": "postback",
				"payload": "getPosts_tech",
				"title": "Today's Hunts"
			}, {
				"type": "postback",
				"payload": "getPosts_tech_1",
				"title": "Yesterday's Hunts"
			}]
		}, {
			"title": "Games",
			"buttons": [{
				"type": "postback",
				"payload": "getPosts_games",
				"title": "Today's Hunts"
			}, {
				"type": "postback",
				"payload": "getPosts_games_1",
				"title": "Yesterday's Hunts"
			}]
		}, {
			"title": "Podcasts",
			"buttons": [{
				"type": "postback",
				"payload": "getPosts_podcasts",
				"title": "Today's Hunts"
			}, {
				"type": "postback",
				"payload": "getPosts_podcasts_1",
				"title": "Yesterday's Hunts"
			}]
		}, {
			"title": "Books",
			"buttons": [{
				"type": "postback",
				"payload": "getPosts_books",
				"title": "Today's Hunts"
			}, {
				"type": "postback",
				"payload": "getPosts_books_1",
				"title": "Yesterday's Hunts"
			}]
		}]

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

/*controller.hears(['hello', 'hi', 'hey'], 'message_received', function (bot, message) {
	var reply = "Hi there! I have some hunts for you";
	bot.reply(message, reply, function(err, response) {
		if (err) handleError(bot, message, err);
		chooseCategoryPrompt(bot, message);
	});
})

controller.hears(['category', 'categories'], 'message_received', function (bot, message) {
	chooseCategoryPrompt(bot, message);
})*/

controller.hears(['cookies'], 'message_received', function(bot, message) {

	bot.startConversation(message, function(err, convo) {

		convo.say('Did someone say cookies!?!!');
		convo.ask('What is your favorite type of cookie?', function(response, convo) {
			convo.say('Golly, I love ' + response.text + ' too!!!');
			convo.next();
		});
	});
});

/****  OTHER EVENTS  ************************/

controller.on('facebook_optin', function(bot, message) {
	var reply = 'Welcome! I have some products for you';
	bot.reply(message, reply, function(err) {
		if (err) handleError(bot, message, err);
		chooseCategoryPrompt(bot, message);
	});

});
/** test area **/

controller.hears('pixies', 'message_received', function(bot, message) {


	var examplePost = [{
		title: "Hey",
		subtitle: "Been Trying to meet ya",
		image_url: "http://assets.rollingstone.com/assets/images/artists/pixies.jpg",
		btn1title: "Good song bro",
		btn1payload: "Oh yea",
		btn2title: "Boo, bad song",
		btn2payload: "What???",
		
	},{
		title: "Hey",
		subtitle: "Been Trying to meet ya",
		image_url: "http://assets.rollingstone.com/assets/images/artists/pixies.jpg",
		btn1title: "Good song bro",
		btn1payload: "Oh yea",
		btn2title: "Boo, bad song",
		btn2payload: "What???",
		
	},{
		title: "Hey",
		subtitle: "Been Trying to meet ya",
		image_url: "http://assets.rollingstone.com/assets/images/artists/pixies.jpg",
		btn1title: "Good song bro",
		btn1payload: "Oh yea",
		btn2title: "Boo, bad song",
		btn2payload: "What???",
		
	}];

	var attachment = makecards(examplePost);


	/*var attachment = {
		'type': 'template',
		'payload': {
			'template_type': 'generic',
			"elements": [{
				"title": "First card",
				"subtitle": "Element #1 of an hscroll",
				"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
				"buttons": [{
					"type": "web_url",
					"url": "https://www.messenger.com",
					"title": "web url"
				}, {
					"type": "postback",
					"title": "Postback",
					"payload": "Payload for first element in a generic bubble",
				}],
			}, {
				"title": "Second card",
				"subtitle": "Element #2 of an hscroll",
				"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
				"buttons": [{
					"type": "postback",
					"title": "Postback",
					"payload": "Payload for second element in a generic bubble",
				}],
			}, {
				"title": "Third card",
				"subtitle": "Element #3 of an hscroll",
				"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
				"buttons": [{
					"type": "web_url",
					"url": "https://www.messenger.com",
					"title": "web url"
				}, {
					"type": "postback",
					"title": "Postback",
					"payload": "Payload for third element in a generic bubble",
				}],
			}]
		}
	};*/

	bot.reply(message, {
		attachment: attachment,
	});

});

controller.on('facebook_postback', function(bot, message) {
	
	bot.reply(message, message.payload )
	// Create a data object with the properties you want to send
	/*var purchaseEvent = {
	  item: "golden gadget",  
	  price: 2550, // track dollars as cents
	  referrer: document.referrer,
	  keen: {
	    timestamp: new Date().toISOString()
	  }
	};

	// Send it to the "purchases" collection
	client.addEvent("purchases", purchaseEvent, function(err, res){
	  if (err) {
	    // there was an error!
	  }
	  else {
	    // see sample response below
	  }
	});
*/



});


