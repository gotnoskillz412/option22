'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('winston');

var routes = require('./routes/routes');
// const security = require('./services/security');

var PORT = 3000;
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(security());

app.use('/', routes.index);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

app.listen(PORT, function () {
	logger.info('App listening on port ' + PORT + '...');
});
'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
	res.status(200).send('ok');
});

exports = module.exports = router;
'use strict';

exports = module.exports = {
	index: require('./index')
};