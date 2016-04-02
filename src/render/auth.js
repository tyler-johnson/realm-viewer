import fs from "fs-promise";
import path from "path";
import uuid from "uuid";
import request from "./request";

const auth_url = "https://authserver.mojang.com";

export class Session {
	constructor({accessToken,clientToken,selectedProfile,profile,worldVersion}) {
		this.accessToken = accessToken;
		this.clientToken = clientToken;
		this.profile = profile || selectedProfile;
		this.worldVersion = worldVersion;
	}

	toJSON() {
		let keys = Object.getOwnPropertyNames(this);
		let obj = {};

		for (let i = 0; i < keys.length; i++) {
			obj[keys[i]] = this[keys[i]];
		}

		return obj;
	}

	async save(cwd) {
		await fs.writeFile(path.resolve(cwd, ".session"), JSON.stringify(this.toJSON(), null, 2));
	}

	async destroy(cwd) {
		await fs.unlink(path.resolve(cwd, ".session"));
	}

	async isValid() {
		let [resp] = await request({
			method: "POST",
			url: auth_url+"/validate",
			json: true,
			body: {
				accessToken: this.accessToken,
				clientToken: this.clientToken
			}
		});

		return resp.statusCode === 204;
	}
}

async function fetch(cwd) {
	let data;

	try {
		data = await fs.readFile(path.resolve(cwd, ".session"), "utf8");
	} catch(e) {
		if (e.code !== "ENOENT" && e.code !== "ENOTDIR") throw e;
	}

	try { data = JSON.parse(data); }
	catch(e) { e; }

	return data ? new Session(data) : null;
}

async function authenticate(user, pass) {
	if (typeof user !== "string" || !user) {
		throw new Error("Missing username.");
	}

	if (typeof pass !== "string") {
		throw new Error("Missing password.");
	}

	let [resp,body] = await request({
		method: "POST",
		url: auth_url+"/authenticate",
		json: true,
		body: {
			agent: { name: "Minecraft", version: 1 },
			username: user,
			password: pass,
			clientToken: uuid.v4()
		}
	});

	if (resp.statusCode !== 200) {
		throw {
			error: true,
			status: resp.statusCode,
			type: body.error,
			message: body.errorMessage
		};
	}

	return new Session(body);
}

export async function init(cwd, user, pass) {
	let sess = await fetch(cwd);

	if (!sess || !(await sess.isValid())) {
		if (sess) await sess.destroy(cwd);
		sess = await authenticate(user, pass);
		await sess.save(cwd);
	}

	return sess;
}
