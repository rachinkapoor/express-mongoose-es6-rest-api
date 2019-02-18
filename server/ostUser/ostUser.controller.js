const OstUser = require("./ostUser.model");
const bip39 = require("bip39");
const ostSdk = require("../helpers/ostSdk");
const APIError = require("../helpers/APIError");
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
    .then(savedOstUser => res.json(savedOstUser))
    .catch(() => {
      return createUserInKit(user);
    })
    .then(savedOstUser => res.json(savedOstUser))
    .catch(e => next(e));
}

function createUserInKit(user) {
  //Make Kit Api Call.
  return ostSdk.services.users.create().then(apiResponse => {
    if (apiResponse.success && apiResponse.data.user) {
      let ostUserData = Object.assign({}, apiResponse.data.user);
      //Set app_user_id & user_pin_salt
      ostUserData.app_user_id = user._id;
      ostUserData.user_id = ostUserData.id;
      ostUserData.user_pin_salt = bip39.generateMnemonic();

      //Create new OstUser.
      let ostUser = new OstUser(ostUserData);
      let savedOstUser;
      return ostUser.save().then(ostUserData => {
        savedOstUser = ostUserData;
        user.ost_user_id = savedOstUser.user_id;
        user.ost_user_internal_id = savedOstUser._id;
        console.log("\n\n\n", "User", user, "\n\n\n");
        return user.save().then(savedUser => {
          return savedOstUser;
        });
      });
    } else {
      let err;
      if (apiResponse.err) {
        err = new Error(JSON.stringify(apiResponse.err));
      } else {
        err = new Error(JSON.stringify(apiResponse));
      }
      throw err;
    }
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
      ostSdk.services.users
        .get({ id: ostUser.user_id })
        .then(apiResponse => {
          if (apiResponse.success && apiResponse.data.user) {
            const apiUser = apiResponse.data.user;
            //Update the ostUser.
            ostUser.token_holder_address = apiUser.token_holder_address;
            ostUser.device_manager_address = apiUser.device_manager_address;
            ostUser.status = apiUser.status;
            ostUser.updated_timestamp = apiUser.updated_timestamp;
            return ostUser.save().then(savedUser => res.json(savedUser));
          } else {
            let err;
            if (apiResponse.err) {
              err = new APIError(JSON.stringify(apiResponse.err), null, true);
            } else {
              err = new APIError(JSON.stringify(apiResponse), null, true);
            }
            throw err;
          }
        })
        .catch(apiResponse => {
          let err;
          if (apiResponse.err) {
            err = new APIError(JSON.stringify(apiResponse.err), null, true);
          } else {
            err = apiResponse;
          }

          throw err;
        });
    })
    .catch(e => next(e));
}

module.exports = { create, update, get };
