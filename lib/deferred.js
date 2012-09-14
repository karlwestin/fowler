var request = require("request"),
    q = require("q"),
    _ = require("underscore"),
    defaults = {
      method: "get"
    };

function req(url, callback, errback) {
  var deferred = q.defer(),
      newSets = typeof url === "string" ? { url: url } : url,
      settings = _.extend(defaults, newSets);

  request(settings, function(err, response, body) {
    if(response.statusCode !== 200) {
      return deferred.reject(response.statusText, body);
    } 
    return deferred.resolve(body);
  });

  deferred.promise.then(callback || function() {});
  deferred.promise.fail(errback || function() {});

  return deferred.promise;
}

req.post = function(url, callback, errback) {
  return req({ method: "post", url: url}, callback, errback);
};

req.get = function(url, callback, errback) {
  return req(url, callback, errback);
};

module.exports = req;
