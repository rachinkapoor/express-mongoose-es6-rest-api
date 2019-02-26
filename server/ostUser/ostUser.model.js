const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");

/**
 * User Schema
 */
const OstUserSchema = new mongoose.Schema({
  app_user_id: {
    type: String,
    required: true,
    unique: true
  },
  user_pin_salt: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  token_id: {
    type: String,
    required: true
  },
  token_holder_address: {
    type: String
  },
  device_manager_address: {
    type: String
  },
  status: {
    type: String
  },
  updated_timestamp: {
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
OstUserSchema.method({});

/**
 * Statics
 */
OstUserSchema.statics = {
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
   * Get associated Ost User Data by user_id
   * @param {ObjectId} userId - The user_id of user (as provided by OST).
   * @returns {Promise<User, APIError>}
   */
  getByUserId(userId) {
    return this.findOne({ user_id: userId })
      .exec()
      .then(userData => {
        if (userData) {
          return userData;
        }
        const err = new APIError("No such user exists!", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get associated Ost User Data by app_user_id
   * @param {app_user_id} appUserId - The app_user_id of user. (As in user collection).
   * @returns {Promise<User, APIError>}
   */
  getByAppUserId(appUserId) {
    return this.findOne({ app_user_id: appUserId })
      .exec()
      .then(userData => {
        if (userData) {
          return userData;
        }
        const err = new APIError("No such user exists!", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("OstUser", OstUserSchema);
