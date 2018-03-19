const path = require("path");
const fs = require("fs");

const pointsFile = path.join(__dirname, "points.json");

class Points {
  constructor() {
    this.points = {};
  }

  initPointsData() {
    if (fs.existsSync(pointsFile)) {
      this.fetchPointsData();
    } else {
      this.savePointsData();
    }
  }

  fetchPointsData() {
    try {
      const pointsString = fs.readFileSync(pointsFile);
      console.log("loading initial points data.");
      this.points = JSON.parse(pointsString);
      return this.points;
    } catch (err) {
      return {};
    }
  }

  savePointsData() {
    try {
      console.log("saving data to file.");
      fs.writeFileSync(pointsFile, JSON.stringify(this.points));
      return;
    } catch (e) {
      console.log(e);
    }
  }

  getUserIndex(username) {
    const userIndex = this.points.users.findIndex(user => user.username === username);
    if (userIndex > -1) {
      return userIndex;
    }

    return false;
  }

  fetchUserData(username) {
    const userindex = this.points.users.findIndex(user => user.username === username);
    if (userindex > -1) {
      return this.points.users[userindex];
    }
    return false;
  }

  addPoints(usernameSender, usernameReceiver) {
    return new Promise((resolve, reject) => {
      let newPoints = {
        sent: 0,
        received: 0
      };

      //handle sender
      let sender = this.fetchUserData(usernameSender);
      if (sender) {
        console.log("sent points before update:", this.points.users[this.getUserIndex(usernameSender)].sent);
        const newSentPoints = ++this.points.users[this.getUserIndex(usernameSender)].sent;
        newPoints.sent = newSentPoints;
        console.log("newSentPoints:", newSentPoints);
      } else {
        sender = {
          username: usernameSender,
          sent: 1,
          received: 0
        };
        this.points.users.push(sender);
        newPoints.sent = 1;
      }

      //handle receiver
      let receiver = this.fetchUserData(usernameReceiver);
      if (receiver) {
        console.log("receive points before update:", this.points.users[this.getUserIndex(usernameReceiver)].received);
        const newRecPoints = ++this.points.users[this.getUserIndex(usernameReceiver)].received;
        console.log("newRecPoints:", newRecPoints);
        newPoints.received = newRecPoints;
      } else if (usernameSender !== usernameReceiver) {
        receiver = {
          username: usernameReceiver,
          sent: 0,
          received: 1
        };
        this.points.users.push(receiver);
        newPoints.received = 1;
      }

      //fs.writeFileSync(pointsFile, JSON.stringify(this.points));
      this.savePointsData();

      resolve(newPoints);
    });
  }

  formatUsername(rawName) {
    if (typeof rawName === "string") {
      let formattedName = rawName;
      if (!formattedName.startsWith("u/")) {
        formattedName = "u/" + formattedName;
      }
      return formattedName;
    }

    return false;
  }
}

module.exports = Points;
