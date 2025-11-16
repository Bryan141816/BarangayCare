const browserSync = require('browser-sync').create();

// Proxy your existing Node.js server
browserSync.init({
  proxy: "http://localhost:3000", // your Express server
  files: ["public/**/*", "views/**/*.njk"], // files to watch for reload
  port: 4000, // BrowserSync UI port
  open: true, // automatically open browser
  notify: false
});
