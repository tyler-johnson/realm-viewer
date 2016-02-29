import {init as initAuth} from "./auth";
import download from "./download";

async function run(cwd, user, pass) {
	let sess = await initAuth(cwd, user, pass);
	await download("1856394", sess, cwd);
}

run("./test", "tylerj@arcreate.net", "yLN(9BGUWCs6ui(c").then((r) => {
	console.log(r);
}).catch((e) => {
	console.error(e.stack || e);
	process.exit(1);
});
