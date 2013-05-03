#! /usr/bin/env node
/*
 * Fowler.js
 * (c) karl westin 2012
 * MIT License
 */
var exec = require("child_process").exec;
var keypress = require("keypress");
var request = require("request");

var search = process.argv[2];
var gh = "https://api.github.com/legacy/repos/search/";
var query = "?language=javascript&start_page=0";
var data;

// github requires a user-agent nowadays
request({ 
  uri: gh + search + query,
  headers: { "user-agent": "mikeal-request/2.11.1" } 
}, function(error, resp, body) {
  data = body;
  next(0);
});

function install(repo) {
  console.log("hell yeah! we're installing:", repo.name);
  exec("git clone git://github.com/" + repo.username + "/" + repo.name + ".git", function(error, stdout, stderr) {
     if(stdout) {
       console.log("out: "+ stdout);
     } 

     if(stderr) {
       console.log("err: " + stderr);
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
  repos.forEach(function(repo, index) {
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
  console.log(resp);

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
    } else if(typeof num === "number" && !isNaN(num)) {
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

function next(num) {
  listRepos(num, data);
}

keypress(process.stdin);
var stdin = process.openStdin();
process.stdin.setRawMode(true);
