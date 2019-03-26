const ostSdk = require("../helpers/ostSdk");

/**
 * Get token
 * @returns token
 */
function get(req, res) {
  const tokensService = ostSdk.services.tokens,
    pricePointService = ostSdk.services.price_points;
  tokensService
    .get({})
    .then(function(response) {
      var chainId = response.data["token"]["auxiliary_chains"][0]["chain_id"],
        token = response.data["token"];
      pricePointService
        .get({ chain_id: chainId })
        .then(function(response) {
          res.send(
            JSON.stringify({ token: token, price_points: response.data })
          );
        })
        .catch(function(err) {
          res.send(JSON.stringify(err));
        });
    })
    .catch(function(err) {
      res.send(JSON.stringify(err));
    });
}

module.exports = { get };
