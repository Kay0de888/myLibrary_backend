const fs = require('fs').promises;
const path = require('path');

const logFilePath = path.join(__dirname, 'logger.log');

async function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  try {
    await fs.appendFile(logFilePath, logEntry);
  } catch (err) {
    console.error('Error writing to log file:', err.message);
  }
}

module.exports = { logMessage };
