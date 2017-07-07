(function () {
    var ARROW_ARG = /^([^\(]+?)=>/;
    var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    function extractArgs(fn) {
        var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
            args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
        return args;
    }
    function isObject(){
        return value !== null && typeof value === 'object';
    }
    var isArray = Array.isArray || function (array) {
            return array instanceof Array;
        };
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
        args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
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
    function enforceFunction(value){
        if(isFunction(value)){
            return value;
        }
        return function (){
            return value;
        }
    }

    function enforceDefineFn(define){
        var $injector = [],defineFn = null;
        if(isArray(define)){
            defineFn = define.pop();
            $injector = define.slice();
        }else{
            define = enforceFunction(define);
            defineFn = define;
            $injector = defineFn.$injector || extractParameter(define);
        }
        defineFn.$injector = $injector;
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
    function createInjector(){

        var providerSuffix = '_$Provider';
        var providerCache = new Cache();
        var factoryCache = new Cache();


        function initiate(define,cache){
            var defineFn = enforceDefineFn(define);
            var args = defineFn.$injector.map(function (dep) {
                var depValue = cache.get(dep);
                if(!depValue){
                    throw new Error('Provider: ' + dep + ' not found !');
                }
                return depValue;
            });
            return new Function.prototype.bind.apply(defineFn,[null].concat(args))();

        }
        function getFactory(name){

        }
        function getService(name){

        }
        function provider(name,provider){

            var providerName = name + providerSuffix;
            if(arguments.length === 1){
                return providerCache[providerName] || null;
            }
            if(isFunction(provider) || isArray(provider)){
                provider = enforceDefineFn(provider);
            }
            if(!isFunction(provider.define)){
                throw new Error('Provider must has a define function !');
            }
            providerCache[providerName] = initiate(provider,providerCache);

        }

        function factory(name,factory){
            if(arguments.length === 1){
                return factoryCache[name] || null;
            }
            if(factoryCache.hasOwnProperty(name)){
                throw new Error('factory:' + name + 'has exist !');
            }
            factoryCache[name] = factory;
        }
    }

    Injector.prototype.factory = function (name,define) {
        if(arguments.length === 1){
            return this.factoryCache[name] || null;
        }
        if(this.factoryCache.hasOwnProperty(name)){
            throw new Error('factory:' + name + 'has exist !');
        }
        this.factoryCache[name] = define;
    };
    Injector.prototype.service = function (serviceName, serviceDefine) {

        var factoryCache = this.factoryCache;
        if (arguments.length === 1) {
            var serviceDefine = this.factoryCache[serviceName];
            if (!serviceDefine) {
                return null;
            }
            return serviceDefine();
        }
        var $injector = [], define = null;
        if (serviceDefine instanceof Array) {
            define = serviceDefine.pop();
            $injector = serviceDefine.slice();
        } else if (serviceDefine instanceof Function) {
            define = serviceDefine;
            if (define) {
                $injector = define.$injector || extractParameter(define);
            }
        }

        if (!define) {
            throw new TypeError('service define is invalid !');
        }

        define.$injector = $injector;
    }
})();
