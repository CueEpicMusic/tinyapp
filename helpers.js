const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let finalObj = {};
  for (const shortUrl in database) {
    if (id === database[shortUrl].userID) {
      finalObj[shortUrl] = database[shortUrl];
    }
  }
  return finalObj;
};

const generateRandomString = () => {
  let r = Math.random().toString(36).substring(2, 8);
  return r;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
};
