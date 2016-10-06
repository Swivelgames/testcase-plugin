const fs = require('fs');
const path = require('path');

module.exports = (function(){
	function Constructor(src, tcSrc) {
		this.src = src;
		this.tcSrc = tcSrc;
	}

	Constructor.prototype = {
		apply: function(compiler) {
			compiler.plugin("normal-module-factory", this.attachBeforeResolve.bind(this));
			compiler.plugin("context-module-factory", this.attachBeforeResolve.bind(this));
		},

		attachBeforeResolve: function(ent) {
//			ent.plugin("after-resolve", this.testResolve.bind(this));
			ent.plugin("before-resolve", this.testResolve.bind(this));
		},

		testResolve: function(result, callback) {
			const { src, tcSrc } = this;

			if (!result) return callback();
			if (!result.request) {
				console.log(result);
				return callback();
			}

			const reqPartial = result.request.indexOf('!') > -1 ? result.request.split('!').pop() : result.request;
			const reqPath = path.resolve(result.context, reqPartial);

			if (reqPath.indexOf(src) === 0) {
				let newPath = reqPath.replace(new RegExp('^' + src), tcSrc);

				if(this.testPath(newPath)) {
					result.request = result.request.replace(reqPartial, newPath);
				}
			} else if (reqPath.indexOf(tcSrc) === 0) {
				if(!this.testPath(reqPath)) {
					result.request =  reqPath.replace(new RegExp('^' + tcSrc), src);
				}
			} else return callback(null, result);

			return callback(null, result);
		},

		testPath: function(path) {
			try {
				fs.accessSync(path);
				return !fs.statSync(path).isDirectory();
			} catch(e) {
				if(e.code !== 'ENOENT') console.log(e);
			}
			return false;
		}
	};

	return Constructor;
})()
