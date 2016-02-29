import request from "./request";
import get from "request";
import fs from "fs-promise";
import path from "path";

const realms_url = "https://mcoapi.minecraft.net";

async function getUrl(id, sess) {
	let jar = request.jar();
	jar.setCookie(request.cookie(`sid=token:${sess.accessToken}:${sess.profile.id}`), realms_url);
	jar.setCookie(request.cookie(`user=${sess.profile.name}`), realms_url);
	jar.setCookie(request.cookie(`version=1.8.9`), realms_url);

	let [resp,body] = await request({
		jar, url: realms_url+"/worlds/"+id+"/backups/download"
	});

	if (resp.statusCode === 401 || resp.statusCode === 403) {
		throw new Error("Invalid session.");
	}

	if (resp.statusCode !== 200) {
		throw new Error(`Unknown Realms API error [Status ${resp.statusCode}]`);
	}

	return body;
}

export default async function download(sid, sess, cwd) {
	let url = await getUrl(sid, sess);
	let stream = fs.createWriteStream(path.resolve(cwd, "world.tar.gz"));

	await new Promise((resolve, reject) => {
		stream.on("end", resolve);
		stream.on("error", reject);
		get(url).pipe(stream);
	});
}
