/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function () {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			var item = this[i];
			if (item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wizard = __webpack_require__(3);

var _wizard2 = _interopRequireDefault(_wizard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // import React from 'react';
// import ReactDOM from 'react-dom';


var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return React.createElement(_wizard2.default, null);
    }
  }]);

  return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactStepWizard = __webpack_require__(4);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A basic demonstration of how to use the step wizard
 */
var Wizard = function (_React$Component) {
  _inherits(Wizard, _React$Component);

  function Wizard(props) {
    _classCallCheck(this, Wizard);

    var _this = _possibleConstructorReturn(this, (Wizard.__proto__ || Object.getPrototypeOf(Wizard)).call(this, props));

    _this.state = {
      form: {}
    };
    return _this;
  }

  _createClass(Wizard, [{
    key: 'updateForm',
    value: function updateForm(key, value) {
      var form = this.state.form;
      form[key] = value;
      this.setState({ form: form });
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'h2',
          null,
          'React Step Wizard'
        ),
        React.createElement(
          'div',
          { className: 'jumbotron' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col-xs-12 col-sm-6 col-sm-offset-3' },
              React.createElement(
                _reactStepWizard.StepWizard,
                null,
                React.createElement(
                  _reactStepWizard.Step,
                  null,
                  React.createElement(First, { update: this.updateForm.bind(this) })
                ),
                React.createElement(
                  _reactStepWizard.Step,
                  null,
                  React.createElement(Second, { form: this.state.form })
                ),
                React.createElement(
                  _reactStepWizard.Step,
                  null,
                  React.createElement(Third, null)
                )
              )
            )
          )
        )
      );
    }
  }]);

  return Wizard;
}(React.Component);

/**
 * Stats Component - to illustrate the possible functions
 * Could be used for nav buttons or overview
 */


exports.default = Wizard;

var Stats = function (_React$Component2) {
  _inherits(Stats, _React$Component2);

  function Stats() {
    _classCallCheck(this, Stats);

    return _possibleConstructorReturn(this, (Stats.__proto__ || Object.getPrototypeOf(Stats)).apply(this, arguments));
  }

  _createClass(Stats, [{
    key: 'render',
    value: function render() {
      var _this3 = this;

      return React.createElement(
        'div',
        null,
        React.createElement('hr', null),
        this.props.currentStep > 1 && React.createElement(
          'button',
          { className: 'btn btn-default btn-block', onClick: this.props.previousStep },
          'Go Back'
        ),
        this.props.currentStep < this.props.totalSteps ? React.createElement(
          'button',
          { className: 'btn btn-primary btn-block', onClick: this.props.nextStep },
          'Continue'
        ) : React.createElement(
          'button',
          { className: 'btn btn-success btn-block', onClick: this.props.nextStep },
          'Finish'
        ),
        React.createElement('hr', null),
        React.createElement(
          'p',
          null,
          React.createElement(
            'h4',
            null,
            'Other Functions'
          ),
          React.createElement(
            'div',
            null,
            'Current Step: ',
            this.props.currentStep
          ),
          React.createElement(
            'div',
            null,
            'Total Steps: ',
            this.props.totalSteps
          ),
          React.createElement(
            'button',
            { className: 'btn btn-default', onClick: function onClick() {
                return _this3.props.goToStep(2);
              } },
            'Go to Step 2'
          ),
          React.createElement(
            'button',
            { className: 'btn btn-default', onClick: this.props.firstStep },
            'First Step'
          ),
          React.createElement(
            'button',
            { className: 'btn btn-default', onClick: this.props.lastStep },
            'Last Step'
          )
        )
      );
    }
  }]);

  return Stats;
}(React.Component);

/** Steps */

var First = function (_React$Component3) {
  _inherits(First, _React$Component3);

  function First() {
    _classCallCheck(this, First);

    return _possibleConstructorReturn(this, (First.__proto__ || Object.getPrototypeOf(First)).apply(this, arguments));
  }

  _createClass(First, [{
    key: 'update',
    value: function update(e) {
      this.props.update(e.target.name, e.target.value);
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'h3',
          { className: 'text-center' },
          'Welcome! Have a look around!'
        ),
        React.createElement(
          'label',
          null,
          'First Name'
        ),
        React.createElement('input', { type: 'text', className: 'form-control', name: 'firstname', placeholder: 'First Name',
          onChange: this.update.bind(this) }),
        React.createElement(Stats, this.props)
      );
    }
  }]);

  return First;
}(React.Component);

var Second = function (_React$Component4) {
  _inherits(Second, _React$Component4);

  function Second() {
    _classCallCheck(this, Second);

    return _possibleConstructorReturn(this, (Second.__proto__ || Object.getPrototypeOf(Second)).apply(this, arguments));
  }

  _createClass(Second, [{
    key: 'validate',
    value: function validate() {
      if (confirm('Are you sure you want to go back?')) {
        this.props.previousStep();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        this.props.form.firstname && React.createElement(
          'h3',
          null,
          'Hey ',
          this.props.form.firstname,
          '! \uD83D\uDC4B'
        ),
        'I\'ve added validation to the previous button.',
        React.createElement(Stats, _extends({}, this.props, { previousStep: this.validate.bind(this) }))
      );
    }
  }]);

  return Second;
}(React.Component);

