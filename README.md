# Test Case Plugin

## Use this with `testcase-loader`

This webpack plugin makes it easy to create and build test cases by having delta-like paths in your source code.

### Example

*Project Structure*

```
/src/
	/myFiles/
		MyFile.js
	main.js
/test-cases/
	/TestCaseID/
		/myFiles/
			MyFile.js
```

*Webpack Plugin Config*
```javascript
{
	plugins: [
		new TestCasePlugin(
			'/absolute/path/to/src',
	        '/absolute/path/to/test-cases/TestCaseID'
		)
	]
}
```

With the configuration above, **before** Webpack attempts to resolve a file within the `originalPath` directory structure, this plugin will attempt to locate it within the `testCasePath`.

This makes it easy to create Test Case folders, keeping your source directory clean of test case modifications, and slimming down the footprint of other solutions that may include copying the entire code base for test case changes.

Enjoy!
