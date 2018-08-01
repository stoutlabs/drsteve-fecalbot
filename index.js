require("dotenv").config();

const path = require("path");
const fs = require("fs");
const emoji = require("node-emoji");
const Snoowrap = require("snoowrap");
const Snoostorm = require("snoostorm");

//load up the points tracking stuff
const Points = require("./utils/Points.js");
const points = new Points();
points.initPointsData(); // sets points.points initial data

// Build Snoowrap and Snoostorm clients
const r = new Snoowrap({
  userAgent: "node:drsteve-fecalbot:v1.0.1",
  clientId: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  username: process.env.FB_REDDIT_USER,
  password: process.env.FB_REDDIT_PASS
});
const client = new Snoostorm(r);

const streamOpts = {
  subreddit: process.env.FB_SUBREDDIT,
  results: 25,
  pollTime: 15000
};

// Create a Snoostorm CommentStream with the specified options
const comments = client.CommentStream(streamOpts);

comments.on("comment", comment => {
  //console.log(comment);
  // if(comment.author.name === "dr_steve")
  if (
    (comment.author.name === "drsteve103" || comment.author.name === "eyecache") &&
    comment.body.toLowerCase().startsWith("!reddit")
  ) {
    const author = points.formatUsername(comment.author.name);
    const commentArr = comment.body.split(" ");

    let giftType = commentArr[0].replace(/!reddit/i, "");
    if (giftType !== "") {
      giftType = giftType.charAt(0).toUpperCase() + giftType.slice(1);
      giftType = giftType.replace(/(\\_)|(\\-)|(\\ )/gi, " ");
    } else {
      giftType = "Feces";
    }

    const poop = emoji.emojify(":poop:");
    let message = `> ##### Here's your Reddit ${giftType}, `;

    r.getComment(comment.parent_id)
      .fetch()
      .then(parentcomment => {
        goesTo = points.formatUsername(parentcomment.author.name);
        points
          .addPoints(author, goesTo)
          .then(newPoints => {
            const senderData = points.fetchUserData(author);
            const receiverData = points.fetchUserData(goesTo);
            message += `${goesTo}! ${poop} \n\n > You have received (${
              newPoints.received
            }) in total, and ${author} has sent out (${newPoints.sent}) in total.`;

            parentcomment.reply(message);
            //console.log(message);
          })
          .catch(e => {
            console.log(e);
          });

        return;
      })
      .catch(e => {
        console.log(e);
      });
  }
});
