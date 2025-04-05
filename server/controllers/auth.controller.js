/**
 *
 * @author Anass Ferrak aka " TheLordA " <ferrak.anass@gmail.com>
 * GitHub repo: https://github.com/TheLordA/Instagram-Clone
 *
 */

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// const sgMail = require("@sendgrid/mail");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require("../models/user.model");

// Sign Up Controller
exports.signup = (req, res) => {
  const { username, email, password } = req.body;

  // Verifying if any field is empty
  if (!username || !password || !email) {
    return res.status(400).json({ error: "Please submit all required fields" });
  }

  // Check if email or username already exists in the database
  User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(409).json({ error: "This Email or Username is already used!" });
      }

      // Hash password before saving it to the DB
      bcrypt.hash(password, 12).then((hashedPwd) => {
        const user = new User({
          username,
          email: email.toLowerCase(),
          password: hashedPwd,
        });

        // Save the new user
        user.save()
          .then(() => {
            // Optional: Send confirmation email (you can uncomment the code below)
            /*
            const email = {
              from: "no-reply@insta-clone.com",
              to: user.email,
              subject: "Your account has been created successfully",
              html: "<h1>Welcome to InstaClone</h1>",
            };
            sgMail.send(email);
            */
            res.status(201).json({ message: "User created successfully!" });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "Error saving user" });
          });
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "An error occurred while checking the user" });
    });
};

// Sign In Controller
exports.signin = (req, res) => {
  const { email, username, password } = req.body;

  // Ensure at least email/username and password are provided
  if ((!email && !username) || !password) {
    return res.status(400).json({ error: "Please provide email/username and password" });
  }

  // Check if email or username exists in the DB
  const query = email ? { email: email.toLowerCase() } : { username: username.toLowerCase() };

  User.findOne(query)
    .then((savedUser) => {
      if (!savedUser) {
        return res.status(400).json({ error: "Invalid email/username or password" });
      }

      // Compare password with hashed password in DB
      bcrypt.compare(password, savedUser.password).then((doMatch) => {
        if (doMatch) {
          // Generate JWT token
          const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

          // Send user info and token as response
          const { _id, username, email, followers, following, bookmarks } = savedUser;

          res.status(200).json({
            token,
            user: { _id, username, email, followers, following, bookmarks },
          });
        } else {
          return res.status(400).json({ error: "Invalid email/username or password" });
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "An error occurred while logging in" });
    });
};

// Reset Password Controller
exports.resetPwd = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to generate reset token" });
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email.toLowerCase() })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "No user exists with that email" });
        }

        user.ResetToken = token;
        user.ExpirationToken = Date.now() + 600000; // Token valid for 10 minutes
        user.save().then(() => {
          // Optional: Send reset password email (uncomment SendGrid integration below)
          /*
          const email = {
            from: "no-reply@insta-clone.com",
            to: user.email,
            subject: "Password Reset",
            html: `
              <p>A request has been made to change the password of your account.</p>
              <h5>Click on this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password</h5>
              <p>Or copy and paste the following link:</p>
              <h5>http://localhost:3000/reset/${token}</h5>
              <h5>The link is only valid for 10 minutes.</h5>
              <h5>If you weren't the sender of that request, you can just ignore this message.</h5>
            `,
          };
          sgMail.send(email);
          */
          res.status(200).json({ message: "Check your email inbox for the password reset link" });
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "An error occurred while processing password reset" });
      });
  });
};

// New Password Controller
exports.newPwd = (req, res) => {
  const { password, token } = req.body;

  User.findOne({ ResetToken: token, ExpirationToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Session expired! Try again with a new request" });
      }

      // Hash the new password and save
      bcrypt.hash(password, 12).then((hashedPwd) => {
        user.password = hashedPwd;
        user.ResetToken = undefined;
        user.ExpirationToken = undefined;
        user.save().then(() => {
          res.status(200).json({ message: "Password updated successfully" });
        });
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "An error occurred while updating the password" });
    });
};
