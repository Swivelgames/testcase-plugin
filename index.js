const fs = require('fs');
const path = require('path');

module.exports = (function(){
	function Constructor(src, tcSrc, extensions) {
		this.src = src;
		this.tcSrc = tcSrc;
		this.exts = extensions;
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

			if (!result || !result.request) return callback();

			const reqPartial = result.request.indexOf('!') > -1 ? result.request.split('!').pop() : result.request;
			const reqPath = path.resolve(result.context, reqPartial);

			if (reqPath.indexOf(src) === 0) {
				let newPath = this.testPath(reqPath.replace(src, tcSrc));

				if(newPath !== false) {
					this.rebuildResult(result, newPath);
				}
			} else if (result.context.indexOf(tcSrc) === 0) {
				if (this.testPath(reqPath) === false) {
					result.context = result.context.replace(tcSrc, src);
				}
			}

			return callback(null, result);
		},

		rebuildResult(result, newPartial) {
			if (result.request.indexOf('!') > -1) {
				const splits = result.request.split('!');
				splits.pop();
				splits.push(newPartial);
				result.request = splits.join('!');
			} else {
				result.request = newPartial;
			}
			return result;
		},

		testPath: function(path) {
			const ret = ([''].concat(this.exts)).filter(function (ext) {
				let _path = path + ext;
				try {
					fs.accessSync(_path);
					return !fs.statSync(_path).isDirectory();
				} catch(e) {
					if(e.code !== 'ENOENT') console.log(e);
				}
				return false;
			});
			return (ret.length === 1) ? path + ret[0] : false;
		}
	};

	return Constructor;
})();
