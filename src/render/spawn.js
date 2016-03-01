import {spawn} from "child_process";
import path from "path";
import configsrc from "./config.py.ejs";
import fs from "fs-promise";
import {template} from "lodash";

const configtpl = template(configsrc);

export default async function(cwd=".", bin, {config,mapdir="./map"}) {
	if (typeof bin !== "string" || !bin) {
		throw new Error("Missing overviewer binary path.");
	}

	cwd = path.resolve(cwd);

	if (typeof config !== "string" || !config) {
		config = "overviewer_config.py";
		let cfile = path.join(cwd, "overviewer_config.py");
		try {
			await fs.stat(cfile);
		} catch(e) {
			if (e.code !== "ENOENT" && e.code !== "ENOTDIR") throw e;
			await fs.writeFile(cfile, configtpl({
				world: "./world",
				output: path.relative(cwd, path.resolve(cwd, mapdir))
			}));
		}
	}

	let proc = spawn(bin, [ "--config=" + config ], {
		cwd, stdio: "inherit"
	});

	await new Promise((resolve, reject) => {
		proc.on("close", (code) => code ? reject(new Error("Overviewer failed.")) : resolve());
	});
}
