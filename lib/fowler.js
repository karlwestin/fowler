#! /usr/bin/env node
/*
 * Fowler.js
 * (c) karl westin 2012
 * MIT License
 */
var hub = require("./githubSearch"),
    _ = require("underscore"),
    sys = require("sys"),
    exec = require("child_process").exec,
    keypress = require("keypress"),
    search = hub(process.argv[2]);


function install(repo) {
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
     process.exit();
  });
}

function render(repos, start, end) {
  console.log("showing number %d-%d", start, end);
  console.log("   ");
  _.each(repos, function(repo, index) {
    console.log("%d. name: %s user: %s watchers: %d", index, repo.name, repo.username, repo.watchers);
  });
  console.log("-------\nleft/right arrows for prev/next, type a number to install, esc to exit");
}


function listRepos(page, resp) {
  if(!page || page < 0) {
    page = 0;
  } else if (page > 9) {
    page = 9;
  }

  var repos = JSON.parse(resp).repositories,
      start = page * 10,
      end = start + 10,
      current = repos.slice(start, end);

  render(current, start, end);

  process.stdin.once("keypress", function(chunk, key) {
    var input = getInput(chunk, key),
        num = parseInt(input, 10);
    if(input === "left") {
      next(page - 1);
    } else if (input === "right") {
      next(page + 1);
    } else if(!_.isNaN(num)) {
      install(current[num]);
    } else if(input ==="escape") {
      console.log("quitting fowler");
      process.exit();
    } else {
      next(page);
    }
  });
}

function getInput(chunk, key) {
  if(key && key.ctrl && key.name === "c") {
    process.exit();
  } else if(key) {
    return key.name.toString().trim();
  } else {
    return chunk.toString().trim();
  }
}

next(0);

function next(num) {
  search.then(_.bind(listRepos, this, num));
}

search.fail(function() {
  console.log("failed", arguments);
});

keypress(process.stdin);
var stdin = process.openStdin();
process.stdin.setRawMode(true);
