(function (doc) {
  'use strict';

  function DOM(elements) {
    this.element = doc.querySelectorAll(elements);
  }

  DOM.prototype.on = function on(eventType, callback) {
    Array.prototype.forEach.call(this.element, function (element) {
      element.addEventListener(eventType, callback, false);
    })
  };

  DOM.prototype.off = function off(eventType, callback) {
    Array.prototype.forEach.call(this.element, function (element) {
      element.removeEventListener(eventType, callback);
    })
  };

  DOM.prototype.get = function get(index) {
    if (!index)
      return this.element[0];
    return this.element[index];
  };

  DOM.prototype.forEach = function forEach() {
    return Array.prototype.forEach.apply(this.element, arguments);
  };

  DOM.prototype.map = function map() {
    return Array.prototype.map.apply(this.element, arguments);
  };

  DOM.prototype.filter = function filter() {
    return Array.prototype.filter.apply(this.element, arguments);
  };

  DOM.prototype.reduce = function reduce() {
    return Array.prototype.reduce.apply(this.element, arguments);
  };

  DOM.prototype.reduceRight = function reduceRight() {
    return Array.prototype.reduceRight.apply(this.element, arguments);
  };

  DOM.prototype.every = function every() {
    return Array.prototype.every.apply(this.element, arguments);
  };

  DOM.prototype.some = function some() {
    return Array.prototype.some.apply(this.element, arguments);
  };

  DOM.is = function is(value) {
    return Object.prototype.toString.call(value);
  }

  DOM.isArray = function (array) {
    return this.is(array) === '[object Array]';
  }

  DOM.isObject = function (obj) {
    return this.is(obj) === '[object Object]';
  }

  DOM.isFunction = function (func) {
    return this.is(func) === '[object Function]';
  }

  DOM.isNumber = function (number) {
    return this.is(number) === '[object Number]';
  }

  DOM.isString = function (string) {
    return this.is(string) === '[object String]';
  }

  DOM.isBoolean = function (boolean) {
    return this.is(boolean) === '[object Boolean]';
  }

  DOM.isNull = function (nullOrUndefined) {
    return this.is(nullOrUndefined) === '[object Null]'
      || this.is(nullOrUndefined) === '[object Undefined]';
  }
  window.DOM = DOM;
})(document);
