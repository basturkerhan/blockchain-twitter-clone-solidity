const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Twitter Contract", function () {
  let Twitter;
  let twitter;
  let owner;

  const NUM_TOTAL_NOT_MY_TWEETS = 5;
  const NUM_TOTAL_MY_TWEETS = 3;

  let totalTweets;
  let totalMyTweets;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    // owner = await ethers.getSigner();
    // addr1 = await ethers.getSigner();
    // addr2 = await ethers.getSigner();

    Twitter = await ethers.getContractFactory("TwitterContract");
    twitter = await Twitter.deploy();

    totalTweets = [];
    totalMyTweets = [];

    for (let i = 0; i < NUM_TOTAL_NOT_MY_TWEETS; i++) {
      let tweet = {
        tweetText: "Random text with id:- " + i,
        isDeleted: false,
        likeCount: 0,
        commentCount: 0,
        address: addr1.address
      };

      await twitter.connect(addr1).addTweet(tweet.tweetText, tweet.isDeleted);
      totalTweets.push(tweet);
    }

    for (let i = 0; i < NUM_TOTAL_MY_TWEETS; i++) {
      let tweet = {
        tweetText: "Random text with id:- " + (NUM_TOTAL_NOT_MY_TWEETS + i),
        isDeleted: false,
        likeCount: 0,
        commentCount: 0,
      };

      await twitter.connect(owner).addTweet(tweet.tweetText, tweet.isDeleted);
      totalTweets.push(tweet);
      totalMyTweets.push(tweet);
    }
  });

  // it("should pass", async function() {})

  describe("Add Tweet", function () {
    it("should emit AddTweet event", async function () {
      let tweet = {
        tweetText: "New Tweet",
        isDeleted: false,
        likeCount: 0,
        commentCount: 0,
      };

      await expect(
        await twitter.connect(owner).addTweet(tweet.tweetText, tweet.isDeleted)
      )
        .to.emit(twitter, "AddTweet")
        .withArgs(owner.address, NUM_TOTAL_NOT_MY_TWEETS + NUM_TOTAL_MY_TWEETS);
    });
  });

  describe("Get All Tweets", function () {
    it("should return the correct number of total tweets", async function () {
      const tweetsFromChain = await twitter.getAllTweets();
      expect(tweetsFromChain.length).to.equal(
        NUM_TOTAL_NOT_MY_TWEETS + NUM_TOTAL_MY_TWEETS
      );
    });

    it("should return the correct number of all my tweets", async function () {
      const myTweetsFromChain = await twitter.getUserTweets(owner.address);
      expect(myTweetsFromChain.length).to.equal(NUM_TOTAL_MY_TWEETS);
    });
  });

  describe("Delete Tweet", function () {
    it("should emit delete tweet event", async function () {
      const TWEET_ID = 0;
      const TWEET_DELETED = true;

      await expect(twitter.connect(addr1).deleteTweet(TWEET_ID, TWEET_DELETED))
        .to.emit(twitter, "DeleteTweet")
        .withArgs(TWEET_ID, TWEET_DELETED);
    });
  });

  describe("Like Tweet", function () {
    it("should emit like tweet event", async function () {
      const TWEET_ID = 0;

      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, true);
    });

    it("should emit delete like tweet event", async function () {
      const TWEET_ID = 0;

      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, true);

      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, false);
    });

    it("should emit like again tweet event", async function () {
      const TWEET_ID = 0;

      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, true);

      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, false);

      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, true);
    });

    it("get tweet likes", async function () {
      const TWEET_ID = 0;
      let LIKES = 0;
      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, true);
      LIKES++;

      const likesCount = await twitter.getLikesTweet(TWEET_ID);
      expect(likesCount.length).to.equal(LIKES);
    });

    it("get tweet likes with like=>delete event", async function () {
      const TWEET_ID = 0;
      let LIKES = 0;
      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, true);
      LIKES++;

      await expect(twitter.connect(addr1).changeLikeTweet(TWEET_ID))
        .to.emit(twitter, "LikeTweet")
        .withArgs(TWEET_ID, false);
      LIKES--;

      const likesCount = await twitter.getLikesTweet(TWEET_ID);
      expect(likesCount.length).to.equal(LIKES);
    });
  });

  describe("Comment tweet", async function () {
    it("should emit comment tweet event", async function () {
      const TWEET_ID = 0;
      const COMMENT = "This is a comment";

      await expect(twitter.connect(addr1).commentTweet(TWEET_ID, COMMENT))
        .to.emit(twitter, "CommentTweet")
        // .withArgs(TWEET_ID, COMMENT);
    });

    it("should return comments count", async function () {
      const TWEET_ID = 0;
      const COMMENT = "This is a comment";
      let COMMENTS = 0;
      await expect(twitter.connect(addr1).commentTweet(TWEET_ID, COMMENT))
        .to.emit(twitter, "CommentTweet")
        // .withArgs(TWEET_ID, COMMENT);
      COMMENTS++;

      const commentsCount = await twitter.getTweetComments(TWEET_ID);
      expect(commentsCount.length).to.equal(COMMENTS);
    });

    it("should delete comment", async function () {
      const TWEET_ID = 0;
      const COMMENT = "This is a comment";
      let COMMENTS = 0;
      await expect(twitter.connect(addr1).commentTweet(TWEET_ID, COMMENT))
        .to.emit(twitter, "CommentTweet")
        // .withArgs(TWEET_ID, COMMENT);
      COMMENTS++;

      await expect(
        twitter.connect(addr1).deleteComment(TWEET_ID, "comment-0-0")
      )
        .to.emit(twitter, "DeleteComment")
        .withArgs("comment-0-0", true);
      COMMENTS--;

      const commentsCount = await twitter.getTweetComments(TWEET_ID);
      expect(commentsCount.length).to.equal(COMMENTS);
    });

    it("cancel delete another persons comment", async () => {
      const TWEET_ID = 0;
      const COMMENT = "This is a comment";
      let COMMENTS = 0;
      await expect(twitter.connect(addr2).commentTweet(TWEET_ID, COMMENT))
        .to.emit(twitter, "CommentTweet")
        // .withArgs(TWEET_ID, COMMENT);
      COMMENTS++;

      await expect(
        twitter.connect(addr1).deleteComment(TWEET_ID, "comment-0-0")
      ).to.be.reverted;
    });
  });

  describe("User Profile", async () => {
    it("get users not setted profile", async function () {
      const profile = {
        username: "",
        name: "",
        bio: "",
      };
      const info = await twitter.getUser(addr1.address);
      expect(info.username).to.equal(profile.username);
      expect(info.name).to.equal(profile.name);
      expect(info.bio).to.equal(profile.bio);
    });

    it("update user profile", async function () {
      const profile = {
        username: "erhan",
        name: "baştürk",
        bio: "biography",
      };
      await twitter.connect(owner).uploadProfile(profile.username, profile.name, profile.bio);
      const info = await twitter.getUser(owner.address);
      expect(info.username).to.equal(profile.username);
      expect(info.name).to.equal(profile.name);
      expect(info.bio).to.equal(profile.bio);
    });

  });


});
