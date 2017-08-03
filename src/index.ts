var slice = Array.prototype.slice;
import util from './util';
import { Super } from './Super';
import { createInjector } from './injector';
import { ArrayList } from './ArrayList';
import { CircularCheck } from './CircularCheck';

var InjectorId = util._nextId();

var _config = {
    debugMode:true,
    injectorIdentifyKey:'$injectorName',
    injectorDepIdentifyKey:'$injector'
};
class Injector extends CircularCheck{
    name:Function;
    parent:Super;
    static config:Function;
    static freezeConfig = function () {
        Injector.config = function (name) {
            if(arguments.length === 0){
                return {
                    debugMode:_config.debugMode,
                    injectorIdentifyKey:_config.injectorIdentifyKey,
                    injectorDepIdentifyKey:_config.injectorDepIdentifyKey
                };
            }
            if(util.isString(name)){
                return _config[name];
            }
        }
    }

    /**
     * debugMode check
     * @returns {boolean}
     */
    static debugMode() {
        return _config.debugMode;
    }

    /**
     * config Injector global info
     * @param name
     * @param val
     * @returns {any}
     */
    static config(name,val) {
        var config = {};
        if(arguments.length === 1){
            if(util.isString(name)){
                return _config[name];
            }else if(util.isObject(name)){
                config = name;
            }
        }else{
            if(!util.isString(name)){
                util.error('arg {0} is invalid !',name);
            }
            config[name] = val;
        }
        if(!val && util.isObject(name)){
            config = name;
        }
        if(!config){
            return;
        }
        Object.keys(config).forEach(function (key) {
            if(!_config.hasOwnProperty(key)){
                return;
            }
            var val = config[key];
            if(typeof val === typeof _config[key]){
                _config[key] = val;
            }
        });
    }
    static identify(fn,value) {
        if(arguments.length === 1){
            return fn[_config.injectorIdentifyKey];
        }
        if(arguments.length === 2){
            fn[_config.injectorIdentifyKey] = value;
            return fn;
        }
    }
    static depInjector(fn,injectors) {
        if(arguments.length === 1){
            return fn[_config.injectorDepIdentifyKey];
        }
        var $injectors = [];
        function appendInjector(injector){
            if(util.isArray(injector)){
                injector.forEach(appendInjector);
            }else if(util.isString(injector) || util.isFunction(injector)){
                $injectors.push(injector);
            }else{
                util.error('injector: {0} is invalid !' + injector);
            }
        }
        appendInjector(slice.call(arguments,1));
        fn[_config.injectorDepIdentifyKey] = $injectors;
    }
    constructor(){
        super();
        var _name = util.template('InjectorInstance_{0}',InjectorId());
        this.name = function (name) {
            if(arguments.length === 0){
                return _name;
            }
            _name = name;
            return this;
        };
        this.init.apply(this,arguments);
    }
    private init(){
        var injectors = [];
        slice.call(arguments,0).forEach(function (arg) {
            if(util.isArray(arg)){
                arg.forEach(function (ar) {
                    if(ar instanceof Injector){
                        injectors.push(ar);
                    }
                });
                return;
            }
            if(arg instanceof Injector){
                injectors.push(arg);
            }
        });
        this.parent = new Super<Injector>(injectors)
        this.extendMethod();

        Injector.freezeConfig();
    }
    private extendMethod(){

        var injectorExtend = createInjector();
        Object.assign(this,injectorExtend);
        ['getValue','getService','getFactory','getProvider'].forEach((methodName) => {

            this.parent[methodName] = function () {
                var params = slice.call(arguments,0);
                return this.invokeMethod(methodName,params);
            };
            this[methodName] = function () {

                var params = slice.call(arguments,0);
                var val = injectorExtend[methodName].apply(this,params);
                if(val){
                    return val;
                }
                return this.parent[methodName].apply(this.parent,params);
            };
        });
    }
}

export { Injector }