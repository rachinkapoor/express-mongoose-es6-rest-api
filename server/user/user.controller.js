const User = require("./user.model");

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
  const user = new User({
    username: req.body.username,
    mobile_number: req.body.mobile_number,
    description: req.body.description || ""
  });

  user
    .save()
    .then(savedUser => {
      if (req.body.create_ost_user) {
        req.user = savedUser;
        const ostUserCntrl = require("../ostUser/ostUser.controller");
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
  User.getByUsernameAndMobileNumber(req.body.username, req.body.mobile_number)
    .then(user => res.json(user))
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
  const { limit = 50, skip = 0, th = "" } = req.query;
  User.list({ limit, skip, th })
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
