const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");

/**
 * User Schema
 */
const UserDeviceSchema = new mongoose.Schema({
  app_user_id: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
    unique: true
  },
  api_signer_address: {
    type: String,
    required: true,
    unique: true
  },
  device_name: {
    type: String,
    required: true
  },
  device_uuid: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  updated_timestamp: {
    type: String
  },
  createdAt: {
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
UserDeviceSchema.method({});

/**
 * Statics
 */
UserDeviceSchema.statics = {
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
        const err = new APIError(
          "No such user device exists (findById)!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * Get associated Ost User Device by address.
   * @param {address} deviceAddress - The address of user device wallet.
   * @returns {Promise<User, APIError>}
   */
  getByAddress(appUserId, deviceAddress) {
    return this.findOne({ address: deviceAddress, app_user_id: appUserId })
      .exec()
      .then(userData => {
        if (userData) {
          return userData;
        }
        const err = new APIError(
          "No such user device exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ appUserId, skip = 0, limit = 50 } = {}) {
    return this.find({ app_user_id: appUserId })
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }

  // bulkUpdate({appUserId, ostDevices} = {}) {
  //   let bulkOperation = this.collection.initializeUnorderedBulkOp();
  //   let len = ostDevices.length;
  //   while( len-- ) {
  //     let currOstDevice = ostDevices[len];
  //     bulkOperation.find({app_user_id: user._id, })
  //   }

  // }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("UserDevice", UserDeviceSchema);
