import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import nunjucks from "nunjucks";
import { error } from "console";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app
});
app.set("view engine", "njk");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "supersecret123",
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.get("/", (req, res) => {
  if (req.session.user) {
    res.send(`
      <div id="login-container">
        <p>Welcome, ${req.session.user}!</p>
        <button hx-post="/logout" hx-target="#login-container" hx-swap="outerHTML">Logout</button>
      </div>
    `);
  } else {
    res.sendFile(path.join(__dirname, "public/index.html"));
  }
});


app.get("/login", (req, res) => {

  res.render("auth/login.njk");
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple example — replace this with your real authentication
  if (username === "admin" && password === "1234") {
    req.session.user = username;
    res.send(`
      <div id="login-container">
        <p>Welcome, ${username}!</p>
        <button hx-post="/logout" hx-target="#login-container" hx-swap="outerHTML">Logout</button>
      </div>
    `);
  } else {
    res.render("auth/login.njk", { error: "Incorrect email or password" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
      res.render("auth/login.njk");
  });
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
