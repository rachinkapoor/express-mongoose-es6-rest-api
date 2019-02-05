const mongoose = require("mongoose");
const request = require("supertest-as-promised");
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
  let ts = String(+Date.now());
  let mobile_number = ts.slice(0, mobile_number_len);

  let user = {
    username: "KK123" + String(ts),
    mobile_number: mobile_number
  };
  let ostUser;

  before(done => {
    request(app)
      .post("/api/users")
      .send(user)
      .expect(httpStatus.OK)
      .then(res => {
        expect(res.body.username).to.equal(user.username);
        expect(res.body.mobile_number).to.equal(user.mobile_number);
        user = res.body;
        done();
      })
      .catch(done);
  });

  describe("# POST /api/users/:userId/ost-users", () => {
    it("should create a new ost user", done => {
      request(app)
        .post(`/api/users/${user._id}/ost-users`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.app_user_id).to.equal(user._id);
          ostUser = res.body;
          done();
        })
        .catch(done);
    });

    it("should report error with message - Not found, when user does not exists", done => {
      request(app)
        .post("/api/users/56c787ccc67fc16ccc1a5e92/ost-users")
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal("Not Found");
          done();
        })
        .catch(done);
    });
  });

  describe("# GET /api/users/:userId/ost-users", () => {
    it("should get user details", done => {
      request(app)
        .get(`/api/users/${user._id}/ost-users`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.app_user_id).to.equal(user._id);
          done();
        })
        .catch(done);
    });

    it("should report error with message - Not found, when user does not exists", done => {
      request(app)
        .get("/api/users/56c787ccc67fc16ccc1a5e92/ost-users")
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal("Not Found");
          done();
        })
        .catch(done);
    });
  });

  describe("# PUT /api/users/:userId/ost-user", () => {
    it("should update user details", done => {
      request(app)
        .put(`/api/users/${user._id}/ost-users`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.app_user_id).to.equal(user._id);
          done();
        })
        .catch(done);
    });
  });
});
