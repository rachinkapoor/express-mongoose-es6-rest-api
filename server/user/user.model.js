const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  mobile_number: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[1-9][0-9]{9}$/,
      "The value of path {PATH} ({VALUE}) is not a valid mobile number."
    ]
  },
  description: {
    type: String
  },
  token_holder_address: {
    type: String
  },
  ost_user_id: {
    type: String
  },
  ost_user_internal_id: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
UserSchema.method({});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then(user => {
        if (user) {
          return user;
        }
        const err = new APIError("No such user exists!", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get user by username & mobile number.
   * @property {string} username - The username of user.
   * @property {string} mobile_number - The mobile number of user.
   * @returns {Promise<User, APIError>}
   */
  getByUsernameAndMobileNumber(username, mobile_number) {
    return this.findOne({ username: username, mobile_number: mobile_number })
      .exec()
      .then(userData => {
        if (userData) {
          return userData;
        }
        const err = new APIError("Invalid User Details", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50, th = "" } = {}) {
    let findQ;
    if (th) {
      findQ = this.find({
        token_holder_address: {
          $in: th
        }
      });
    } else {
      findQ = this.find();
    }
    return findQ
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("User", UserSchema);
