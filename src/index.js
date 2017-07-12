var slice = Array.prototype.slice;
import { _nextId,template,isArray,isString,error,isObject } from './util';
import { Super } from './Super';
import { createInjector } from './injector';
var InjectorId = _nextId();
function Injector(){
    var _ = this;
    var _name = template('InjectorInstance_{0}',InjectorId());
    this.name = function (name) {
        if(arguments.length === 0){
            return _name;
        }
        _name = name;
        return this;
    };
    var injectors = [];
    slice.call(arguments,0).forEach(function (arg) {
        if(isArray(arg)){
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
    this.super = new Super(injectors)
    var injectorExtend = createInjector(this);
    Object.assign(this,injectorExtend);

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
    var _config = {
        injectorIdentifyKey:'$injectorName',
        injectorDepIdentifyKey:'$injector'
    };
    Injector.config = function (name,val) {
        var config = {};
        if(arguments.length === 1){
            if(isString(name)){
                return _config[name];
            }else if(isObject(name)){
                config = name;
            }
        }else{
            if(!isString(name)){
                error('arg {0} is invalid !',name);
            }
            config[name] = val;
        }
        if(!val && isObject(name)){
            config = name;
        }else{

        }
        if(!config){
            return;
        }
        Object.keys(config).forEach(function (key) {
            if(!_config.hasOwnProperty(key)){
                return;
            }
            var val = config[key];
            if(val && isString(val)){
                _config[key] = val;
            }
        });
    };
    Injector.identify = function (fn,value) {
        if(arguments.length === 1){
            return fn[_config.injectorIdentifyKey];
        }
        if(arguments.length === 2){
            fn[_config.injectorIdentifyKey] = value;
            return fn;
        }
    };
    Injector.depInjector = function (fn,injectors) {
        if(arguments.length === 1){
            return fn[_config.injectorDepIdentifyKey];
        }
        if(arguments.length === 2 && isArray(injectors)){
            return fn[_config.injectorDepIdentifyKey] = injectors;
        }
    };

})();

export { Injector }