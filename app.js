var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var sentiment = require('sentiment');
const request = require('request');


function postEmotion(emotion, ev) {
  console.log('emotion in postEmotion', emotion)
  console.log('ev in postEmotion', ev)
    var message = 'feeling ' + emotion;
    var options = {
        method: 'POST',
        uri: 'https://slack.com/api/chat.postMessage',
        form: {
            token: process.env.SLACK_OAUTH_TOKEN,
            channel: ev.channel,
            text: message,
            as_user: false,
            username: 'Sentiment Bot'
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

app.post('/bot', function(req, res, next) {
  var q = req.body;
  console.log('Q\n', q)

    // request is coming from slack?
    if (q.token !== process.env.SLACK_VERIFICATION_TOKEN) {
        res.sendStatus(400);
        return;
    }

    if (req.body.type === 'url_verification') {
        res.send(q.challenge); // complete bot endpoint handshake for Slack
    }

    // 2. Events - get the message text
    else if (q.type === 'event_callback') {
        if(!q.event.text) return;
        console.log('q.event\n', q.event);
        var sent = sentiment(q.event.text) // sentiment analysis
        console.log('sent:\n', sent)
        // postEmotion(sent, q.event) // post message

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
