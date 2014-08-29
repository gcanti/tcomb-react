function toPropTypes(Struct) {
  
  var propTypes = {};
  var props = Struct.meta.props;
  
  Object.keys(props).forEach(function (k) {
    // React custom prop validator
    // see http://facebook.github.io/react/docs/reusable-components.html
    propTypes[k] = function (values, name, component) {
      var opts = {
        path: ['this.props.' + name], 
        messages: ':path of value `:actual` supplied to `' + component + '`, expected a `:expected`'
      };
      return window.validate(values[name], props[name], opts).firstError();
    }
  });

  return propTypes;
}

module.exports = toPropTypes;