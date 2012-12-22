/* casper-chai version 0.2.0 */

// -- from: lib/casper-chai.coffee -- \\

/*
  Chai assertions for CasperJS
  ============================

  Copyright (C) 2012 Brian M Hunt

  Repository: http://github.com/brianmhunt/casper-chai.git
  License: MIT (see LICENSE.txt)
*/


(function() {
  var casperChai,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  casperChai = function(_chai, utils) {
    var AlwaysFlag, Assertion, AttrTest, CasperTest, OneFlag, RemoteSelector, SelectorTest, assert, flag, _addMethod, _addProperty, _exprAsFunction, _get_attrs, _matches;
    assert = _chai.assert;
    Assertion = _chai.Assertion;
    flag = utils.flag;
    RemoteSelector = (function() {

      function RemoteSelector(casper, definition) {
        var _this = this;
        this.casper = casper;
        this.definition = definition;
        Object.defineProperty(this, 'length', {
          get: function() {
            var len_fn;
            len_fn = function(_selector) {
              return __utils__.findAll(_selector).length;
            };
            return _this.casper.evaluate(len_fn, {
              _selector: _this.definition
            });
          }
        });
        this.isRemoteSelector = true;
      }

      RemoteSelector.prototype.map = function(fn, args) {
        var mapped, _rfn;
        _rfn = function(_selector, _fn, _args) {
          var _casper_chai_elements, _casper_results;
          _casper_chai_elements = __utils__.findAll(_selector);
          _casper_results = [];
          Array.prototype.forEach.call(_casper_chai_elements, function(element) {
            return _casper_results.push(_fn.apply(element, _args));
          });
          return _casper_results;
        };
        mapped = this.casper.evaluate(_rfn, {
          _selector: this.definition,
          _fn: fn,
          _args: args
        });
        return mapped;
      };

      RemoteSelector.prototype.attrs = function(attr) {
        var attr_list, fn;
        fn = function(_attr) {
          return this.getAttribute(_attr);
        };
        attr_list = this.map(fn, [attr]);
        return attr_list;
      };

      RemoteSelector.prototype.tagnames = function() {
        return this.map(function() {
          return this.tagName;
        });
      };

      return RemoteSelector;

    })();
    CasperTest = (function() {

      function CasperTest(chai, casper) {
        this.chai = chai;
        this.casper = casper;
      }

      CasperTest.prototype.method = function() {};

      CasperTest.addToChai = function(TestClass) {
        var test, _chainMethod, _method;
        test = new TestClass;
        if (_.isFunction(test['chainMethod'])) {
          _chainMethod = function() {
            var args, casper;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            casper = flag(this, 'object');
            test = new TestClass(this, casper);
            return test.chainMethod.apply(test, args);
          };
          _method = function() {
            var args, casper;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            casper = flag(this, 'object');
            test = new TestClass(this, casper);
            return test.method.apply(test, args);
          };
          return utils.addChainableMethod(Assertion.prototype, test.name, _method, _chainMethod);
        }
      };

      CasperTest.prototype.get_selector = function() {
        var selector;
        selector = flag(this.chai, 'object');
        if (!selector.isRemoteSelector) {
          selector = new RemoteSelector(this.casper, "html");
        }
        return selector;
      };

      return CasperTest;

    })();
    _addProperty = function(name, func) {
      return;
      return _chai.Assertion.addProperty(name, func);
    };
    _addMethod = function(name, method) {
      return;
      return _chai.Assertion.addMethod(name, method);
    };
    _exprAsFunction = function(expr) {
      var fn;
      if (_.isFunction(expr)) {
        fn = expr;
      } else if (_.isString(expr)) {
        if (/^\s*function\s+/.test(expr)) {
          fn = expr;
        } else {
          if (expr.indexOf('return ') === -1) {
            fn = "function () { return " + expr + " }";
          } else {
            fn = "function () { " + expr + " }";
          }
        }
      } else {
        this.assert(false, "Expression " + expr + " must be a function, or a string");
      }
      return fn;
    };
    _matches = function(against, value, isEqualFallback) {
      var regex;
      if (isEqualFallback == null) {
        isEqualFallback = false;
      }
      if (typeof against === 'string') {
        regex = new RegExp("^" + against + "$");
      } else if (_.isRegExp(against)) {
        regex = against;
      } else if (isEqualFallback) {
        if (toString.call(value) === "[object RuntimeArray]") {
          value = _.toArray(value);
        }
        return _.isEqual(against, value);
      } else {
        throw new Error("Test received " + against + ", but expected string", +" or regular expression.");
      }
      return regex.test(value);
    };
    _get_attrs = function(selector, attr, _casper) {
      var attrs, fn;
      fn = function(selector, _attr) {
        var _casper_attrs, _casper_chai_elements;
        _casper_chai_elements = __utils__.findAll(selector);
        _casper_attrs = [];
        Array.prototype.forEach.call(_casper_chai_elements, function(e) {
          return _casper_attrs.push(e.getAttribute(_attr));
        });
        return _casper_attrs;
      };
      attrs = casper.evaluate(fn, {
        _selector: selector,
        _attr: attr
      });
      return attrs;
    };
    /*
        Chai Tests
        ----------
    
        The following are the tests that are added onto Chai Assertion.
    */

    /*
      @@@@ attr(attribute_name)
    
    
      ```javascript
      expect(casper).selector("#header_1").to.have.attr("class")
      expect(casper).selector("#header_1").to.have.attr("class").equal("title")
      ```
    */

    AttrTest = (function(_super) {

      __extends(AttrTest, _super);

      function AttrTest() {
        return AttrTest.__super__.constructor.apply(this, arguments);
      }

      AttrTest.prototype.name = 'attr';

      AttrTest.prototype.chainMethod = function() {};

      AttrTest.prototype.method = function(attr_name) {
        var attrs, sel;
        sel = this.get_selector();
        attrs = sel.attrs(attr_name);
        if (flag(this.chai, 'always')) {
          this.chai.assert(_.all(attrs), ("Expected an element matching " + sel.definition + " to have ") + ("attribute " + attr_name));
        } else {
          this.chai.assert(_.any(attrs), ("Expected an element matching " + sel.definition + " to have ") + ("attribute " + attr_name));
        }
        if (flag(this.chai, 'one')) {
          this.chai.assert(_.filter(attrs).length === 1, ("Expected only one element matching " + sel.definition + " to have ") + ("attribute " + attr_name + ", but more did"));
        }
        return flag(this.chai, 'object', attrs);
      };

      return AttrTest;

    })(CasperTest);
    CasperTest.addToChai(AttrTest);
    /*
      @@@@ one
    */

    OneFlag = (function(_super) {

      __extends(OneFlag, _super);

      function OneFlag() {
        return OneFlag.__super__.constructor.apply(this, arguments);
      }

      OneFlag.prototype.name = 'one';

      OneFlag.prototype.chainMethod = function() {
        return flag(this.chai, 'one', true);
      };

      return OneFlag;

    })(CasperTest);
    CasperTest.addToChai(OneFlag);
    /*
      @@@@ always
    */

    AlwaysFlag = (function(_super) {

      __extends(AlwaysFlag, _super);

      function AlwaysFlag() {
        return AlwaysFlag.__super__.constructor.apply(this, arguments);
      }

      AlwaysFlag.prototype.name = 'always';

      AlwaysFlag.prototype.chainMethod = function() {
        return flag(this.chai, 'always', true);
      };

      return AlwaysFlag;

    })(CasperTest);
    CasperTest.addToChai(AlwaysFlag);
    /*
      @@@@ selector(css3_selector)
    
      When chained, returns a selector class with the string passed in, otherwise
      it returns true when the selector is found at least once in the DOM.
      
      expect(casper).selector("#existent_header").attr("class", "title")
    */

    SelectorTest = (function(_super) {

      __extends(SelectorTest, _super);

      function SelectorTest() {
        return SelectorTest.__super__.constructor.apply(this, arguments);
      }

      SelectorTest.prototype.name = 'selector';

      SelectorTest.prototype.chainMethod = function(selector) {};

      SelectorTest.prototype.method = function(selector) {
        return flag(this.chai, 'object', new RemoteSelector(this.casper, selector));
      };

      return SelectorTest;

    })(CasperTest);
    CasperTest.addToChai(SelectorTest);
    /*
        @@@@ attr(attribute_name)
    
        True when the attribute `attribute_name` on `selector` is true.
      
        If the selector matches more than one element with the attribute set, this
        will fail. In those cases try [attrAll](#attrall) or [attrAny](#attrany).
    
    
        ```javascript
        expect("#my_header").to.have.attr('class')
        ```
    */

    _addMethod('attr', function(attr) {
      var attr_v, attrs, selector;
      selector = this._obj;
      attrs = _get_attrs(selector, attr);
      assert.equal(attrs.length, 1, "Expected " + selector + " to have one match, but it had " + attrs.length);
      attr_v = attrs[0];
      return this.assert(attr_v, "Expected selector " + selector + " to have attribute " + attr + ", but it did not", ("Expected selector " + selector + " to not have attribute " + attr + ", ") + ("but it was " + attr_v));
    });
    /*
        @@@@ attrAny(attribute_name)
    
        True when an attribute is set on at least one of the given selectors.
    
        ```javascript
        expect("div.menu li").to.have.attrAny('selected')
        ```
    */

    _addMethod('attrAny', function(attr) {
      var attrs, selector;
      selector = this._obj;
      attrs = _get_attrs(selector, attr);
      return this.assert(_.any(attrs), ("Expected one element matching selector " + selector + " to have attribute") + ("" + attr + " set, but none did"), ("Expected no elements matching selector " + selector + " to have attribute") + ("" + attr + " set, but at least one did"));
    });
    /*
        @@@@ attrAll(attribute_name)
    
        True when an attribute is set on all of the given selectors.
    
        ```javascript
        expect("div.menu li").to.have.attrAll('class')
        ```
    */

    _addMethod('attrAll', function(attr) {
      var attrs, selector;
      selector = this._obj;
      attrs = _get_attrs(selector, attr);
      return this.assert(_.all(attrs), ("Expected all elements matching selector " + selector + " to have attribute") + ("" + attr + " set, but one did not have it"), ("Expected one elements matching selector " + selector + " to not have ") + (" attribute " + attr + " set, but they all had it"));
    });
    /*
        @@@@ fieldValue
        
    
        True when the named input provided has the given value.
    
        Wraps Casper's `__utils__.getFieldValue(selector)`.
    
        Examples:
    
        ```javascript
        expect("name_of_input").to.have.fieldValue("123");
        ```
    */

    _addMethod('fieldValue', function(givenValue) {
      var get_remote_value, remoteValue, selector;
      selector = this._obj;
      if (_.isString(selector)) {

      } else {
        expect(selector).to.be.inDOM;
      }
      get_remote_value = function(selector) {
        return __utils__.getFieldValue(selector);
      };
      remoteValue = casper.evaluate(get_remote_value, {
        selector: selector
      });
      return this.assert(remoteValue === givenValue, ("expected field(s) " + selector + " to have value " + givenValue + ", ") + ("but it was " + remoteValue), ("expected field(s) " + selector + " to not have value " + givenValue + ", ") + "but it was");
    });
    /*
        @@@@ inDOM
    
        True when the given selector is in the DOM
    
    
        ```javascript
          "#target".should.be.inDOM;
        ```
    
      Note: We use "inDOM" instead of "exist" so we don't conflict with
      the chai.js BDD.
    */

    _addProperty('inDOM', function() {
      var selector;
      selector = this._obj;
      return this.assert(casper.exists(selector), 'expected selector #{this} to be in the DOM, but it was not', 'expected selector #{this} to not be in the DOM, but it was');
    });
    /*
        @@@@ loaded
    
        True when the given resource exists in the phantom browser.
    
        ```javascript
        expect("styles.css").to.not.be.loaded
        "jquery-1.8.3".should.be.loaded
        ```
    */

    _addProperty('loaded', function() {
      var resourceTest;
      resourceTest = this._obj;
      return this.assert(casper.resourceExists(resourceTest), 'expected resource #{this} to exist, but it does not', 'expected resource #{this} to not exist, but it does');
    });
    /*
        @@@@ matchOnRemote
    
        Compare the remote evaluation to the given expression, and return
        true when they match. The expression can be a string or a regular
        expression. The evaluation is the same as for
        [`trueOnRemote`](#trueonremote).
    
        ```javascript
        expect("return 123").to.matchOnRemote(123)
    
        "typeof jQuery".should.not.matchOnRemote('undefined')
    
        "123.toString()".should.matchOnRemote(/\d+/)
        ```
        
        or an example in CoffeeScript
    
        ```coffeescript
        (-> typeof jQuery).should.not.matchOnRemote('undefined')
        ```
    */

    _addMethod('matchOnRemote', function(matcher) {
      var expr, fn, remoteValue;
      expr = this._obj;
      fn = _exprAsFunction(expr);
      remoteValue = casper.evaluate(fn);
      return this.assert(_matches(matcher, remoteValue, true), "expected " + this._obj + " (" + fn + " = " + remoteValue + ") to match " + matcher, "expected " + this._obj + " (" + fn + ") to not match " + matcher + ", but it did");
    });
    /*
        @@@@ matchTitle
    
        True when the the title matches the given regular expression,
        or where a string is used match that string exactly.
    
        ```javascript
        expect("Google").to.matchTitle;
        ```
    */

    _addProperty('matchTitle', function() {
      var matcher, title;
      matcher = this._obj;
      title = casper.getTitle();
      return this.assert(_matches(matcher, title), 'expected title #{this} to match #{exp}, but it did not', 'expected title #{this} to not match #{exp}, but it did');
    });
    /*
        @@@@ matchCurrentUrl
    
        True when the current URL matches the given string or regular expression
    
        ```javascript
          expect(/https:\/\//).to.matchCurrentUrl;
        ```
    */

    _addProperty('matchCurrentUrl', function() {
      var currentUrl, matcher;
      matcher = this._obj;
      currentUrl = casper.getCurrentUrl();
      return this.assert(_matches(matcher, currentUrl), 'expected url #{exp} to match #{this}, but it did not', 'expected url #{exp} to not match #{this}, but it did');
    });
    /*
        @@@@ tagName
    
        All elements matching the given selector are one of the given tag names.
    
        In other words, given a selector, all tags must be one of the given tags.
        Note that those tags need not appear in the selector.
    
        ```javascript
        ".menuItem".has.tagName('li')
    
        "menu li *".has.tagName(['a', 'span'])
        ```
    */

    _addMethod('tagName', function(ok_names) {
      var diff, selector, tagnames, _get_tagnames;
      selector = this._obj;
      if (_.isString(ok_names)) {
        ok_names = [ok_names];
      } else if (!_.isArray(ok_names)) {
        assert.ok(false, "tagName must be a string or list, it was " + typeof ok_names);
      }
      _get_tagnames = function(selector) {
        var fn, _tagnames;
        fn = function(selector, _attr) {
          var _casper_chai_elements, _casper_tags;
          _casper_chai_elements = __utils__.findAll(selector);
          _casper_tags = [];
          Array.prototype.forEach.call(_casper_chai_elements, function(e) {
            return _casper_tags.push(e.tagName.toLowerCase());
          });
          return _casper_tags;
        };
        _tagnames = casper.evaluate(fn, {
          _selector: selector
        });
        return _tagnames;
      };
      tagnames = _get_tagnames(selector);
      diff = _.difference(tagnames, ok_names);
      return this.assert(diff.length === 0, ("Expected " + selector + " to have only tags " + ok_names + ", but there was") + ("tag(s) " + diff + " appeared"), ("Expected " + selector + " to have tags other than " + ok_names + ", but ") + "those were the only tags that appeared");
    });
    /*
        @@@@ textInDOM
    
        The given text can be found in the phantom browser's DOM.
    
        ```javascript
        "search".should.be.textInDOM
        ```
    */

    _addProperty('textInDOM', function() {
      var haystack, needle;
      needle = this._obj;
      haystack = casper.evaluate(function() {
        return document.body.textContent || document.body.innerText;
      });
      return this.assert(haystack.indexOf(needle) !== -1, 'expected text #{this} to be in the document, but it was not', 'expected text #{this} to not be in the document, but it was found');
    });
    /*
        @@@@ textMatch
    
        The text of the given selector matches the expression (a string
        or regular expression).
    
        ```javascript
          expect("#element").to.have.textMatch(/case InSenSitIvE/i);
        ```
    */

    _addMethod('textMatch', function(matcher) {
      var selector, text;
      selector = this._obj;
      text = casper.fetchText(selector);
      return this.assert(_matches(matcher, text), "expected '" + selector + "' to match " + matcher + ", but it was \"" + text + "\"", "expected '" + selector + "' to not match " + matcher + ", but it did");
    });
    /*
        @@@@ trueOnRemote
    
        The given expression evaluates to true on the remote page. Expression may
        be a function, a function string, or a simple expression. Where a function
        is passed in, the return value is tested. Where a simple expression is
        passed in it is wrapped in 'function () {}', with a 'return' statement
        added if one is not already included, and this wrapped function is
        evaluated as an ordinary function would be.
    
        ```javascript
        "true".should.be.trueOnRemote;
    
        expect("true").to.be.trueOnRemote;
    
        (function() { return false }).should.not.be.trueOnRemote;
    
        expect("function () { return true }").to.be.trueOnRemote;
    
        expect("return false").to.not.be.trueOnRemote;
    
        var foo = function () { return typeof jQuery == typeof void 0; )
        foo.should.be.trueOnRemote; // unless Query is installed.
    
        expect("function () { return 1 == 0 }").to.not.be.trueOnRemote;
        ```
    */

    _addProperty('trueOnRemote', function() {
      var expr, fn, remoteValue;
      expr = this._obj;
      fn = _exprAsFunction(expr);
      remoteValue = casper.evaluate(fn);
      return this.assert(remoteValue, "expected expression " + this._obj + " to be true, but it was " + remoteValue, "expected expression " + this._obj + " to not be true, but itw as " + remoteValue);
    });
    /*
        @@@@ visible
    
        The selector matches a visible element.
    
        ```javascript
        expect("#hidden").to.not.be.visible
        ```
    */

    return _addProperty('visible', function() {
      var selector;
      selector = this._obj;
      expect(selector).to.be.inDOM;
      return this.assert(casper.visible(selector), 'expected selector #{this} to be visible, but it was not', 'expected selector #{this} to not be, but it was');
    });
  };

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    module.exports = casperChai;
  } else if (typeof define === "function" && define.amd) {
    define(function() {
      return casperChai;
    });
  } else {
    chai.use(casperChai);
  }

}).call(this);
