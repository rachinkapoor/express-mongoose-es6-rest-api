const mongoose = require("mongoose");
const request = require("supertest");
const httpStatus = require("http-status");
const chai = require("chai"); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require("../../index");

chai.config.includeStack = true;

/**
 * root level hooks
 */
after(done => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe("## User APIs", () => {
  const mobile_number_len = 10;
  let ts = "98" + String(2 + Date.now());
  let mobile_number = ts.slice(0, mobile_number_len);

  let user = {
    username: "UserTest" + String(ts),
    mobile_number: mobile_number,
    description: "Hello, I am using apps powered by OST."
  };

  console.info("user", user);

  describe("# POST /api/users", () => {
    it("should create a new user", done => {
      request(app)
        .post("/api/users")
        .send(user)
        .expect(httpStatus.OK)
        .then(res => {
          console.info("res", res.body);
          expect(res.body.username).to.equal(user.username);
          expect(res.body.mobile_number).to.equal(user.mobile_number);
          expect(res.body.description).to.equal(user.description);
          user = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe("# POST /api/users/validate", () => {
    it("should validate existing user", done => {
      request(app)
        .post("/api/users/validate")
        .send({
          username: user.username,
          mobile_number: user.mobile_number
        })
        .expect(httpStatus.OK)
        .then(res => {
          console.info("res", res.body);
          expect(res.body.username).to.equal(user.username);
          expect(res.body.mobile_number).to.equal(user.mobile_number);
          expect(res.body.description).to.equal(user.description);
          user = res.body;
          done();
        })
        .catch(done);
    });

    it("should report error with message - Not found, when username is invalid", done => {
      request(app)
        .post("/api/users/validate")
        .send({
          username: "NOT_VALID_" + user.username,
          mobile_number: user.mobile_number
        })
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal("Not Found");
          done();
        })
        .catch(done);
    });
  });

  describe("# GET /api/users/:userId", () => {
    it("should get user details", done => {
      request(app)
        .get(`/api/users/${user._id}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.username).to.equal(user.username);
          expect(res.body.mobile_number).to.equal(user.mobile_number);
          expect(res.body.description).to.equal(user.description);
          done();
        })
        .catch(done);
    });

    it("should report error with message - Not found, when user does not exists", done => {
      request(app)
        .get("/api/users/56c787ccc67fc16ccc1a5e92")
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal("Not Found");
          done();
        })
        .catch(done);
    });
  });

  describe("# PUT /api/users/:userId", () => {
    it("should update user details", done => {
      user.description =
        "Hello, I am using apps powered by OST. Checkout https://ost.com!";
      request(app)
        .put(`/api/users/${user._id}`)
        .send(user)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.username).to.equal(user.username);
          expect(res.body.mobile_number).to.equal(user.mobile_number);
          expect(res.body.description).to.equal(user.description);
          done();
        })
        .catch(done);
    });
  });

  describe("# GET /api/users/", () => {
    it("should get all users", done => {
      request(app)
        .get("/api/users")
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.users).to.be.an("array");
          done();
        })
        .catch(done);
    });

    it("should get all users (with limit and skip)", done => {
      request(app)
        .get("/api/users")
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.users).to.be.an("array");
          done();
        })
        .catch(done);
    });
  });

  describe("# DELETE /api/users/", () => {
    it("should delete user", done => {
      request(app)
        .delete(`/api/users/${user._id}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.username).to.equal(user.username);
          expect(res.body.mobile_number).to.equal(user.mobile_number);
          expect(res.body.description).to.equal(user.description);
          done();
        })
        .catch(done);
    });
  });
});
