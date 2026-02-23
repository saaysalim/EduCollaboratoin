// eslint-disable-next-line no-undef
const StudentData = artifacts.require("StudentData");

module.exports = function (deployer) {
  deployer.deploy(StudentData);
};
