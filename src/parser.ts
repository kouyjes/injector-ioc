/**
 * parser
 * parse function parameter
 * @type {RegExp}
 */
var ARROW_ARG = /^([^\(]+?)=>/;
var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

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

export { extractParameter };