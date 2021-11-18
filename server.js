const express = require('express');
const morgan = require('morgan');
//const fs = require('fs');
const rfs = require('rotating-file-stream');
const path = require('path');
const dirPath = path.join(__dirname, '/logs');
const session = require('express-session');
const routes = require('./controllers');
const exphbs = require('express-handlebars');
const helpers = require('./utils/helpers');
const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const hbs = exphbs.create({ helpers });

const app = express();
const PORT = process.env.PORT || 3001;

const sess = {
  secret: 'Super secret secret',
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize
  })
};

//custom morgan token
morgan.token("custom", ":date A new :method request for :url was received. The version of the HTTP request was :http-version. It took this long for a response :response-time[3]. It took a total of :total-time[3] to complete. The IP address of the request was :remote-addr");

// create a write stream (in append mode)
//let accessLogStream = fs.createWriteStream(path.join(dirPath, 'apiRequests.log'), { flags: 'a' });
let accessLogStream = rfs.createStream('apiRequests.log',{
  interval: '2d',
  path: path.join(__dirname, 'log')
})

//start logging prior to routing
app.use(morgan('custom', { stream: accessLogStream }));

app.use(session(sess));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening on port 3001'));
});
