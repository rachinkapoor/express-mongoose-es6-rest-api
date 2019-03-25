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
  return OstUser.getByAppUserId(user._id)
    .then(savedOstUser => {
      res.json(savedOstUser);
    })
    .catch(e => {
      return createUserInKit(user);
    })
    .then(savedOstUser => res.json(savedOstUser))
    .catch(e => next(e));
}

function createUserInKit(user) {
  //Make Kit Api Call.
  let createPromise;
  try {
    createPromise = ostSdk.services.users.create();
  } catch (e) {
    console.error("SDK Error in ostSdk.services.users.create");
    console.error(e);
    return Promise.reject(e);
  }

  return createPromise
    .then(apiResponse => {
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
        return Promise.reject(e);
      }
    })
    .catch(e => {
      console.error(
        "\n\n\nGot exception executing ostSdk.services.users.create"
      );
      console.error(e);
      console.error(JSON.stringify(e));
      return Promise.reject(e);
    });
}

/**
 * Update existing user
 * @returns {User}
 */
function update(req, res, next) {
  // console.log("\n\n\n|||");
  // console.log("Inside OstUser.update");
  const user = req.user;

  // console.log("\n\n\n|||");
  // console.log("OstUser.update: user : ", user);

  return OstUser.getByAppUserId(user._id)
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

            return ostUser.save().then(savedOstUser => {
              ostUser = savedOstUser;

              user.token_holder_address = ostUser.token_holder_address;
              return user.save().then(() => {
                res.json(ostUser);
              });
            });
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
