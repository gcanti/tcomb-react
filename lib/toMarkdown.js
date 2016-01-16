var t = require('../').t;

function getProps(props) {
  return Object.keys(props).map(function (k) {
    var prop = props[k];
    return '- `' + k + ': ' + prop.name + '` ' + (prop.required ? '' : '(optional' + (t.Nil.is(prop.defaultValue) ? '' : ', default: `' + JSON.stringify(prop.defaultValue) + '`') + ') ') + ( prop.description || '');
  }).join('\n');
}

function toMarkdown(json) {
  if (t.Array.is(json)) {
    return json.map(toMarkdown).join('\n');
  }
  return '## ' + json.name + '\n' + (json.description ? '\n' + json.description + '\n' : '') + '\n**Props**\n\n' + getProps(json.props) + '\n';
}

module.exports = toMarkdown;
