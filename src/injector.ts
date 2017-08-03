/**
 * Created by koujp on 2017/7/08.
 */
import { Injector } from './index';
import util from './util';
import { Cache } from './Cache';
import {extractParameter } from './parser';
import { ArrayList } from './ArrayList';

function enforceDefineFn(define) {
    var $injector = [], defineFn = null;
    if (util.isArray(define)) {
        defineFn = define.pop();
        util.enforceFunction(defineFn);
        $injector = define.slice();
    } else {
        defineFn = define;
        util.enforceFunction(defineFn);
        $injector = Injector.depInjector(defineFn) || (Injector.debugMode() ? extractParameter(define) : []);
    }
    Injector.depInjector(defineFn, $injector);
    return defineFn;
}

function initDefineFnWithParams(name, define) {
    var defineFn;
    if (!define) {
        define = name;
        name = null;
    }
    defineFn = enforceDefineFn(define);
    var $injectorName = Injector.identify(defineFn) ? String(Injector.identify(defineFn)) : null;
    $injectorName = name || $injectorName || nextInjectorName();
    Injector.identify(defineFn, $injectorName);
    return defineFn;
}
function initGetParam(val) {
    if (util.isFunction(val)) {
        return Injector.identify(val);
    }
    if (util.isString(val)) {
        return val;
    }
    util.error('arg : {0} is invalid !', val);
}
var nextInjectorName = util.nextInjectorNameFn();
function createInjector() {

    var providerCache = new Cache(),
        instanceCache = new Cache();

    var serviceIndex = Object.create(null),
        valueIndex = Object.create(null);

    function invokeFunction(method, context, params) {
        var fn = context[method];
        return fn.apply(context, params);
    }

    function initiate(defineFn, getFn, fnInit) {
        var args = (Injector.depInjector(defineFn) || []).map((dep) => {
            var depValue = getFn.call(this, dep);
            if (!depValue) {
                util.error('Dependence : {0} not found !', dep);
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

    var initPath = new ArrayList<String>();

    function getFactory(name) {
        name = initGetParam(name);
        var provider = this['getProvider'](name);
        if (!provider) {
            return null;
        }
        if (initPath.has(name)) {
            util.error('Circular dependence: {0} ' + initPath.items().join(' <-- '));
        }
        initPath.unshift(name);
        try {
            var factory = invokeFunction('$get', provider, undefined);
            return factory || null;
        } finally {
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
            util.error('injector name : {0} has defined !', name);
        }
    }

    function provider(name, provider) {

        if (!util.isString(name)) {
            util.error('provider arg {0} name must be a string type !', name);
        }
        !valueIndex[name] && assertNotExist(name);
        var providerName = providerNameSuffix(name);
        var providerFn = null;
        if (util.isFunction(provider) || util.isArray(provider)) {
            providerFn = enforceDefineFn(provider);
        } else {
            providerFn = util.enforceReturnFunction(provider);
        }
        var _provider = initiate.call(this, providerFn, this['getProvider']);
        if (!util.isFunction(_provider['$get'])) {
            util.error('Provider must define a $get function !');
        }
        providerCache.put(providerName, _provider);

        return this;

    }

    function factory(name, define) {
        var factory = initDefineFnWithParams(name, define);
        return provider.call(this, Injector.identify(factory), {
            $get: () => {
                return initiate.call(this, factory, this['getFactory'], true);
            }
        });
    }

    function service(name, define) {
        var service = initDefineFnWithParams(name, define);
        name = Injector.identify(service);
        var result = factory.call(this, name, () => {
            return initiate.call(this, service, this['getService']);
        });
        serviceIndex[name] = true;
        return result;
    }

    function value(name, val) {
        util.isString(name, true);
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

export { createInjector };
