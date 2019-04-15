const express = require('express');
const app = express();
const port = 3000;

/**
 * Web socket client: when a web socket msg is received from the backend-->update the temperature value
 * on index.html
 */