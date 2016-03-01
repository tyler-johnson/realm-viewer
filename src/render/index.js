import {init as initAuth} from "./auth";
import download from "./download";
import spawn from "./spawn";

export default async function(cwd=".", {username, password, id, overviewer:bin, config, mapdir}) {
	let sess = await initAuth(cwd, username, password);
	await download(id, sess, cwd);
	await spawn(cwd, bin, {config, mapdir});
}
