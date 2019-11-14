const express        = require('express');
const exphbs         = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser     = require('body-parser');
const mongoose       = require('mongoose');
const flash          = require('connect-flash');
const session        = require('express-session');

const app = express();

// Map global promise - get rid of warning (mongoose Promise deprecated)
mongoose.Promise = global.Promise;

// Connect to Mongo
// mongoose.connect('mongodb://localhost/vidjot-dev', {
//   useMongoClient: true
// })
//   .then(() => { console.log('mongodb connected...') })
//   .catch(err => { console.log(err) });

mongoose.connect('mongodb://localhost/vidjot-dev', {
  useNewUrlParser: true
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

// Method override middleware
app.use(methodOverride('_method'));

// Session middleware for express-session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}));

// Flash middleware
app.use(flash());

// Global Variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

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

app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('./ideas/index', { ideas: ideas });
    })
});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({ _id: req.params.id })
    .then(idea => {
      res.render('./ideas/edit', {
        idea: idea
      });
    });
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
    // res.send('passed');
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added');
        res.redirect('/ideas');
      })
      .catch(err => console.log(err));
  }
});

// Edit Form process - HTML forms cannot send PUT requests
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save().then(idea => {
      req.flash('success_msg', 'Video idea updated');
      res.redirect('/ideas');
    })
  })
});

// Delete Ideas
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({ _id: req.params.id })
    .then(() => {
      res.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    });
});

// Server Info
const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
