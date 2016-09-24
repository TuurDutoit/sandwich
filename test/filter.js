var rdirs = /^(node_modules|build)/;
var files = ["test/bundle.js", "npm-debug.log", ".DS_Store"];

module.exports = function(file) {
  var res = files.indexOf(file) === -1 && !rdirs.test(file);

  return res;
}
