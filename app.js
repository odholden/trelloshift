const express = require('express'),
    ejs = require('ejs'),
    morgan = require('morgan');

const moveCards = require('./controllers/moveCards');
const trelloKey = require('./config').trelloKey;
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine' , 'ejs');

app.use(morgan('dev'));
app.use('/', express.static(__dirname + '/public'));

app.get('/', (req, res) => res.render(__dirname + "/public/index", {trelloKey: trelloKey}));

app.listen(port, () => console.log('app listening on ' + port));
