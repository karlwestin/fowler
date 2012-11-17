var request = require("request");
var Stream = require("stream").Stream;
var gh = "https://api.github.com/legacy/repos/search/";
var query = "?language=javascript&start_page=0";

function Cache() {
  this.writable = true;
  this.content = "";
}

require("util").inherits(Cache, Stream);

Cache.prototype.write = function(buf) {
  this.content += buf;
};

Cache.prototype.end = function(data) {
  if(data) {
    this.write(data);
  }
  this.emit("end");
};

module.exports = function(keyword) {
  return request(gh + keyword + query).pipe(new Cache());
};
