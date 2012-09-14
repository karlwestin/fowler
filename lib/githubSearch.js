var req = require("./deferred"),
    _ = require("underscore");

var defaults = {
  language: "javascript",
  start_page: 0
};

function githubSearch(keyword) {
  var data,
      params = "?";

  if(_.isObject(keyword)) {
    data = _.extend({}, defaults, keyword);
    keyword = keyword.keyword;
    delete data.keyword;
  } else if(_.isString(keyword)) {
    data = defaults;
  } else {
    throw new Error(keyword + " isn't a string, or a hash");
  }

  _.each(data, function(value, key) {
    params += key + "=" + value + "&";
  });
  params = params.replace(/&$/, "");

  return req("https://api.github.com/legacy/repos/search/" + keyword + params);
}

module.exports = githubSearch;
