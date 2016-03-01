import minimist from "minimist";
import {merge,repeat} from "lodash";
import {readFileSync} from "fs";
import path from "path";
import config from "cloud-env";

// using standard require so rollup doesn't include it
const realmviewer = require("./");

let argv = minimist(process.argv.slice(2), {
	string: [ ],
	boolean: [ "help", "version", "server" ],
	alias: {
		h: "help", H: "help",
		v: "version", V: "version",
		c: "config",
		r: "render"
	},
	default: {
		render: true,
		server: true
	}
});

if (argv.help) {
	console.log(`
$ realm-viewer [OPTIONS]
`.replace(/^\t+/gm, (m) => repeat("  ", m.length)));
	process.exit(0);
}

if (argv.version) {
	const pkg = JSON.parse(readFileSync(__dirname + "/package.json", "utf8"));
	console.log("%s %s", pkg.name, pkg.version || "edge");
	process.exit(0);
}

let cwd = argv._.length ? argv._[0] : ".";

if (argv.config) {
	let src;
	let cfile = typeof argv.config === "boolean" ? "config.json" : argv.config;
	cfile = path.resolve(cwd, cfile);
	try { src = readFileSync(cfile, "utf8"); }
	catch(e) { e; }
	if (src) merge(argv, JSON.parse(src));
}

function panic(e) {
	console.error(e.stack || e);
	process.exit(1);
}

if (argv.server) {
	realmviewer.createServer(cwd, argv).listen(
		argv.port || config.PORT || 8080,
		argv.host || config.HOST || "127.0.0.1",
		function() {
			const addr = this.address();
			console.log("HTTP server listening at http://%s:%s", addr.address, addr.port);
			console.log("Enter Ctrl-C to stop the server.");
		}
	).on("error", panic);
}

if (argv.render) {
	realmviewer.autorender(cwd, {
		...argv,
		interval: argv.render
	}).catch(panic);
}
