import typescript from 'rollup-plugin-typescript';
export default {
	entry: 'src/index.ts',
	dest: 'dest/injector.js',
	moduleName: 'HERE',
	format: 'umd',
	plugins:[
		typescript()
	]
};
