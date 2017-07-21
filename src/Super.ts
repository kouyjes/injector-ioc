import { Injector } from './index';
/**
 * injector collection
 * @param injectors
 * @constructor
 */
class Super {
    private injectors:Injector[] = [];

    constructor(injectors?) {
        if (injectors) {
            this.injectors = this.injectors.concat(injectors);
        }
    }

    invokeMethod(methodName, params) {
        var val = null;
        this.injectors.some(function (injector) {
            val = injector[methodName].apply(injector, params);
            return !!val;
        });
        return val;
    }
}
export { Super }