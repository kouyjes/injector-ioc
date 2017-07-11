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
        var $injectorName = Injector.identify(defineFn) ? String(Injector.identify(defineFn)) : null;
        $injectorName = name || $injectorName || nextInjectorName();
        Injector.identify(defineFn,$injectorName);
        return defineFn;
    }
    function initGetParam(val){
        if(isFunction(val)){
            return Injector.identify(val);
        }
        if(isString(val)){
            return val;
        }
        error('arg : {0} is invalid !',val);
    }
    function Cache(parent) {
        this.super = parent ? [].concat(parent) : [];
        this.cache = {};
    }
    Cache.prototype.get = function (key) {
        var value = this.cache[key];
        if(value){
            return value;
        }
        this.super.some(function (cache) {
            value = cache.get(key);
            return !!value;
        });
        return value;
    };
    Cache.prototype.put = function (key,value) {
        this.cache[key] = value;
    };
    Cache.prototype.remove = function (key) {
        delete this.cache[key];
    };
    Cache.prototype.has = function (key) {
        return this.cache.hasOwnProperty(key);
    };
    var slice = Array.prototype.slice;
    function Super(injectors){
        this.injectors = injectors ? [].concat(injectors) : [];
    }
    Super.prototype.invokeMethod = function (methodName,params) {
        var val = null;
        this.injectors.some(function (injector) {
            val = injector[methodName].apply(injector,params);
            return !!val;
        });
        return val;
    };
    var InjectorId = _nextId();
    function Injector(injector){
        var _ = this;
        var _name = template('InjectorInstance_{0}',InjectorId());
        this.name = function (name) {
            if(arguments.length === 0){
                return _name;
            }
            _name = name;
            return this;
        };
        this.super = new Super(injector)
        var injectorExtend = createInjector(this);
        Object.assign(this,injectorExtend);

        function get(methodName,params){
            var val = injectorExtend[methodName].apply(_,params);
            if(!val){
                val = _.super.invokeMethod(methodName,params);
            }
            return val;
        }
        ['getService','getFactory','getProvider'].forEach(function (methodName) {

            _.super[methodName] = function () {
                var params = slice.call(arguments,0);
                return this.invokeMethod(methodName,params);
            };
            _[methodName] = function () {
                var params = slice.call(arguments,0);
                var val = injectorExtend[methodName].apply(_,params);
                if(val){
                    return val;
                }
                return _.super[methodName].apply(_.super,params);
            };
        });
    }
    (function () {
        var injectorIdentifyKey = '$injectorName';
        Injector.identifyKey = function (key) {
            injectorIdentifyKey = key;
        };
        Injector.identifyKey = function () {
            return injectorIdentifyKey;
        };
        Injector.identify = function (fn,value) {
            if(arguments.length === 1){
                return fn[injectorIdentifyKey]; 
            }  
            if(arguments.length === 2){
                fn[injectorIdentifyKey] = value;
                return fn;
            }
        };
    })();
    function _nextId(){
        var _id = 1;
        return function () {
            return _id++;
        };
    }
    function nextInjectorNameFn(){
        var nextId = _nextId();
        return function () {
            return 'injector_' + nextId();
        }
    }
    var nextInjectorName = nextInjectorNameFn();
    function createInjector(){

        var providerCache = new Cache(),
            instanceCache = new Cache();

        var serviceIndex = Object.create(null);

        function invokeFunction(method,context,params){
            var fn = context[method];
            return fn.apply(context,params);
        }
        function initiate(defineFn,getFn,fnInit){
            var _ = this;
            var args = (defineFn.$injector || []).map(function (dep) {
                var depValue = getFn.call(_,dep);
                if(!depValue){
                    error('Dependence : {0} not found !',dep);
                }
                return depValue;
            });
            if(fnInit){
                return (Function.prototype.bind.apply(defineFn,[null].concat(args)))();
            }
            return new (Function.prototype.bind.apply(defineFn,[null].concat(args)))();

        }
        function providerNameSuffix(name){
            var providerSuffix = '_$Provider';
            return name + providerSuffix;
        }
        function getProvider(name){
            var providerName = providerNameSuffix(name);
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
            var isServiceDefine = serviceIndex[name];
            if(!existDefine(name) && !service){
                service = this.super.getService(name);
            }
            if(!service){
                service = this.getFactory(arg);
                isServiceDefine && instanceCache.put(name,service);
            }
            return service;
        }
        function existDefine(name){
            name = initGetParam(name);
            var providerName = providerNameSuffix(name);
            return providerCache.has(providerName);
        }
        function provider(name,provider){

            var providerName = providerNameSuffix(name);
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
            return provider.call(this,Injector.identify(factory),{
                $get: function () {
                    return _.initiate(factory,_['getFactory'],true);
                }
            });
        }
        function service(name,define){
            var _ = this;
            var service = initDefineFnWithParams(name,define);
            name = Injector.identify(service);
            serviceIndex[name] = true;
            return factory.call(this,name,function () {
                return _.initiate(service,_['getService']);
            });
        }

        function invoke(define){
            var factory = initDefineFnWithParams(undefined,define);
            return this.initiate(factory,this['getFactory']);
        }

        return {
            initiate:initiate,
            invoke:invoke,
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
