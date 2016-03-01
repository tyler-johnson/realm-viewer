import express from "express";
import path from "path";

export default function createApp(cwd=".", {mapdir="./map"}) {
	let app = express();
	app.set("x-powered-by", false);
	app.use(express.static(path.resolve(cwd, mapdir)));
	return app;
}
