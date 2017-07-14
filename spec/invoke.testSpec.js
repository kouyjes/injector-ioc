var Injector = require('../dest/Injector.js').Injector;
describe("injector invoke", function() {
    var injector;
    beforeEach(function () {
        injector = new Injector();
    });
    function serviceA(){
        this.getText = function () {
            return 'serviceA';
        }
    }

    it('injector invoke', function () {

        injector.service('serviceA',serviceA);
        injector.invoke(function () {
            console.log('invoke a function without arg !');
        });
        injector.invoke(['serviceA',function(sA){
            expect(sA.getText()).toEqual('serviceA');
        }]);
        injector.invoke([serviceA,function(sA){
            expect(sA.getText()).toEqual('serviceA');
        }]);
    });
});