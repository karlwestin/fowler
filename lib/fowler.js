#! /usr/bin/env node
/*
 * Fowler.js
 * (c) karl westin 2012
 * MIT License
 */
var hub = require("./githubSearch"),
    _ = require("underscore"),
    prompt = require("prompt"),
    sys = require("sys"),
    exec = require("child_process").exec,
    search = hub(process.argv[2]);

function install(repo) {
  //git://github.com/documentcloud/underscore.git
  console.log("hell yeah! we're installing", repo.name);
  exec("git clone git://github.com/" + repo.username + "/" + repo.name + ".git", function(error, stdout, stderr) {
     if(stdout) {
       sys.print("out: "+ stdout);
     } 

     if(stderr) {
       sys.print("err: " + stderr);
     }

     if(error !== null) {
       console.log("error: ", error);
     }
  });
}

function render(repos) {
  _.each(repos, function(repo, index) {
    console.log("%d. name: %s user: %s watchers: %d", index, repo.name, repo.username, repo.watchers);
  });
  console.log("-------\ntype 'next' to show more or 'prev' to go back");
}

function listRepos(page, resp) {
  var repos = JSON.parse(resp).repositories,
      start = (page || 0) * 10,
      end = start + 10,
      current = repos.slice(start, end);

  console.log("showing number %d-%d", start, end);

  render(current);

  return prompt.get(["number"], function(err, result) {
    var num = parseInt(result.number, 10);
    if(err) {
      console.log("wtf", err);
    } else if (result.number === "next") {
      next(page + 1);
    } else if (result.number === "prev") {
      next(page - 1);
    } else if(_.isNumber(num)) {
      install(current[num]);
    }
  });
}

prompt.start();
next(0);

function next(num) {
  search.then(_.bind(listRepos, this, num));
}

search.fail(function() {
  console.log("failed", arguments);
});
