import _request from "request";
import promisify from "es6-promisify";

const request = promisify(_request);

Object.getOwnPropertyNames(_request).forEach(k => {
	if (typeof _request[k] === "function") {
		request[k] = _request[k].bind(_request);
	}
});

export default request;
