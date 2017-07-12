var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var sentiment = require('sentiment');
var request = require('request');
require('dotenv').config();
/**
 * -- *** Slack App configuration *** --
 *
 * After creating your App,
 * * store your Verification Token
 * * you can also store your Client ID in case you need to implement the OAuth when distributing the app
 *
 * Add the required features
 * * 1-bots
 * * 2-OAuth Tokens & permissions
 * * * Add the relevant permission scopes to your app: bot, channels:history
 * * * Store your OAuth Access Token for later
 * * 3-Event subscriptions
 * * * Enable Events with your Request URL (with ngrok until you deploy it) used for Slack API to post requests, must do the challenge verification
 * * * Subscribe your bot to events: message.channels
 *
 * Add the bot to the desired channel (not private)
 */


var BOT_NAME = 'Sentiment Bot';


/**
 *
 * @param emotion
 * @param ev
 */
function postEmotion(emotion, userPayload) {
  console.log('emotion in postEmotion', emotion)
    //TODO Replace later with function output processing data
    var message = 'feeling ' + emotion.score;
    var options = {
        method: 'POST',
        // method, Web API endpoint to use for sending messages
        uri: 'https://slack.com/api/chat.postMessage',
        form: {
            token: process.env.SLACK_OAUTH_TOKEN,
            channel: userPayload.channel,
            text: message,
            as_user: false,
            username: BOT_NAME
        }
    };
    // Use Request module to POST
    request(options, function(error, response, body) {
        if (error) {
            console.log(error)
        }
    });
}

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// var ts = require('tinyspeck');
// var slack = ts.instance({ token: process.env.SLACK_OAUTH_TOKEN });
/*var instance = slack.instance({
    unfurl_links: true,
    channel: 'C1QD223DS1',
    token: 'xoxb-12345678900-ABCD1234567890'
})*/
// console.log('slack', slack)

/*slack.on('message.channels', function(payload){
    console.log('payload', payload);
    const message = {
        text: "I am a test message http://slack.com",
        attachments: [{
            text: "And here's an attachment!"
        }]
    };

    slack.send('chat.postMessage', message)
        .then(function(res) {
            console.log('res', res)
    })
})*/

// slack.listen('4000')

app.get('/oauth', function(req, res, next) {
    res.render('add_to_slack')
});

app.get('/oauth/redirect', function(req, res) {
    var options = {
        uri: 'https://slack.com/api/oauth.access?code='
        +req.query.code+
        '&client_id='+process.env.SLACK_CLIENT_ID+
        '&client_secret='+process.env.SLACK_CLIENT_SECRET+
        // to redirect back to the original url request - REDIRECT_URL
        '&redirect_uri='+process.env.REDIRECT_URI,
        method: 'GET'
    }

    request(options, function(error, response, body) {
        var JSONresponse = JSON.parse(body)
        console.log(JSONresponse)
        if (!JSONresponse.ok) {
            res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
        }else {
            // res.send("Success!")
            res.redirect('/')
        }
    })
});

app.post('/bot', function(req, res, next) {


  var q = req.body;
    // request is coming from slack?
    if (q.token !== process.env.SLACK_VERIFICATION_TOKEN) {
        res.sendStatus(400);
        return;
    }

    if (req.body.type === 'url_verification') {
        res.status(200).send(q.challenge) // complete bot endpoint handshake for Slack
    }

    // 2. Events - get the message text
    else if (q.type === 'event_callback') {
        var userPayload = q.event;
        console.log('q.event aka userPayload\n', userPayload);
        if(!userPayload.text) return; // no message sent
        var sent = sentiment(userPayload.text) // sentiment analysis
        //TODO 'Data processing' required here depending on the score sentiment
        /**
         *
         */
        // post message which is not from the bot to avoid infinite loop
        if (q.event.username !== BOT_NAME) postEmotion(sent, userPayload)

        res.sendStatus(200)
    }
});



app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