var Third = function (_React$Component5) {
  _inherits(Third, _React$Component5);

  function Third() {
    _classCallCheck(this, Third);

    return _possibleConstructorReturn(this, (Third.__proto__ || Object.getPrototypeOf(Third)).apply(this, arguments));
  }

  _createClass(Third, [{
    key: 'submit',
    value: function submit() {
      alert('You did it! Yay!');
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        'This is the last step in this example! Do you love it?',
        React.createElement(Stats, _extends({}, this.props, { nextStep: this.submit.bind(this) }))
      );
    }
  }]);

  return Third;
}(React.Component);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, '__esModule', { value: true });exports.Step = exports.StepWizard = undefined;var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();var _animateCustom = __webpack_require__(5);var _animateCustom2 = _interopRequireDefault(_animateCustom);var _styles = __webpack_require__(7);var _styles2 = _interopRequireDefault(_styles);function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === 'object' || typeof call === 'function') ? call : self;
}function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}var StepWizard = exports.StepWizard = function (_React$Component) {
  _inherits(StepWizard, _React$Component);function StepWizard(props) {
    _classCallCheck(this, StepWizard);var _this = _possibleConstructorReturn(this, (StepWizard.__proto__ || Object.getPrototypeOf(StepWizard)).call(this, props));_this.state = _this.initialState();return _this;
  }_createClass(StepWizard, [{ key: 'animateSteps', value: function animateSteps(change) {
      var active = this.state.step;var next = this.state.step + change; // console.log(change, active, next);
      var styles = this.props.transitions || { enterRight: _animateCustom2.default.animated + ' ' + _animateCustom2.default.fadeInRight, enterLeft: _animateCustom2.default.animated + ' ' + _animateCustom2.default.fadeInLeft, exitRight: _animateCustom2.default.animated + ' ' + _animateCustom2.default.fadeOutRight, exitLeft: _animateCustom2.default.animated + ' ' + _animateCustom2.default.fadeOutLeft };var classes = this.state.classes;if (active < next) {
        // slide left
        classes[active] = _styles2.default.hide + ' ' + styles.exitLeft, classes[next] = styles.enterRight;
      } else {
        // slide right
        classes[active] = _styles2.default.hide + ' ' + styles.exitRight, classes[next] = styles.enterLeft;
      }this.setState(classes);
    } }, { key: 'firstStep', value: function firstStep() {
      this.goToStep(1);
    } }, { key: 'goToStep', value: function goToStep(step) {
      step--;var current = this.state.step;var change = step - current;var action = change > 0 ? this.nextStep.bind(this) : this.previousStep.bind(this); // console.log(current, step, change, Math.abs(change));
      var pause = 0;for (var i = 0; i < Math.abs(change); i++) {
        setTimeout(function () {
          action();
        }, pause);pause += 5;
      }
    } }, { key: 'initialState', value: function initialState() {
      var state = { step: 0, classes: {} }; // Set initial classes
      for (var i = 0; i < this.props.children.length; i++) {
        if (this.props.children[i].props.active) {
          state.step = i;continue;
        }state.classes[i] = _styles2.default.hide;
      }state.classes[state.step] = _styles2.default.active;return state;
    } }, { key: 'lastStep', value: function lastStep() {
      this.goToStep(this.props.children.length);
    } }, { key: 'nextStep', value: function nextStep() {
      var _this2 = this;this.animateSteps(1);this.setState({ step: this.state.step + 1 }, function () {
        _this2.updateHash();
      });
    } }, { key: 'previousStep', value: function previousStep() {
      var _this3 = this;this.animateSteps(-1);this.setState({ step: this.state.step - 1 }, function () {
        _this3.updateHash();
      });
    } }, { key: 'updateHash', value: function updateHash() {// window.location.hash = 'step'+this.state.step;
    } }, { key: 'render', value: function render() {
      var props = { currentStep: this.state.step + 1, totalSteps: this.props.children.length, nextStep: this.nextStep.bind(this), previousStep: this.previousStep.bind(this), goToStep: this.goToStep.bind(this), firstStep: this.firstStep.bind(this), lastStep: this.lastStep.bind(this) };var classes = this.state.classes;var childrenWithProps = React.Children.map(this.props.children, function (child, i) {
        props.animate = classes[i];return React.cloneElement(child, props);
      });return React.createElement('div', { className: _styles2.default['step-wizard'] }, childrenWithProps);
    } }]);return StepWizard;
}(React.Component);var Step = exports.Step = function (_React$Component2) {
  _inherits(Step, _React$Component2);function Step() {
    _classCallCheck(this, Step);return _possibleConstructorReturn(this, (Step.__proto__ || Object.getPrototypeOf(Step)).apply(this, arguments));
  }_createClass(Step, [{ key: 'render', value: function render() {
      var content = React.cloneElement(this.props.children, this.props);return React.createElement('div', { className: _styles2.default.step + ' ' + this.props.animate }, content);
    } }]);return Step;
}(React.Component);

