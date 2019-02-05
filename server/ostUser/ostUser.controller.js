const OstUser = require("./ostUser.model");
const bip39 = require("bip39");
const ostSdk = require("../helpers/ostSdk");

/**
 * Get user
 * @returns {OstUser}
 */
function get(req, res, next) {
  const user = req.user;
  OstUser.getByAppUserId(user._id)
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Create new user
 * @returns {OstUser}
 */
function create(req, res, next) {
  const user = req.user;
  OstUser.getByAppUserId(user._id)
    .then(savedUser => res.json(savedUser))
    .catch(() => {
      //Make Kit Api Call.
      ostSdk.services.users
        .create()
        .then(apiResponse => {
          if (apiResponse.success && apiResponse.data.user) {
            const ostUserData = Object.assign({}, apiResponse.data.user);
            //Set app_user_id & user_pin_salt
            ostUserData.app_user_id = user._id;
            ostUserData.user_pin_salt = bip39.generateMnemonic();

            //Temp Code. To be removed - bug in API
            ostUserData.user_id = ostUserData.user_id || ostUserData.userId;

            //Create new OstUser.
            const ostUser = new OstUser(ostUserData);
            return ostUser.save().then(savedUser => res.json(savedUser));
          } else {
            throw apiResponse;
          }
        })
        .catch(e => next(e));
    });
}

/**
 * Update existing user
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.user;
  OstUser.getByAppUserId(user._id)
    .then(ostUser => {
      //Make Kit Api Call.
      ostSdk.services.users.get({ id: ostUser.user_id }).then(apiResponse => {
        if (apiResponse.success && apiResponse.data.user) {
          const apiUser = apiResponse.data.user;
          //Update the ostUser.
          ostUser.token_holder_address = apiUser.token_holder_address;
          ostUser.device_manager_address = apiUser.device_manager_address;
          ostUser.status = apiUser.status;
          ostUser.updated_timestamp = apiUser.updated_timestamp;
          return ostUser.save().then(savedUser => res.json(savedUser));
        } else {
          throw apiResponse;
        }
      });
    })
    .catch(e => next(e));
}

module.exports = { create, update, get };
