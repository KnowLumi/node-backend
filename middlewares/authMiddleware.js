// authMiddleware.js
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
};

passport.use(
  'student',
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    // Check if the JWT payload represents a student
    if (jwtPayload.role === 'student') {
      return done(null, jwtPayload);
    } else {
      return done(null, false);
    }
  })
);

passport.use(
  'creator',
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    // Check if the JWT payload represents a creator
    if (jwtPayload.role === 'creator') {
      return done(null, jwtPayload);
    } else {
      return done(null, false);
    }
  })
);

const authenticateStudent = passport.authenticate('student', { session: false });
const authenticateCreator = passport.authenticate('creator', { session: false });

module.exports = { authenticateStudent, authenticateCreator };
