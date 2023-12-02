require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose')
const path = require('path');
const session = require('express-session');
//const session = require('cookie-session');
const passport = require("passport");
const bcrypt = require('bcryptjs');
const LocalStrategy = require("passport-local").Strategy;
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const compression = require("compression");
const helmet = require("helmet");

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const conversationRouter = require('./routes/conversation')
const groupRouter = require('./routes/group')
const messagesRouter = require('./routes/messages')
const User = require('./models/user');

const app = express();
app.use(cors());
/*app.use(cors({
    origin: 'https://textera.netlify.app'
}));*/

// Passport setup
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log({username, password});
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" })
      }
      console.log(user);
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

// Set up mongoose connection
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
}

// Set up rate limiter: maximum of sixty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(session({ secret: "sirius", resave: false, saveUninitialized: true, cookie: { secure: true }}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(limiter);
app.use(helmet());
app.use(compression()); 
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/conversation', conversationRouter);
app.use('/group', groupRouter);
app.use('/messages', messagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
