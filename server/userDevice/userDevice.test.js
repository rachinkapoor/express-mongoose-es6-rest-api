const mongoose = require("mongoose");
const request = require("supertest");
const httpStatus = require("http-status");
const chai = require("chai"); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const assert = chai.assert;
const app = require("../../index");
const hdkey = require("ethereumjs-wallet/hdkey");
const bip39 = require("bip39");
const uuidv4 = require("uuid/v4");

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

describe("## UserDevice APIs", () => {
  const mobile_number_len = 10;
  let ts = "7" + String(3 + Date.now());
  let mobile_number = ts.slice(0, mobile_number_len);

  let user = {
    username: "UserDeviceTest" + String(ts),
    mobile_number: mobile_number
  };

  const walletMnemonic = bip39.generateMnemonic(),
    walletHexSeed = bip39.mnemonicToSeedHex(walletMnemonic),
    walletHdKey = hdkey.fromMasterSeed(walletHexSeed),
    walletAddress = walletHdKey.getWallet().getChecksumAddressString();
  const apiSignerMnemonic = bip39.generateMnemonic(),
    apiSignerHexSeed = bip39.mnemonicToSeedHex(apiSignerMnemonic);
  (apiSignerHdKey = hdkey.fromMasterSeed(apiSignerHexSeed)),
    (apiSignerAddress = apiSignerHdKey.getWallet().getChecksumAddressString());

  let device = {
    address: walletAddress,
    api_signer_address: apiSignerAddress,
    device_name: "Test-Device - " + String(ts),
    device_uuid: uuidv4()
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

        //Create ostUser
        return request(app)
          .post(`/api/users/${user._id}/ost-users`)
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.app_user_id).to.equal(user._id);
            ostUser = res.body;
            done();
          });
      })
      .catch(done);
  });

  describe("# POST /api/users/:userId/devices", () => {
    it("should create a new user", done => {
      request(app)
        .post(`/api/users/${user._id}/devices`)
        .send(device)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.address.toLowerCase()).to.equal(
            device.address.toLowerCase()
          );
          expect(res.body.api_signer_address.toLowerCase()).to.equal(
            device.api_signer_address.toLowerCase()
          );
          device = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe("# GET /api/users/:userId/devices/:deviceAddress", () => {
    it("should get user device details", done => {
      request(app)
        .get(`/api/users/${user._id}/devices/${device.address}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.address.toLowerCase()).to.equal(
            device.address.toLowerCase()
          );
          expect(res.body.api_signer_address.toLowerCase()).to.equal(
            device.api_signer_address.toLowerCase()
          );
          done();
        })
        .catch(done);
    });

    it("should report error with message - Not found, when user does not exists", done => {
      request(app)
        .get(`/api/users/${user._id}/devices/${device.api_signer_address}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal("Not Found");
          done();
        })
        .catch(done);
    });
  });

  // describe('# PUT /api/users/:userId/devices', () => {
  //   it('should sync all user device details', (done) => {
  //     request(app)
  //       .put(`/api/users/${user._id}/devices`)
  //       .expect(httpStatus.OK)
  //       .then((res) => {
  //         expect(res.body.address.toLowerCase()).to.equal(device.address.toLowerCase());
  //         expect(res.body.api_signer_address.toLowerCase()).to.equal(device.api_signer_address.toLowerCase());
  //         done();
  //       })
  //       .catch(done);
  //   });
  // });

  describe("# GET /api/users/:userId/devices/", () => {
    it("should get all user devices", done => {
      request(app)
        .get(`/api/users/${user._id}/devices`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an("array");
          let devices = res.body;
          let len = devices.length;
          while (len--) {
            let currDevice = devices[len];
            expect(currDevice.app_user_id).to.equal(user._id);
            expect(currDevice.user_id).to.equal(ostUser.user_id);
          }

          done();
        })
        .catch(done);
    });

    it("should get all user devices (with limit and skip)", done => {
      request(app)
        .get(`/api/users/${user._id}/devices`)
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an("array");
          done();
        })
        .catch(done);
    });
  });

  describe("# DELETE /api/users/:userId/devices/:deviceAddress", () => {
    it("should delete user device", done => {
      request(app)
        .delete(`/api/users/${user._id}/devices/${device.address}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.address.toLowerCase()).to.equal(
            device.address.toLowerCase()
          );
          expect(res.body.api_signer_address.toLowerCase()).to.equal(
            device.api_signer_address.toLowerCase()
          );
          done();
        })
        .catch(done);
    });
  });
});
