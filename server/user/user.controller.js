const User = require("./user.model");
const ostUserCntrl = require("../ostUser/ostUser.controller");
/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then(user => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.user);
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobile_number - The mobileNumber of user.
 * @property {string} req.body.description - User description.
 * @returns {User}
 */
function create(req, res, next) {
  let userName = req.body.username;
  userDisplayName = userName.replace(/\s/g, "");
  userName = userDisplayName.toLowerCase();

  const user = new User({
    username: userName,
    user_display_name: userDisplayName,
    mobile_number: req.body.mobile_number,
    description: req.body.description || ""
  });

  user
    .save()
    .then(savedUser => {
      if (req.body.create_ost_user) {
        req.user = savedUser;
        return ostUserCntrl.create(req, res, next);
      } else {
        return res.json(savedUser);
      }
    })
    .catch(e => next(e));
}

/**
 * Validate user infor
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobile_number - The mobileNumber of user.
 * @returns {User}
 */

function validateUser(req, res, next) {
  let userName = req.body.username;
  userName = userName.replace(/\s/g, "");
  userName = userName.toLowerCase();

  User.getByUsernameAndMobileNumber(userName, req.body.mobile_number)
    .then(user => {
      req.user = user;
      if (user.ost_user_id != null && user.token_holder_address == null) {
        return ostUserCntrl.update(req, res, next);
      } else if (user.ost_user_id != null) {
        return ostUserCntrl.get(req, res, next);
      } else {
        //Just create the ost-user.
        return ostUserCntrl.create(req, res, next);
      }
    })
    .catch(e => next(e));
}

/**
 * Update existing user
 * @property {string} req.body.description - User description.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.user;
  user.description = req.body.description;

  user
    .save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @property {string} req.query.th - Filter by token holder addresses.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0, th = "", un = "" } = req.query;
  User.list({ limit, skip, th, un })
    .then(users => {
      return res.json({
        success: true,
        result_type: "users",
        users: users
      });
    })
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.user;
  user
    .remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

module.exports = { load, get, create, validateUser, update, list, remove };
