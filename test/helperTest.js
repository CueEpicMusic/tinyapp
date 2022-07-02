const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers.js");

const testUrlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "1j5y85",
  },
};

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it("should return undefined with an invalid email", function () {
    const user = getUserByEmail("user@invalid.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});

describe("urlsForUser", function () {
  it("should return a object with longURL and userID", function () {
    const finalObj = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedFinalObj = {b2xVn2: {
      longURL: "http://www.lighthouselabs.ca",
      userID: "aJ48lW",
    }};
    assert.deepEqual(finalObj, expectedFinalObj);
  });
  it("should return {} with an invalid userID", function () {
    const finalObj = urlsForUser("123456", testUrlDatabase);
    const expectedFinalObj = {};
    assert.deepEqual(finalObj, expectedFinalObj);
  });
});
