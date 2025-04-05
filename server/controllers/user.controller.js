/**
 *
 * @author Anass Ferrak aka " TheLordA " <ferrak.anass@gmail.com>
 * GitHub repo: https://github.com/TheLordA/Instagram-Clone
 *
 */
const Post = require("../models/post.model");
const User = require("../models/user.model");

exports.user = (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-Password")
    .then((user) => {
      Post.find({ PostedBy: req.params.id })
        .populate("PostedBy", "_id Name")
        .exec((err, result) => {
          if (err) return res.status(422).json({ error: "Error fetching posts" });

          const posts = result.map((item) => ({
            _id: item._id,
            Title: item.Title,
            Body: item.Body,
            Photo: item.Photo.toString("base64"),
            PhotoType: item.PhotoType,
            Likes: item.Likes,
            Comments: item.Comments,
            Followers: item.Followers,
            Following: item.Following,
          }));

          res.json({ user, posts });
        });
    })
    .catch((err) => {
      return res.status(404).json({ Error: "User not found" });
    });
};

exports.follow = (req, res) => {
  const { followId } = req.body;

  User.findByIdAndUpdate(
    followId,
    {
      $push: { Followers: req.user._id },
    },
    { new: true }
  )
    .then((result) => {
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { Following: followId },
        },
        { new: true }
      )
        .select("-Password")
        .then((userResult) => {
          res.json(userResult);
        })
        .catch((err) => {
          return res.status(422).json({ error: err.message });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err.message });
    });
};

exports.unfollow = (req, res) => {
  const { unfollowId } = req.body;

  User.findByIdAndUpdate(
    unfollowId,
    {
      $pull: { Followers: req.user._id },
    },
    { new: true }
  )
    .then((result) => {
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { Following: unfollowId },
        },
        { new: true }
      )
        .select("-Password")
        .then((userResult) => {
          res.json(userResult);
        })
        .catch((err) => {
          return res.status(422).json({ error: err.message });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err.message });
    });
};

exports.bookmarks = (req, res) => {
  User.findById(req.user._id)
    .select("-Password")
    .then((user) => {
      const data = user.Bookmarks;
      Post.find({ _id: { $in: data } })
        .populate("PostedBy", "_id Name")
        .then((result) => {
          const bookmark = result.map((item) => ({
            _id: item._id,
            PostedBy: item.PostedBy,
            Title: item.Title,
            Body: item.Body,
            Photo: item.Photo.toString("base64"),
            PhotoType: item.PhotoType,
            Likes: item.Likes,
            Comments: item.Comments,
          }));

          res.json({ bookmark });
        })
        .catch((err) => {
          return res.status(422).json({ error: "Error fetching bookmarks" });
        });
    })
    .catch((err) => {
      return res.status(404).json({ Error: "User not found" });
    });
};

exports.bookmarkPost = (req, res) => {
  const { postId } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { Bookmarks: postId },
    },
    { new: true }
  )
    .select("-Password")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return res.status(422).json({ error: "Error adding bookmark" });
    });
};

exports.removeBookmark = (req, res) => {
  const { postId } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { Bookmarks: postId },
    },
    { new: true }
  )
    .select("-Password")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return res.status(422).json({ error: "Error removing bookmark" });
    });
};

exports.updatePicture = (req, res) => {
  const { Photo, PhotoType } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { $set: { Photo, PhotoType } },
    { new: true }
  )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return res.status(422).json({ error: "Error updating profile picture" });
    });
};

exports.userSearch = (req, res) => {
  const { pattern } = req.body;
  const regexPattern = new RegExp("^" + pattern, "i");

  User.find({ Email: { $regex: regexPattern } })
    .select("_id Email Name")
    .then((user) => {
      res.json({ user });
    })
    .catch((err) => {
      console.error("Error in user search:", err);
      res.status(500).json({ error: "Error searching users" });
    });
};
