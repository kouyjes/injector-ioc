var Injector = (function () {
    var ARROW_ARG = /^([^\(]+?)=>/;
    var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


    function template(text){
        var args = Array.prototype.slice.call(arguments,1);
        return text.replace(/\{\s*(\d+)\s*\}/g, function (all,argIndex) {
            return args[argIndex] || '';
        });
    }
    function error(text){
        var text = template.apply(this,arguments);
        var e = new Error(text);
        throw e;
    }
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
        return typeof fn === 'function';
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
        return $injector;
    }

    function enforceFunction(fn){
        if(!isFunction(fn)){
            error('define must be a function !');
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
        if(!define){
            define = name;
            name = null;
        }
        defineFn = enforceDefineFn(define);
        var $injectorName = name || generateInjectorName();
        defineFn[Injector.beanNameIdentify] = $injectorName;
        return defineFn;
    }
    function initGetParam(val){
        if(isFunction(val)){
            return val[Injector.beanNameIdentify];
        }
        if(isString(val)){
            return val;
        }
        error('arg : {0} is invalid !',val);
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
    Cache.prototype.remove = function (key) {
        delete this.cache[key];
    };
    var slice = Array.prototype.slice;
    function Injector(injector){
        var _ = this;
        this.super = injector ? [].concat(injector) : [];
        var injectorExtend = createInjector();
        Object.assign(this,injectorExtend);

        function get(method,params){
            var val = method.apply(_,params);
            if(!val){
                _.super.some(function (injector) {
                    val = method.apply(injector,params);
                    return !!val;
                });
            }
            return val;
        }
        ['getService','getFactory','getProvider'].forEach(function (methodName) {
            _[methodName] = function () {
                var params = slice.call(arguments,0);
                return get(injectorExtend[methodName],params);
            };
        });
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
            var _ = this;
            var args = (defineFn.$injector || []).map(function (dep) {
                var depValue = getFn.call(_,dep);
                if(!depValue){
                    error('Dependence : {0} not found !',dep);
                }
                return depValue;
            });
            return new (Function.prototype.bind.apply(defineFn,[null].concat(args)))();

        }
        function getProvider(name){
            var providerName = name + providerSuffix;
            var provider = providerCache.get(providerName);
            return provider || null;
        }
        var initPath = [];
        function getFactory(name){
            name = initGetParam(name);
            var provider = this.getProvider(name);
            if(!provider){
                return null;
            }
            if(initPath.indexOf(name) >= 0){
                error('Circular dependence: {0} ' + initPath.join(' <-- '));
            }
            initPath.unshift(name);
            try{
                var factory = invokeFunction('$get',provider,undefined);
                return factory || null;
            }finally {
                initPath.shift();
            }
        }
        function getService(arg){
            var service;
            var name = initGetParam(arg);
            service = instanceCache.get(name);
            if(service === undefined){
                try{
                    service = this.getFactory(arg);
                    instanceCache.put(name,service);
                }catch (e){
                    instanceCache.remove(name);
                    throw e;
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
            var _provider = this.initiate(providerFn,this['getProvider']);
            if(!isFunction(_provider['$get'])){
                error('Provider must define a $get function !');
            }
            providerCache.put(providerName,_provider);

            return this;

        }

        function factory(name,define){
            var _ = this;
            var factory = initDefineFnWithParams(name,define);
            return provider.call(this,factory[Injector.beanNameIdentify],{
                $get: function () {
                    return _.initiate(factory,_['getFactory']);
                }
            });
        }
        function service(name,define){
            var _ = this;
            var service = initDefineFnWithParams(name,define);
            return factory.call(this,service[Injector.beanNameIdentify],function () {
                return _.initiate(service,_['getService']);
            });
        }

        return {
            initiate:initiate,
            service:service,
            factory:factory,
            getService:getService,
            getFactory:getFactory,
            getProvider:getProvider,
            provider:provider
        };

    }

    return Injector;
})();
