import babel from "rollup-plugin-babel";
import json from "rollup-plugin-json";
import string from 'rollup-plugin-string';

export default {
	onwarn: ()=>{},
	format: "cjs",
	plugins: [
		json(),
		string({
            extensions: ['.ejs']
        }),
		babel({
			exclude: [ "node_modules/**" ],
			include: [ "src/**" ],
			plugins: [
				"external-helpers",
				"transform-es2015-destructuring",
				"transform-es2015-parameters",
				"transform-async-to-generator",
				"transform-object-rest-spread"
			]
		})
	]
};
