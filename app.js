const express    = require('express');
const exphbs     = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');

const app = express();

// Map global promise - get rid of warning (mongoose Promise deprecated)
mongoose.Promise = global.Promise;

// Connect to goose
mongoose.connect('mongodb://localhost/vidjot-dev', {
  useMongoClient: true
})
  .then(() => { console.log('mongodb connected...') })
  .catch(err => { console.log(err) });

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// How middleware works
app.use(function(req, res, next) {
  // console.log(Date.now());
  req.name = 'Rob Williams';
  next();
});

// Index Route
app.get('/', (req, res) => {
  // console.log(req.name);
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});

// Process Form
app.post('/ideas', (req, res) => {
  // console.log(req.body);
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: 'Please add a title' })
  }
  if (!req.body.details) {
    errors.push({ text: 'Please add some details' })
  }
  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.details,
      details: req.body.details
    });
  } else {
    res.send('passed');
  }
});

// Server Info
const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
