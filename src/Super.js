/**
 * injector collection
 * @param injectors
 * @constructor
 */
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

export { Super }