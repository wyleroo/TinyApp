module.exports = {
  // Verify email
  emailSearch(emailIn) {
    for (id in users) {
      if (users[id].email == emailIn){
        return true;
      }
    }
    return false;
  },

  // Function to return user id based on email match
  loginReturn(loginEmail) {
    for (key in users) {
      if (users[key].email == loginEmail){
        return users[key].id;
      }
    }
    return null;
  },

  // Function to filter URLDatabase for permitted sites
  urlsForUser(idRequest) {
    let urlUser = {};
    for (key in urlDatabase) {
      if (urlDatabase[key].userPermission == idRequest) {
        urlUser[key] = urlDatabase[key].site;
      }
    }
    return urlUser;
  },

  // Random string generator - to be set as randomShorty
  generateRandomString() {
    var output = '';
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 6; i++) {
      output += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return output;
  }
}