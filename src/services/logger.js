const winston = require('winston');
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