const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//View engine
app.set("view engine", "ejs");

//Helper function
const generateRandomString = () => {
  let r = Math.random().toString(36).substring(2, 8);
  return r;
};

const urlsForUser = (id) => {
  let finalObj = {};
  for (const shortUrl in urlDatabase) {
    if (id === urlDatabase[shortUrl].userID) {
      finalObj[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return finalObj;
};

//Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Get
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("login", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let userId = req.cookies.user_id;
  if (users[userId]) {
    let finalObj = urlsForUser(userId)
    const templateVars = {
      user: users[userId],
      urls: finalObj,
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  if (users[req.cookies.user_id]) {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (users[req.cookies.user_id] === urlDatabase[req.params.shortURL].userID) {
    const templateVars = {
      user: users[req.cookies.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send("No longURL associated with that shortURL!");
  } else {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
});

//Post
app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  if (foundUser) {
    return res.status(403).send("A user with that email already exists!");
  }

  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;

  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  if (!foundUser) {
    return res.status(403).send("No user with that email found!");
  }

  if (foundUser.password !== password) {
    return res.status(403).send("Incorrect password!");
  }
  res.cookie("user_id", foundUser.id);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies.user_id] === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    return res.status(403).send("You do not have permission to delete!");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (users[req.cookies.user_id] === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    return res.status(403).send("You do not have permission to update!");
  }
});
