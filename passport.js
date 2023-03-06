const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const GOOGLE_CLIENT_ID ="737803146083-f67j2eoco2m8apn2d8hcqr2eagug6f6q.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

 GITHUB_CLIENT_ID = "8093f815f78d3a8551ca";
 GITHUB_CLIENT_SECRET = "da37e696eb3d5ce8ea305deda9782a9a951c6181";

// FACEBOOK_APP_ID = "your id";
// FACEBOOK_APP_SECRET = "your id";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

 passport.use(
   new GithubStrategy(
     {
       clientID: GITHUB_CLIENT_ID,
       clientSecret: GITHUB_CLIENT_SECRET,
       callbackURL: "/auth/github/callback",
     },
     function (accessToken, refreshToken, profile, done) {
       done(null, profile);
     }
   )
 );

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: FACEBOOK_APP_ID,
//       clientSecret: FACEBOOK_APP_SECRET,
//       callbackURL: "/auth/facebook/callback",
//     },
//     function (accessToken, refreshToken, profile, done) {
//       done(null, profile);
//     }
//   )
// );

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
