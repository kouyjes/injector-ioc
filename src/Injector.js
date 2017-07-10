(function () {
    var ARROW_ARG = /^([^\(]+?)=>/;
    var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var INITING_STATE = 'initing_state';

    function isObject(value){
        return value !== null && typeof value === 'object';
    }
    var isArray = Array.isArray || function (array) {
            return array instanceof Array;
        };
    function isString(value){
        return typeof value === 'string';
    }
    function isFunction(fn){
        typeof fn === 'function';
    }
    function forEach(obj,iterator,context){
        Object.keys(obj).forEach(function (key) {
            var value = obj[key];
            iterator.call(context,value,key);
        });
    }
    function extractParameter(fn) {

        var fnText = fn.toString().replace(STRIP_COMMENTS, '');
        var args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
        var $injector = [];
        args[1].split(FN_ARG_SPLIT).forEach(function (arg) {
            arg.replace(FN_ARG, function (all, fix, name) {
                $injector.push(name);
            });
        });
    }
    function supportObject(delegate){
        return function (key,value) {
            if(isObject(key)){
                forEach(key, function (v,k) {
                    delegate(k,v);
                })
            }else{
                delegate(key,value);
            }
        };
    }

    function enforceFunction(fn){
        if(!isFunction(fn)){
            throw new Error('define must be a function !');
        }
       return fn;
    }
    function enforceReturnFunction(fn){
        if(isFunction(fn)){
           return fn;
        }
        return function () {
            return fn;
        };
    }
    function enforceDefineFn(define){
        var $injector = [],defineFn = null;
        if(isArray(define)){
            defineFn = define.pop();
            enforceFunction(defineFn);
            $injector = define.slice();
        }else{
            defineFn = define;
            enforceFunction(defineFn);
            $injector = defineFn.$injector || extractParameter(define);
        }
        defineFn.$injector = $injector;
        return defineFn;
    }

    function initDefineFnWithParams(name,define){
        var defineFn;
        if(arguments.length === 1){
            define = name;
            name = null;
        }
        defineFn = enforceDefineFn(define);
        var $injectorName = name || generateInjectorName();
        defineFn[Injector.beanNameIdentify] = $injectorName;
        return defineFn;
    }

    function Cache(parent) {
        this.super = parent;
        this.cache = {};
    }
    Cache.prototype.get = function (key) {
        var value = this.cache[key];
        if(value){
            return value;
        }
        if(this.super){
            return this.super.get(key);
        }
    };
    Cache.prototype.put = function (key,value) {
        this.cache[key] = value;
    };
    function Injector() {
        throw new Error('constructor is private !');
    }
    Injector.beanNameIdentify = '$injectorName';
    function nextInjectorName(){
        var _id = 1;
        return function () {
            return 'injector_' + (_id++);
        }
    }
    var generateInjectorName = nextInjectorName();
    function createInjector(){

        var providerSuffix = '_$Provider';
        var providerCache = new Cache();
        var instanceCache = new Cache();

        function invokeFunction(method,context,params){
            var fn = context[method];
            return fn.apply(context,params);
        }
        function initiate(defineFn,getFn){
            var args = (defineFn.$injector || []).map(function (dep) {
                var depValue = getFn(dep);
                if(!depValue){
                    throw new Error('Dependence : ' + dep + ' not found !');
                }
                return depValue;
            });
            return new Function.prototype.bind.apply(defineFn,[null].concat(args))();

        }
        function getProvider(name){
            var providerName = name + providerSuffix;
            var provider = providerCache[providerName];
            return provider || null;
        }
        function getFactory(name){
            var provider = getProvider(name);
            if(!provider){
                return null;
            }
            return invokeFunction('$get',provider,undefined);
        }
        function getService(arg){
            var service;
            var name = arg;
            if(isFunction(name)){
                name = name[Injector.beanNameIdentify];
            }
            if(!isString(name)){
                throw new Error('argument : ' + name + 'is invalid !');
            }
            service = instanceCache[name];
            if(service === INITING_STATE){
                throw new Error('Circular dependence !');
            }
            if(null !== service){
                instanceCache[name] = INITING_STATE;
                try{
                    service = getFactory(arg);
                    instanceCache[name] = service;
                }catch (e){
                    delete instanceCache[name];
                }
            }
            return service;
        }
        function provider(name,provider){

            var providerName = name + providerSuffix;
            var providerFn = null;
            if(isFunction(provider) || isArray(provider)){
                providerFn = enforceDefineFn(provider);
            }else{
                providerFn = enforceReturnFunction(provider);
            }
            var _provider = initiate(providerFn,getProvider);
            if(!isFunction(_provider['$get'])){
                throw new Error('Provider must define a $get function !');
            }
            providerCache[providerName] = _provider;

            return this;

        }

        function factory(name,define){

            var factory = initDefineFnWithParams(name,define);
            return provider(factory[Injector.beanNameIdentify],{
                $get: function () {
                    return initiate(factory,getFactory);
                }
            });
        }
        function service(name,define){
            var service = initDefineFnWithParams(name,define);
            return factory(function () {
                return initiate(service,getService);
            })
        }
    }
})();
