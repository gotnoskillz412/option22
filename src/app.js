'use strict';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');

if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
    fs.closeSync(fs.openSync('logs/log.txt', 'w'));
}

const accountExtractor = require('./middleware/accountExtractor');
const logger = require('./utilities/logger');
const routes = require('./routes/routes');
const security = require('./middleware/security');

const PORT = parseInt(process.env.PORT, 10) || 3000;

const corsOptions = {
    origin: process.env.BASE_WEB || '*',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false,
    type: '*/x-www-form-urlencoded'
}));
app.use(cookieParser());

app.use(cors(corsOptions));

app.use('/', routes.index);
app.use('/auth', routes.auth);
app.use('/email', routes.email);
app.use('/accounts/:accountId/goals', security(), accountExtractor(), routes.goals);
app.use('/accounts/:accountId/profiles', security(), accountExtractor(), routes.profile);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);


/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res) => {
        res.status(err.status || 500);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
});

app.listen(PORT, () => {
    logger.info('app.js', `App listening on port ${PORT}...`);
});

module.exports = app;