const chalk = require('chalk');

class Logger {
    ok = (logTitle, logMessage, newLines = null) => this.display(newLines, "       [OK]", logTitle, logMessage, chalk.green.bold);
    info = (logTitle, logMessage, newLines = null) => this.display(newLines, "     [INFO]", logTitle, logMessage, chalk.blue.bold);
    warn = (logTitle, logMessage, newLines = null) => this.display(newLines, "  [WARNING]", logTitle, logMessage, chalk.yellow.bold);
    error = (errNumber, logTitle, logMessage, newLines = null) => this.display(newLines, "[ERROR " + errNumber + "]", logTitle, logMessage, chalk.red.bold);
    customLevel = (logLevel, logTitle, logMessage, colorize, newLines = null) => this.display(newLines, logLevel, logTitle, logMessage, colorize);
    display = (newLines, logLevel, logTitle, logMessage, colorize = chalk.white) => {
        while (logLevel.length <= 10) logLevel = " " + logLevel; // pad log level to align output
        if (newLines) logLevel = newLines + logLevel; // jump a line if needed
        console.log(`${logLevel ? colorize(logLevel) + ' ' : ''}${logTitle ? logTitle + ' : ' : ''}${colorize(logMessage)}`);
    }
}

module.exports = {
    log: new Logger()
}