namespace util {
    export function template(text) {
        var args = Array.prototype.slice.call(arguments, 1);
        return text.replace(/\{\s*(\d+)\s*\}/g, function (all, argIndex) {
            return args[argIndex] || '';
        });
    }

    export function error(text) {
        var text = template.apply(this, arguments);
        var e = new Error(text);
        throw e;
    }

    export function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    export var isArray = Array.isArray || function (array) {
            return array instanceof Array;
        };

    export function isBoolean(value) {
        return typeof value === 'boolean';
    }

    export function isString(value, throwError?) {
        var result = typeof value === 'string';
        if (!result && throwError) {
            error('arg {0} must be string type !', value);
        }
        return result;
    }

    export function isFunction(fn) {
        return typeof fn === 'function';
    }

    export function forEach(obj, iterator, context) {
        Object.keys(obj).forEach(function (key) {
            var value = obj[key];
            iterator.call(context, value, key);
        });
    }

    export function _nextId() {
        var _id = 1;
        return function () {
            return _id++;
        };
    }

    export function nextInjectorNameFn() {
        var nextId = _nextId();
        return function () {
            return 'injector_' + nextId();
        }
    }

    export function enforceFunction(fn) {
        if (!isFunction(fn)) {
            error('define must be a function !');
        }
        return fn;
    }

    export function enforceReturnFunction(fn) {
        if (isFunction(fn)) {
            return fn;
        }
        return function () {
            return fn;
        };
    }
}

export default util;