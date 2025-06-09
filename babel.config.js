module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"], // Or 'module:metro-react-native-babel-preset' if not using Expo
		plugins: [
			"react-native-reanimated/plugin", // This is essential for Reanimated
			["@babel/plugin-transform-private-methods", { loose: true }], // Add this line
		],
	};
};
