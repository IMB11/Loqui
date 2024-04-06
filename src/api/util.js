module.exports.getFile = function (namespace, version) {
  const path = `./repo/${namespace}/${version}.json`;

  if (!fs.existsSync(path)) {
    return null;
  } else {
    const contents = fs.readFileSync(path, "utf-8");
    return contents;
  }
}