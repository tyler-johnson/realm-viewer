import request from "./request";
import get from "request";
import fs from "fs-promise";
import path from "path";
import {extract} from "tar-stream";
import {createGunzip} from "zlib";
import del from "del";

const realms_url = "https://mcoapi.minecraft.net";

async function getUrl(id, sess) {
	if (!id) {
		throw new Error("Missing world id.");
	}
	
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

async function untar(stream, cwd) {
	let tar = extract();

	tar.on("entry", async function(header, content, next) {
		try {
			let file = path.resolve(cwd, header.name);
			await del(file);

			if (header.type === "directory") {
				await fs.mkdir(file);
				content.resume();
			} else if (header.type === "file") {
				let out = fs.createWriteStream(file);
				await new Promise((resolve, reject) => {
					out.on("finish", resolve);
					out.on("error", reject);
					content.pipe(out);
				});
			} else {
				content.resume();
			}

			next();
		} catch(e) {
			next(e);
		}
	});

	await new Promise((resolve, reject) => {
		tar.on("finish", resolve);
		tar.on("error", reject);
		stream.pipe(createGunzip()).pipe(tar);
	});
}

export default async function download(sid, sess, cwd) {
	let url = await getUrl(sid, sess);
	await untar(get(url), cwd);
}
