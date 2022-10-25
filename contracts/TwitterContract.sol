// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/utils/Strings.sol";

contract TwitterContract {
    event AddTweet(address recipient, uint tweetId);
    event DeleteTweet(uint tweetId, bool isDeleted);
    event LikeTweet(uint tweetId, bool likeStatus);
    event CommentTweet(uint tweetId, string comment, string commentId);
    event DeleteComment(string tweetId, bool isDeleted);
    event UploadProfile(string username, string name, string bio);

    struct User {
        string username;
        string name;
        string bio;
    }

    struct Tweet {
        uint id;
        address username;
        string tweetText;
        bool isDeleted;
        uint likeCount;
        uint commentCount;
    } // Tweet struct yapısı

    struct Comment {
        string id;
        address commentOwner;
        string commentText;
        bool isDeleted;
    }

    struct Like {
        address likeOwner;
        bool isLiked;
    }

    Tweet[] private tweets; // tüm tweetlerin tutulduğu array
    mapping(uint => address) tweetToOwner; // hangi twitin sahibi hangi cüzdan eşleşmesini tutan mapping
    mapping(uint => Like[]) likes; // tweet beğenilerini tutan mapping
    mapping(uint => Comment[]) comments; // tweet yorumlarını tutan mapping
    mapping(address => User) users; // kullanıcıların bilgilerini tutan mapping



    // Tweet atma fonksiyonu
    function addTweet(string memory tweetText, bool isDeleted) external {
        uint tweetId = tweets.length;
        tweets.push(Tweet(tweetId, msg.sender, tweetText, isDeleted, 0, 0)); // msg.sender = cüzdan adresi
        tweetToOwner[tweetId] = msg.sender;
        emit AddTweet(msg.sender, tweetId);
    }

    function getUser(address userAddress) external view returns(User memory) {
        if(keccak256(abi.encodePacked((users[userAddress].username))) == keccak256(abi.encodePacked(("0")))) {
            return User("a","b","c");
        }
        return users[userAddress];
    }

    // Tweet silme fonksiyonu
    function deleteTweet(uint tweetId, bool isDeleted) external {
        require(
            tweetToOwner[tweetId] == msg.sender,
            "You are not the owner of this tweet!"
        );
        tweets[tweetId].isDeleted = isDeleted;
        emit DeleteTweet(tweetId, isDeleted);
    }

    function uploadProfile(string memory username, string memory name, string memory bio) external {
        users[msg.sender] = User(username, name, bio);
        emit UploadProfile(username, name, bio);
    }

    function changeLikeTweet(uint tweetId) external {
        bool isAlreadyRegistered = false;
        for (uint i = 0; i < likes[tweetId].length; i++) {
            if (likes[tweetId][i].likeOwner == msg.sender) {
                isAlreadyRegistered = true;
                if(likes[tweetId][i].isLiked) {
                    likes[tweetId][i].isLiked = false;
                    emit LikeTweet(tweetId, false);
                    tweets[tweetId].likeCount--;
                }
                else {
                    likes[tweetId][i].isLiked = true;
                    emit LikeTweet(tweetId, true);
                    tweets[tweetId].likeCount++;
                }
            }
        }
        if (isAlreadyRegistered == false) {
            tweets[tweetId].likeCount++;
            likes[tweetId].push(Like(msg.sender, true));
            emit LikeTweet(tweetId, true);
        }
    }

    function commentTweet(uint tweetId, string memory commentText) external {
        string memory commentId = string.concat(
            "comment-",
            Strings.toString(tweetId),
            "-",
            Strings.toString(comments[tweetId].length)
        );
        comments[tweetId].push(
            Comment(commentId, msg.sender, commentText, false)
        );
        tweets[tweetId].commentCount++;
        emit CommentTweet(tweetId, commentText, commentId);
    }

    function deleteComment(uint tweetId, string calldata commentId) external {
        for (uint i = 0; i < comments[tweetId].length; i++) {
            if (
                keccak256(abi.encodePacked(comments[tweetId][i].id)) ==
                keccak256(abi.encodePacked(commentId))
            ) {
                if (comments[tweetId][i].commentOwner != msg.sender) {
                    revert("You are not the owner of this comment!");
                }
                comments[tweetId][i].isDeleted = true;
                tweets[tweetId].commentCount--;
                emit DeleteComment(
                    comments[tweetId][i].id,
                    comments[tweetId][i].isDeleted
                );
            }
        }
    }

    // Tüm tweetleri getirmek için fonksiyon
    function getAllTweets() external view returns (Tweet[] memory) {
        Tweet[] memory temporary = new Tweet[](tweets.length);
        uint counter = 0;
        for (uint i = 0; i < tweets.length; i++) {
            if (tweets[i].isDeleted == false) {
                temporary[counter] = tweets[i];
                counter++;
            }
        }

        Tweet[] memory result = new Tweet[](counter);
        for (uint i = 0; i < counter; i++) {
            result[i] = temporary[i];
        }
        return result;
    }

    // Kendi tweetlerini getirme fonksiyonu
    function getUserTweets(address userAddress) external view returns (Tweet[] memory) {
        Tweet[] memory temporary = new Tweet[](tweets.length);
        uint counter = 0;
        for (uint i = 0; i < tweets.length; i++) {
            if (tweetToOwner[i] == userAddress && tweets[i].isDeleted == false) {
                temporary[counter] = tweets[i];
                counter++;
            }
        }

        Tweet[] memory result = new Tweet[](counter);
        for (uint i = 0; i < counter; i++) {
            result[i] = temporary[i];
        }
        return result;
    }

    function getLikesTweet(uint tweetId) external view returns (Like[] memory) {
        Like[] memory temporary = new Like[](likes[tweetId].length);
        uint counter = 0;
        for (uint i = 0; i < likes[tweetId].length; i++) {
            if (likes[tweetId][i].isLiked == true) {
                temporary[counter] = likes[tweetId][i];
                counter++;
            }
        }

        Like[] memory result = new Like[](counter);
        for (uint i = 0; i < counter; i++) {
            result[i] = temporary[i];
        }
        return result;
    }

    function getTweetComments(uint tweetId)
        external
        view
        returns (Comment[] memory)
    {
        Comment[] memory temporary = new Comment[](comments[tweetId].length);
        uint counter = 0;
        for (uint i = 0; i < comments[tweetId].length; i++) {
            if (comments[tweetId][i].isDeleted == false) {
                temporary[counter] = comments[tweetId][i];
                counter++;
            }
        }

        Comment[] memory result = new Comment[](counter);
        for (uint i = 0; i < counter; i++) {
            result[i] = temporary[i];
        }
        return result;
    }
}