//# sourceMappingURL=index.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(1)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../css-loader/index.js?modules&importLoaders=1!../../../../../sass-loader/lib/loader.js!../../../../../postcss-loader/index.js!./animate.custom.css", function() {
			var newContent = require("!!../../../../../css-loader/index.js?modules&importLoaders=1!../../../../../sass-loader/lib/loader.js!../../../../../postcss-loader/index.js!./animate.custom.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)();
// imports


// module
exports.push([module.i, "/** \n * Snippets from animate.css\n * Credit goes to https://github.com/daneden\n * github.com/daneden/animate.css\n*/\n.wDMxhKE8cs4fah3IcNRAI {\n  -webkit-animation-duration: 1s;\n  animation-duration: 1s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both; }\n\n/** fadeInRight */\n@-webkit-keyframes _2IeW9SGBKG5yu1esFJlw-g {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0); }\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none; } }\n\n@keyframes _2IeW9SGBKG5yu1esFJlw-g {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0); }\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none; } }\n\n._2IeW9SGBKG5yu1esFJlw-g {\n  -webkit-animation-name: _2IeW9SGBKG5yu1esFJlw-g;\n  animation-name: _2IeW9SGBKG5yu1esFJlw-g; }\n\n/** fadeInLeft */\n@-webkit-keyframes URmwQh5eRVIxLqXKvdYrQ {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0); }\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none; } }\n\n@keyframes URmwQh5eRVIxLqXKvdYrQ {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0); }\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none; } }\n\n.URmwQh5eRVIxLqXKvdYrQ {\n  -webkit-animation-name: URmwQh5eRVIxLqXKvdYrQ;\n  animation-name: URmwQh5eRVIxLqXKvdYrQ; }\n\n/** fadeOutRight */\n@-webkit-keyframes _3_dy0Vr4n3odGG_zjbZWIn {\n  from {\n    opacity: 1; }\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0); } }\n\n@keyframes _3_dy0Vr4n3odGG_zjbZWIn {\n  from {\n    opacity: 1; }\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0); } }\n\n._3_dy0Vr4n3odGG_zjbZWIn {\n  -webkit-animation-name: _3_dy0Vr4n3odGG_zjbZWIn;\n  animation-name: _3_dy0Vr4n3odGG_zjbZWIn; }\n\n/** fadeOutLeft */\n@-webkit-keyframes _1-yfm1mSMS3OtWBXbdO7Jx {\n  from {\n    opacity: 1; }\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0); } }\n\n@keyframes _1-yfm1mSMS3OtWBXbdO7Jx {\n  from {\n    opacity: 1; }\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0); } }\n\n._1-yfm1mSMS3OtWBXbdO7Jx {\n  -webkit-animation-name: _1-yfm1mSMS3OtWBXbdO7Jx;\n  animation-name: _1-yfm1mSMS3OtWBXbdO7Jx; }\n", ""]);

// exports
exports.locals = {
	"animated": "wDMxhKE8cs4fah3IcNRAI",
	"fadeInRight": "_2IeW9SGBKG5yu1esFJlw-g",
	"fadeInLeft": "URmwQh5eRVIxLqXKvdYrQ",
	"fadeOutRight": "_3_dy0Vr4n3odGG_zjbZWIn",
	"fadeOutLeft": "_1-yfm1mSMS3OtWBXbdO7Jx"
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(1)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../css-loader/index.js?modules&importLoaders=1!../../../../../sass-loader/lib/loader.js!../../../../../postcss-loader/index.js!./styles.css", function() {
			var newContent = require("!!../../../../../css-loader/index.js?modules&importLoaders=1!../../../../../sass-loader/lib/loader.js!../../../../../postcss-loader/index.js!./styles.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)();
// imports


// module
exports.push([module.i, "/** Step Wizard */\n._1QIZJNwe9ve7uwjV3Jnyqe {\n  position: relative;\n  min-height: 400px; }\n\n._3IoK2KmVyjKeSrVAOCsfvV {\n  width: 100%;\n  -webkit-animation-duration: 0.6s;\n  animation-duration: 0.6s; }\n\n._2X9_k99WD9eSrnrx5aXTnq {\n  display: none; }\n", ""]);

// exports
exports.locals = {
	"step-wizard": "_1QIZJNwe9ve7uwjV3Jnyqe",
	"step": "_3IoK2KmVyjKeSrVAOCsfvV",
	"hide": "_2X9_k99WD9eSrnrx5aXTnq"
};

/***/ })
/******/ ]);