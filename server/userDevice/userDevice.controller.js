const UserDevice = require("./userDevice.model");
const ostSdk = require("../helpers/ostSdk");

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  const appUser = req.user;
  UserDevice.getByAddress(appUser._id, id)
    .then(userDevice => {
      req.userDevice = userDevice; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {UserDevice}
 */
function get(req, res) {
  return res.json(req.userDevice);
}

/**
 * Create new user device
 * @property {string} req.body.address - The address of wallet key of device.
 * @property {string} req.body.api_signer_address - The address api signer key of device.
 * @returns {User}
 */
function create(req, res, next) {
  const appUser = req.user;
  if (!appUser.ost_user_id) {
    let err = new Error("This user does not have an associated Ost User.");
    return next(err);
  }

  let deivceData = {
    user_id: appUser.ost_user_id,
    address: req.body.address,
    api_signer_address: req.body.api_signer_address,
    device_name: req.body.device_name,
    device_uuid: req.body.device_uuid
  };

  //Check if already exists
  UserDevice.getByAddress(appUser._id, deivceData.address)
    .then(savedUserDevice => res.json(savedUserDevice))
    .catch(() => {
      //Temp Code. To be removed - bug in API
      deivceData.personal_sign_address = deivceData.api_signer_address;

      //UserDevice does not exists. Lets register it.
      ostSdk.services.devices
        .create(Object.assign({}, deivceData))
        .then(apiResponse => {
          if (apiResponse.success && apiResponse.data.device) {
            deivceData = Object.assign({}, apiResponse.data.device, deivceData);

            //Add App UserId
            deivceData.app_user_id = appUser._id;

            const device = new UserDevice(deivceData);
            return device.save().then(savedUserDevice => {
              res.json(savedUserDevice);
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
        })
        .catch(e => next(e));
    });
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.user;
  let deivceData = {
    user_id: user.ost_user_id
  };
  ostSdk.services.devices
    .list(deivceData)
    .then(apiResponse => {
      if (apiResponse.success && apiResponse.data.devices) {
        let deviceAddresses = [];
        let ostDevices = apiResponse.data.devices;

        //Update staus.
        userDevice.status = deivceData.status;
        //Update updated_timestamp.
        userDevice.updated_timestamp = deivceData.updated_timestamp;
        return userDevice.save().then(savedUserDevice => {
          res.json(savedUserDevice);
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
    })
    .catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const user = req.user;
  const { appUserId = user._id, limit = 50, skip = 0 } = req.query;
  UserDevice.list({ appUserId, limit, skip })
    .then(userDevices => res.json(userDevices))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const userDevice = req.userDevice;
  userDevice
    .remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

module.exports = { load, get, create, update, list, remove };
