const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');

const {combine, timestamp, label, printf} = winston.format;
const logDir = './logs';

const koreanTime = () => new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
}).split('/').join('-').replace(',', '');

const logFormat = printf(({level, message, label, timestamp}) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    format: combine(
        timestamp({format: koreanTime }),
        label({label: 'CNPS'}),
        logFormat,
    ),

    transports: [
        new winstonDaily({
            lavel: 'info',
            datePattern: 'YY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.log`,
            maxFiles: 60,
            zippedArchive: false,
        }),
        new winstonDaily({
            level: 'error',
            datePattern: 'YY-MM-DD',
            dirname: logDir + '/error',
            filename: `%DATE%.error.log`,
            maxFiles: 60,
            zippedArchive: false,
        }),
    ],
});

module.exports = logger;

// const {createLogger, transports, format} = require("winston");
// const {combine, timestamp, printf, label, simple, colorize} = format;

// const printFormat = printf(({ timestamp, label, level, message }) => {
//     return `${timestamp} [${label}] ${level} | ${message}`;
// });

// const printLogFormat = {
//     file: combine(
//         label({
//             label: "CNPS"
//         }),
//         timestamp({
//             format: "YY-MM-DD HH:mm:dd",
//         }),
//         printFormat
//     ),
//     console: combine(
//         colorize(),
//         simple(),
//     ),
// };

// const opts = {
//     file: new transports.File({
//         filename: "access.log",
//         dirname: "./logs",
//         level: "info",
//         format: printLogFormat.file,
//     }),
//     console: new transports.Console({
//         level: "info",
//         format: printLogFormat.console,
//     }),
// };

// const logger = createLogger({
//     transports: [opts.file]
// });

// module.exports = logger;