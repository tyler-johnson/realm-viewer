import babel from "rollup-plugin-babel";
import string from 'rollup-plugin-string';

export default {
	onwarn: ()=>{},
	plugins: [
        string({
            extensions: ['.ejs']
        }),
		babel({
			exclude: 'node_modules/**'
		})
	]
};
