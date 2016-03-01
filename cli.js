#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var minimist = _interopDefault(require('minimist'));
var lodash = require('lodash');
var fs = require('fs');
var path = _interopDefault(require('path'));
var config = _interopDefault(require('cloud-env'));
var ms = _interopDefault(require('ms'));

var babelHelpers = {};

babelHelpers.asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            return step("next", value);
          }, function (err) {
            return step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

babelHelpers;

// using standard require so rollup doesn't include it
const realmviewer = require("./");

let argv = minimist(process.argv.slice(2), {
	string: [],
	boolean: ["help", "version"],
	alias: {
		h: "help", H: "help",
		v: "version", V: "version",
		c: "config",
		r: "render"
	},
	default: {
		render: true
	}
});

if (argv.help) {
	console.log(`
$ realm-viewer [OPTIONS]
`.replace(/^\t+/gm, m => lodash.repeat("  ", m.length)));
	process.exit(0);
}

if (argv.version) {
	const pkg = JSON.parse(fs.readFileSync(__dirname + "/package.json", "utf8"));
	console.log("%s %s", pkg.name, pkg.version || "edge");
	process.exit(0);
}

let cwd = argv._.length ? argv._[0] : ".";

if (argv.config) {
	let src;
	let cfile = typeof argv.config === "boolean" ? "config.json" : argv.config;
	cfile = path.resolve(cwd, cfile);
	try {
		src = fs.readFileSync(cfile, "utf8");
	} catch (e) {
		e;
	}
	if (src) lodash.merge(argv, JSON.parse(src));
}

function panic(e) {
	console.error(e.stack || e);
	process.exit(1);
}

let app = realmviewer.createServer(cwd, argv);

app.listen(argv.port || config.PORT || 8080, argv.host || config.HOST || "127.0.0.1", function () {
	const addr = this.address();
	console.log("HTTP server listening at http://%s:%s", addr.address, addr.port);
	console.log("Enter Ctrl-C to stop the server.");
}).on("error", panic);

if (argv.render) {
	let rendering = false;
	let render = (() => {
		var ref = babelHelpers.asyncToGenerator(function* () {
			if (rendering) return;
			rendering = true;
			try {
				yield realmviewer.render(cwd, argv);
			} catch (e) {
				console.error(e.stack || e);
			}
			rendering = false;
		}),
		    _this = this;

		return function render() {
			return ref.apply(_this, arguments);
		};
	})();

	setInterval(render, Math.max(1 * 60 * 1000, ms(typeof argv.render === "string" ? argv.render : "24h")));
	render();
}