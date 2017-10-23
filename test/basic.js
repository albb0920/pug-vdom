/* eslint-env mocha */
var assert = require('assert')
var vDom = require('../pug-vdom')
var vm = require('vm')
require('../runtime');
var h = require('virtual-dom/h');

var pugText1 = `
.my-element
`

var pugText2 = `
.my-element(data-foo=locals.myLocal)
`

var pugText3 = `
.class-1#my-id(data-foo=locals.myLocal, data-boo='goo',class='class-2 class-3')&attributes({class: "class-4"})
`

var pugText4 = `
.class-1#my-id(data-foo=locals.myLocal, class='class-2 class-3')&attributes({class: "class-4"}, {class: 'class-5', 'data-moo': locals.myOtherLocal})
`

var pugText5 = `
.class-1#my-id(data-foo=locals.myLocal, class=['class-2', 'class-3'])&attributes({class: ["class-4"]}, {class: 'class-5', 'data-moo': locals.myOtherLocal})
`

function vdom (tagname, attrs, children) {
  return {tagName: tagname, attrs: attrs, children: children}
}

describe('Compiler', function () {
  it('Generates well formed code', function (done) {
    var ast = vDom.ast('tpl/all.pug', './tpl')
    var compiler = new vDom.Compiler(ast)
    var code = compiler.compile()
    assert.ok(code)
    var render = new vm.Script(code + '\r\nrender({}, function(){})')
    var context = new vm.createContext({pugVDOMRuntime: pugVDOMRuntime,variable: 1, msg: 'Blop', friends: 10, inputs: []})
    render.runInContext(context)
    done()
  })

  it('Generates a module template', function (done) {
    vDom.generateFile('tpl/all.pug', 'public/all.pug.js', './tpl')
    var tpl = require('../public/all.pug.js')
    var tree = tpl({variable: 1, msg: 'Blop', friends: 10, inputs: []}, vdom)
    assert.ok(tree)
    done()
  })

  it('Compiles a template function from pug text', function (done) {
      assert.ok(typeof vDom.generateTemplateFunction(pugText1) === 'function')
      done()
  })

  it('Compiles a template function and executes it with locals object', function (done) {
      var vnodes = vDom.generateTemplateFunction(pugText2)({
          myLocal: "foo"
      }, h);
      var vnode = vnodes[0];

      assert.equal(vnode.properties.attributes['data-foo'], "foo")
      done()
  })

  it('Compiles a pug tag with complex attributes', function (done) {
      var vnodes = vDom.generateTemplateFunction(pugText3)({
          myLocal: "foo"
      }, h);
      var vnode = vnodes[0];

      assert.equal(vnode.properties.attributes.class, 'class-1 class-2 class-3 class-4')
      assert.equal(vnode.properties.attributes.id, 'my-id')
      assert.equal(vnode.properties.attributes['data-foo'], 'foo')
      assert.equal(vnode.properties.attributes['data-boo'], 'goo')
      assert.equal(vnode.key, 'my-id')

      done()
  })

  it('Compiles a pug tag with complex attributes using multiple &attributes blocks', function (done) {
      var vnodes = vDom.generateTemplateFunction(pugText4)({
          myLocal: "foo",
          myOtherLocal: "moo"
      }, h);
      var vnode = vnodes[0];

      assert.equal(vnode.properties.attributes.class, 'class-1 class-2 class-3 class-4 class-5')
      assert.equal(vnode.properties.attributes.id, 'my-id')
      assert.equal(vnode.properties.attributes['data-foo'], 'foo')
      assert.equal(vnode.properties.attributes['data-moo'], 'moo')
      assert.equal(vnode.key, 'my-id')

      done()
  })

  it('Compiles a pug tag with complex attributes using multiple &attributes blocks and class attribute as array', function (done) {
      var vnodes = vDom.generateTemplateFunction(pugText5)({
          myLocal: "foo",
          myOtherLocal: "moo"
      }, h);
      var vnode = vnodes[0];

      assert.equal(vnode.properties.attributes.class, 'class-1 class-2 class-3 class-4 class-5')
      assert.equal(vnode.properties.attributes.id, 'my-id')
      assert.equal(vnode.properties.attributes['data-foo'], 'foo')
      assert.equal(vnode.properties.attributes['data-moo'], 'moo')
      assert.equal(vnode.key, 'my-id')

      done()
  })

})
