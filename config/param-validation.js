const Joi = require("joi");

module.exports = {
  // POST /api/users
  createUser: {
    body: {
      username: Joi.string().required(),
      mobile_number: Joi.string()
        .regex(/^[1-9][0-9]{9}$/)
        .required(),
      description: Joi.string()
        .min(3)
        .max(300)
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      description: Joi.string()
        .min(3)
        .max(300)
    },
    params: {
      userId: Joi.string()
        .hex()
        .required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
