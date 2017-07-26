const winston = require('winston');

/*
Log Levels
    Error: 0
    Warn: 1
    Info: 2
    Verbose: 3
    Debug: 4
    Silly: 5
 */

const logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            level: 'silly',
            prettyPrint: true,
            timestamp: true
        }),
        new (winston.transports.File)({
            colorize: true,
            filename: 'logs/log.txt',
            level: 'info',
            timestamp: true
        })
    ]
});
logger.emitErrs = false;

exports = module.exports = logger;