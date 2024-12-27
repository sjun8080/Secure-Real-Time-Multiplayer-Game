require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
app.use(express.static('public'));

app.use(helmet());

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

app.disable('x-powered-by');//Why it’s used: For security reasons. Removing this header helps reduce the information available to potential attackers.//

app.use((req, res, next) => {
  res.set('X-Powered-By', 'PHP 7.4.3');
  next();
});
//Overrides the disabled header by setting a custom X-Powered-By header with the value PHP 7.4.3.
//This will replace the X-Powered-By header that was previously removed.

app.use(cors({origin: '*'})); 


app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 


fccTestingRoutes(app);


app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;


const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app;


