import { Injector } from './index';
import { ArrayList } from './ArrayList';
/**
 * injector collection
 * @param injectors
 * @constructor
 */
class Super<T> extends ArrayList<T>{

    constructor(items:T[] = []) {
        super();
        Array.prototype.push.apply(this.__list__,items);
    }

    invokeMethod(methodName, params) {
        var val = null;
        this.__list__.some(function (injector) {
            val = injector[methodName].apply(injector, params);
            return !!val;
        });
        return val;
    }
}
export { Super }