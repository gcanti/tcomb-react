var fs = require('fs');
var t = require('../').t;
var toObject = require('tcomb-doc').toObject;
var parseComments = require('get-comments');
var parseJSDocs = require('doctrine').parse;

// (path: t.String) => { description: t.String, tags: Array<Tag> }
function getComments(path) {
  var source = fs.readFileSync(path, 'utf8');
  var comments = parseComments(source, true);
  var values = comments.map(function (comment) {
    return comment.value;
  });
  return parseJSDocs(values.join('\n'), { unwrap: true });
}

// (comments: t.Object) => { component, props: {} }
function getDescriptions(comments) {
  var ret = {
    component: comments.description || null,
    props: {}
  };
  comments.tags.forEach(function (tag) {
    if (tag.name) {
      ret.props[tag.name] = tag.description || null;
    }
  });
  return ret;
}

// (exports: t.Object) => ReactComponent
function getComponent(defaultExport) {
  if (defaultExport['default']) { // eslint-disable-line dot-notation
    defaultExport = defaultExport['default']; // eslint-disable-line dot-notation
  }
  return defaultExport.propTypes ? defaultExport : null;
}

// (component: ReactComponent) => t.String
function getComponentName(component) {
  return component.name;
}

// (component: ReactComponent) => TcombType
function getPropsType(component) {
  var propTypes = component.propTypes;
  var props = {};
  Object.keys(propTypes).forEach(function (k) {
    if (k !== '__strict__' && k !== '__subtype__') {
      props[k] = propTypes[k].tcomb;
    }
  });
  if (propTypes.hasOwnProperty('__subtype__')) {
    return t.refinement(t.struct(props), propTypes.__subtype__.predicate);
  }
  return t.struct(props);
}

// (component: ReactComponent) => t.Object
function getDefaultProps(component) {
  return component.defaultProps || {};
}

// (path: t.String) => { name, description, props }
function parse(path) {
  if (t.Array.is(path)) {
    return path.map(parse).filter(Boolean);
  }
  var component = getComponent(require(path));
  if (component) {
    var comments = getComments(path);
    var descriptions = getDescriptions(comments);
    var type = toObject(getPropsType(component));
    var props = type.kind === 'refinement' ? type.type.props : type.props;
    var defaultProps = getDefaultProps(component);
    var name = getComponentName(component);
    for (var prop in props) {
      if (props.hasOwnProperty(prop)) {
        if (defaultProps.hasOwnProperty(prop)) {
          props[prop].defaultValue = defaultProps[prop];
        }
        if (descriptions.props.hasOwnProperty(prop)) {
          props[prop].description = descriptions.props[prop];
        }
      }
    }
    return {
      name: name,
      description: descriptions.component,
      props: props
    };
  }
}

module.exports = parse;
