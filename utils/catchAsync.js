// this function allows to remove the try catch block because it is a generic promise that handle this
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
