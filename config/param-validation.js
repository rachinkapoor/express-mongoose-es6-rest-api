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
        .max(300),
      create_ost_user: Joi.boolean()
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

  validateUser: {
    body: {
      username: Joi.string().required(),
      mobile_number: Joi.string()
        .regex(/^[1-9][0-9]{9}$/)
        .required()
    }
  },

  // POST /api/users/:userId/devices
  createUserDevice: {
    body: {
      address: Joi.string()
        .min(42)
        .max(42)
        .required(),
      api_signer_address: Joi.string()
        .min(42)
        .max(42)
        .required(),
      device_name: Joi.string()
        .min(1)
        .required(),
      device_uuid: Joi.string()
        .min(1)
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
