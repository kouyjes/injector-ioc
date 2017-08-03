(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.HERE = global.HERE || {})));
}(this, (function (exports) { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var util;
(function (util) {
    function template(text) {
        var args = Array.prototype.slice.call(arguments, 1);
        return text.replace(/\{\s*(\d+)\s*\}/g, function (all, argIndex) {
            return args[argIndex] || '';
        });
    }
    util.template = template;
    function error(text) {
        var text = template.apply(this, arguments);
        var e = new Error(text);
        throw e;
    }
    util.error = error;
    function isObject(value) {
        return value !== null && typeof value === 'object';
    }
    util.isObject = isObject;
    util.isArray = Array.isArray || function (array) {
        return array instanceof Array;
    };
    function isBoolean(value) {
        return typeof value === 'boolean';
    }
    util.isBoolean = isBoolean;
    function isString(value, throwError) {
        var result = typeof value === 'string';
        if (!result && throwError) {
            error('arg {0} must be string type !', value);
        }
        return result;
    }
    util.isString = isString;
    function isFunction(fn) {
        return typeof fn === 'function';
    }
    util.isFunction = isFunction;
    function forEach(obj, iterator, context) {
        Object.keys(obj).forEach(function (key) {
            var value = obj[key];
            iterator.call(context, value, key);
        });
    }
    util.forEach = forEach;
    function _nextId() {
        var _id = 1;
        return function () {
            return _id++;
        };
    }
    util._nextId = _nextId;
    function nextInjectorNameFn() {
        var nextId = _nextId();
        return function () {
            return 'injector_' + nextId();
        };
    }
    util.nextInjectorNameFn = nextInjectorNameFn;
    function enforceFunction(fn) {
        if (!isFunction(fn)) {
            error('define must be a function !');
        }
        return fn;
    }
    util.enforceFunction = enforceFunction;
    function enforceReturnFunction(fn) {
        if (isFunction(fn)) {
            return fn;
        }
        return function () {
            return fn;
        };
    }
    util.enforceReturnFunction = enforceReturnFunction;
})(util || (util = {}));
var util$1 = util;

var ArrayList = (function () {
    function ArrayList(list) {
        if (list === void 0) { list = []; }
        this.__list__ = [];
        Array.prototype.push.apply(this.__list__, list);
    }
    ArrayList.prototype.indexOf = function (value) {
        return this.__list__.indexOf(value);
    };
    ArrayList.prototype.has = function (value) {
        return this.indexOf(value) >= 0;
    };
    ArrayList.prototype.push = function (value) {
        return this.__list__.push(value);
    };
    ArrayList.prototype.pop = function () {
        return this.__list__.pop();
    };
    ArrayList.prototype.unshift = function (value) {
        return this.__list__.unshift(value);
    };
    ArrayList.prototype.shift = function () {
        return this.__list__.shift();
    };
    ArrayList.prototype.items = function () {
        return this.__list__;
    };
    ArrayList.prototype.remove = function (value) {
        var index = this.indexOf(value);
        if (index >= 0) {
            this.__list__.splice(index, 1);
            return value;
        }
    };
    ArrayList.prototype.empty = function () {
        this.__list__.length = 0;
    };
    return ArrayList;
}());

/**
 * injector collection
 * @param injectors
 * @constructor
 */
var Super = (function (_super) {
    __extends(Super, _super);
    function Super(items) {
        if (items === void 0) { items = []; }
        _super.call(this);
        Array.prototype.push.apply(this.__list__, items);
    }
    Super.prototype.invokeMethod = function (methodName, params) {
        var val = null;
        this.__list__.some(function (injector) {
            val = injector[methodName].apply(injector, params);
            return !!val;
        });
        return val;
    };
    return Super;
}(ArrayList));

var CircularCheck = (function () {
    function CircularCheck() {
        this.__invoking__ = false;
    }
    CircularCheck.prototype.invoke = function (fn) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        if (this.__invoking__) {
            throw new Error('Circular invoked ' + this);
        }
        this.__invoking__ = true;
        var result = fn.apply(this, params);
        this.__invoking__ = false;
        return result;
    };
    return CircularCheck;
}());

var slice$1 = Array.prototype.slice;
var InjectorId$1 = util$1._nextId();
var _config$1 = {
    debugMode: true,
    injectorIdentifyKey: '$injectorName',
    injectorDepIdentifyKey: '$injector'
};
var Injector$1 = (function (_super) {
    __extends(Injector, _super);
    function Injector() {
        _super.call(this);
        var _name = util$1.template('InjectorInstance_{0}', InjectorId$1());
        this.name = function (name) {
            if (arguments.length === 0) {
                return _name;
            }
            _name = name;
            return this;
        };
        this.init.apply(this, arguments);
    }
    /**
     * debugMode check
     * @returns {boolean}
     */
    Injector.debugMode = function () {
        return _config$1.debugMode;
    };
    /**
     * config Injector global info
     * @param name
     * @param val
     * @returns {any}
     */
    Injector.config = function (name, val) {
        var config = {};
        if (arguments.length === 1) {
            if (util$1.isString(name)) {
                return _config$1[name];
            }
            else if (util$1.isObject(name)) {
                config = name;
            }
        }
        else {
            if (!util$1.isString(name)) {
                util$1.error('arg {0} is invalid !', name);
            }
            config[name] = val;
        }
        if (!val && util$1.isObject(name)) {
            config = name;
        }
        if (!config) {
            return;
        }
        Object.keys(config).forEach(function (key) {
            if (!_config$1.hasOwnProperty(key)) {
                return;
            }
            var val = config[key];
            if (typeof val === typeof _config$1[key]) {
                _config$1[key] = val;
            }
        });
    };
    Injector.identify = function (fn, value) {
        if (arguments.length === 1) {
            return fn[_config$1.injectorIdentifyKey];
        }
        if (arguments.length === 2) {
            fn[_config$1.injectorIdentifyKey] = value;
            return fn;
        }
    };
    Injector.depInjector = function (fn, injectors) {
        if (arguments.length === 1) {
            return fn[_config$1.injectorDepIdentifyKey];
        }
        var $injectors = [];
        function appendInjector(injector) {
            if (util$1.isArray(injector)) {
                injector.forEach(appendInjector);
            }
            else if (util$1.isString(injector) || util$1.isFunction(injector)) {
                $injectors.push(injector);
            }
            else {
                util$1.error('injector: {0} is invalid !' + injector);
            }
        }
        appendInjector(slice$1.call(arguments, 1));
        fn[_config$1.injectorDepIdentifyKey] = $injectors;
    };
    Injector.prototype.init = function () {
        var injectors = [];
        slice$1.call(arguments, 0).forEach(function (arg) {
            if (util$1.isArray(arg)) {
                arg.forEach(function (ar) {
                    if (ar instanceof Injector) {
                        injectors.push(ar);
                    }
                });
                return;
            }
            if (arg instanceof Injector) {
                injectors.push(arg);
            }
        });
        this.parent = new Super(injectors);
        this.extendMethod();
        Injector.freezeConfig();
    };
    Injector.prototype.extendMethod = function () {
        var _this = this;
        var injectorExtend = createInjector();
        Object.assign(this, injectorExtend);
        ['getValue', 'getService', 'getFactory', 'getProvider'].forEach(function (methodName) {
            _this.parent[methodName] = function () {
                var params = slice$1.call(arguments, 0);
                return this.invokeMethod(methodName, params);
            };
            _this[methodName] = function () {
                var params = slice$1.call(arguments, 0);
                var val = injectorExtend[methodName].apply(this, params);
                if (val) {
                    return val;
                }
                return this.parent[methodName].apply(this.parent, params);
            };
        });
    };
    Injector.freezeConfig = function () {
        Injector.config = function (name) {
            if (arguments.length === 0) {
                return {
                    debugMode: _config$1.debugMode,
                    injectorIdentifyKey: _config$1.injectorIdentifyKey,
                    injectorDepIdentifyKey: _config$1.injectorDepIdentifyKey
                };
            }
            if (util$1.isString(name)) {
                return _config$1[name];
            }
        };
    };
    return Injector;
}(CircularCheck));

var Cache = (function () {
    function Cache(parent) {
        this.parent = [];
        this.cache = {};
        if (parent) {
            this.parent = this.parent.concat(parent);
        }
    }
    Cache.prototype.get = function (key) {
        var value = this.cache[key];
        if (value) {
            return value;
        }
        this.parent.some(function (cache) {
            value = cache.get(key);
            return !!value;
        });
        return value;
    };
    Cache.prototype.put = function (key, value) {
        this.cache[key] = value;
    };
    Cache.prototype.remove = function (key) {
        delete this.cache[key];
    };
    Cache.prototype.has = function (key) {
        return this.cache.hasOwnProperty(key);
    };
    return Cache;
}());

/**
 * parser
 * parse function parameter
 * @type {RegExp}
 */
var ARROW_ARG = /^([^\(]+?)=>/;
var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function extractParameter(fn) {
    var fnText = fn.toString().replace(STRIP_COMMENTS, '');
    var args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
    var $injector = [];
    args[1].split(FN_ARG_SPLIT).forEach(function (arg) {
        arg.replace(FN_ARG, function (all, fix, name) {
            $injector.push(name);
        });
    });
    return $injector;
}

function enforceDefineFn(define) {
    var $injector = [], defineFn = null;
    if (util$1.isArray(define)) {
        defineFn = define.pop();
        util$1.enforceFunction(defineFn);
        $injector = define.slice();
    }
    else {
        defineFn = define;
        util$1.enforceFunction(defineFn);
        $injector = Injector$1.depInjector(defineFn) || (Injector$1.debugMode() ? extractParameter(define) : []);
    }
    Injector$1.depInjector(defineFn, $injector);
    return defineFn;
}
function initDefineFnWithParams(name, define) {
    var defineFn;
    if (!define) {
        define = name;
        name = null;
    }
    defineFn = enforceDefineFn(define);
    var $injectorName = Injector$1.identify(defineFn) ? String(Injector$1.identify(defineFn)) : null;
    $injectorName = name || $injectorName || nextInjectorName();
    Injector$1.identify(defineFn, $injectorName);
    return defineFn;
}
function initGetParam(val) {
    if (util$1.isFunction(val)) {
        return Injector$1.identify(val);
    }
    if (util$1.isString(val)) {
        return val;
    }
    util$1.error('arg : {0} is invalid !', val);
}
var nextInjectorName = util$1.nextInjectorNameFn();
function createInjector() {
    var providerCache = new Cache(), instanceCache = new Cache();
    var serviceIndex = Object.create(null), valueIndex = Object.create(null);
    function invokeFunction(method, context, params) {
        var fn = context[method];
        return fn.apply(context, params);
    }
    function initiate(defineFn, getFn, fnInit) {
        var _this = this;
        var args = (Injector$1.depInjector(defineFn) || []).map(function (dep) {
            var depValue = getFn.call(_this, dep);
            if (!depValue) {
                util$1.error('Dependence : {0} not found !', dep);
            }
            return depValue;
        });
        if (fnInit) {
            return (Function.prototype.bind.apply(defineFn, [null].concat(args)))();
        }
        return new (Function.prototype.bind.apply(defineFn, [null].concat(args)))();
    }
    function providerNameSuffix(name) {
        var providerSuffix = '_$Provider';
        return name + providerSuffix;
    }
    function getProvider(name) {
        var providerName = providerNameSuffix(name);
        var provider = providerCache.get(providerName);
        return provider || null;
    }
    var initPath = new ArrayList();
    function getFactory(name) {
        name = initGetParam(name);
        var provider = this['getProvider'](name);
        if (!provider) {
            return null;
        }
        if (initPath.has(name)) {
            util$1.error('Circular dependence: {0} ' + initPath.items().join(' <-- '));
        }
        initPath.unshift(name);
        try {
            var factory = invokeFunction('$get', provider, undefined);
            return factory || null;
        }
        finally {
            initPath.shift();
        }
    }
    function getService(arg) {
        var service;
        var name = initGetParam(arg);
        service = instanceCache.get(name);
        var isServiceDefine = serviceIndex[name];
        if (!existDefine(name) && !service) {
            service = this.parent.getService(name);
        }
        if (!service) {
            service = this['getFactory'](arg);
            isServiceDefine && instanceCache.put(name, service);
        }
        return service;
    }
    function getValue(name) {
        return this['getFactory'](name);
    }
    function existDefine(name) {
        name = initGetParam(name);
        var providerName = providerNameSuffix(name);
        return providerCache.has(providerName);
    }
    function assertNotExist(name) {
        name = initGetParam(name);
        if (existDefine(name)) {
            util$1.error('injector name : {0} has defined !', name);
        }
    }
    function provider(name, provider) {
        if (!util$1.isString(name)) {
            util$1.error('provider arg {0} name must be a string type !', name);
        }
        !valueIndex[name] && assertNotExist(name);
        var providerName = providerNameSuffix(name);
        var providerFn = null;
        if (util$1.isFunction(provider) || util$1.isArray(provider)) {
            providerFn = enforceDefineFn(provider);
        }
        else {
            providerFn = util$1.enforceReturnFunction(provider);
        }
        var _provider = initiate.call(this, providerFn, this['getProvider']);
        if (!util$1.isFunction(_provider['$get'])) {
            util$1.error('Provider must define a $get function !');
        }
        providerCache.put(providerName, _provider);
        return this;
    }
    function factory(name, define) {
        var _this = this;
        var factory = initDefineFnWithParams(name, define);
        return provider.call(this, Injector$1.identify(factory), {
            $get: function () {
                return initiate.call(_this, factory, _this['getFactory'], true);
            }
        });
    }
    function service(name, define) {
        var _this = this;
        var service = initDefineFnWithParams(name, define);
        name = Injector$1.identify(service);
        var result = factory.call(this, name, function () {
            return initiate.call(_this, service, _this['getService']);
        });
        serviceIndex[name] = true;
        return result;
    }
    function value(name, val) {
        util$1.isString(name, true);
        var result = factory.call(this, name, function () {
            return val;
        });
        valueIndex[name] = true;
        return result;
    }
    function invoke(define) {
        var factory = initDefineFnWithParams(undefined, define);
        return initiate.call(this, factory, this['getFactory'], true);
    }
    function invokeService(define) {
        var service = initDefineFnWithParams(undefined, define);
        return initiate.call(this, service, this['getService']);
    }
    return {
        invoke: invoke,
        invokeService: invokeService,
        provider: provider,
        value: value,
        service: service,
        factory: factory,
        getProvider: getProvider,
        getValue: getValue,
        getService: getService,
        getFactory: getFactory
    };
}

var slice = Array.prototype.slice;
var InjectorId = util$1._nextId();
var _config = {
    debugMode: true,
    injectorIdentifyKey: '$injectorName',
    injectorDepIdentifyKey: '$injector'
};
var Injector = (function (_super) {
    __extends(Injector, _super);
    function Injector() {
        _super.call(this);
        var _name = util$1.template('InjectorInstance_{0}', InjectorId());
        this.name = function (name) {
            if (arguments.length === 0) {
                return _name;
            }
            _name = name;
            return this;
        };
        this.init.apply(this, arguments);
    }
    /**
     * debugMode check
     * @returns {boolean}
     */
    Injector.debugMode = function () {
        return _config.debugMode;
    };
    /**
     * config Injector global info
     * @param name
     * @param val
     * @returns {any}
     */
    Injector.config = function (name, val) {
        var config = {};
        if (arguments.length === 1) {
            if (util$1.isString(name)) {
                return _config[name];
            }
            else if (util$1.isObject(name)) {
                config = name;
            }
        }
        else {
            if (!util$1.isString(name)) {
                util$1.error('arg {0} is invalid !', name);
            }
            config[name] = val;
        }
        if (!val && util$1.isObject(name)) {
            config = name;
        }
        if (!config) {
            return;
        }
        Object.keys(config).forEach(function (key) {
            if (!_config.hasOwnProperty(key)) {
                return;
            }
            var val = config[key];
            if (typeof val === typeof _config[key]) {
                _config[key] = val;
            }
        });
    };
    Injector.identify = function (fn, value) {
        if (arguments.length === 1) {
            return fn[_config.injectorIdentifyKey];
        }
        if (arguments.length === 2) {
            fn[_config.injectorIdentifyKey] = value;
            return fn;
        }
    };
    Injector.depInjector = function (fn, injectors) {
        if (arguments.length === 1) {
            return fn[_config.injectorDepIdentifyKey];
        }
        var $injectors = [];
        function appendInjector(injector) {
            if (util$1.isArray(injector)) {
                injector.forEach(appendInjector);
            }
            else if (util$1.isString(injector) || util$1.isFunction(injector)) {
                $injectors.push(injector);
            }
            else {
                util$1.error('injector: {0} is invalid !' + injector);
            }
        }
        appendInjector(slice.call(arguments, 1));
        fn[_config.injectorDepIdentifyKey] = $injectors;
    };
    Injector.prototype.init = function () {
        var injectors = [];
        slice.call(arguments, 0).forEach(function (arg) {
            if (util$1.isArray(arg)) {
                arg.forEach(function (ar) {
                    if (ar instanceof Injector) {
                        injectors.push(ar);
                    }
                });
                return;
            }
            if (arg instanceof Injector) {
                injectors.push(arg);
            }
        });
        this.parent = new Super(injectors);
        this.extendMethod();
        Injector.freezeConfig();
    };
    Injector.prototype.extendMethod = function () {
        var _this = this;
        var injectorExtend = createInjector();
        Object.assign(this, injectorExtend);
        ['getValue', 'getService', 'getFactory', 'getProvider'].forEach(function (methodName) {
            _this.parent[methodName] = function () {
                var params = slice.call(arguments, 0);
                return this.invokeMethod(methodName, params);
            };
            _this[methodName] = function () {
                var params = slice.call(arguments, 0);
                var val = injectorExtend[methodName].apply(this, params);
                if (val) {
                    return val;
                }
                return this.parent[methodName].apply(this.parent, params);
            };
        });
    };
    Injector.freezeConfig = function () {
        Injector.config = function (name) {
            if (arguments.length === 0) {
                return {
                    debugMode: _config.debugMode,
                    injectorIdentifyKey: _config.injectorIdentifyKey,
                    injectorDepIdentifyKey: _config.injectorDepIdentifyKey
                };
            }
            if (util$1.isString(name)) {
                return _config[name];
            }
        };
    };
    return Injector;
}(CircularCheck));

exports.Injector = Injector;

Object.defineProperty(exports, '__esModule', { value: true });

})));
