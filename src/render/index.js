import {init as initAuth} from "./auth";
import download from "./download";
import spawn from "./spawn";
import ms from "ms";

export async function render(cwd=".", {username, password, id, overviewer:bin, config, mapdir}) {
	let sess = await initAuth(cwd, username, password);
	await download(id, sess, cwd);
	await spawn(cwd, bin, {config, mapdir});
}

export async function autorender(cwd, opts) {
	await render(cwd, opts);

	let rendering = false;
	let {interval,onerror,onstart,onfinish} = opts;
	interval = ms(typeof interval === "string" ? interval : "24h");

	let int = setInterval(async () => {
		if (rendering) return;

		try {
			rendering = true;
			if (typeof onstart === "function") onstart();
			await render(cwd, opts);
			if (typeof onfinish === "function") onfinish();
		} catch(e) {
			if (typeof onerror === "function") onerror(e);
		} finally {
			rendering = false;
		}
	}, Math.max(5 * 60 * 1000, interval));

	return () => {
		clearInterval(int);
	};
}
