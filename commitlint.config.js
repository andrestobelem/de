export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [0],
    "scope-empty": [2, "never"],
  },
};
