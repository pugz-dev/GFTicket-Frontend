module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit) => /^Merge branch/.test(commit)],
};
