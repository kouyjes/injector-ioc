var Injector = require('../dest/Injector.js').Injector;
describe("injector invoke", function() {
    var injector;
    beforeEach(function () {
        injector = new Injector();
    });
    function serviceA(){
        var random = Math.random();
        this.getText = function () {
            return 'serviceA' + random;
        }
    }

    it('injector invoke', function () {

        injector.service('serviceA',serviceA);
        injector.invoke(function () {
            console.log('invoke a function without arg !');
        });
        var text1 = injector.invoke(['serviceA',function(sA){
            return sA.getText();
        }]);
        var text2 = injector.invoke([serviceA,function(sA){
            return sA.getText();
        }]);
        expect(text1).not.toEqual(text2);

        var s1 = injector.invokeService([serviceA,function(sA){
            this.getSA = function () {
                return sA;
            };
            this.getText = function () {
                return sA.getText();
            };
        }]);
        var s2 = injector.invokeService(['serviceA',function(sA){
            this.getSA = function () {
                return sA;
            };
            this.getText = function () {
                return sA.getText();
            };
        }]);
        var s3 = injector.invoke(['serviceA',function(sA){

            return {
                getSA: function () {
                    return sA;
                },
                getText: function () {
                    return sA.getText();
                }
            };
        }]);
        expect(s1.getSA()).toEqual(s2.getSA());
        expect(s1.getSA()).not.toEqual(s3.getSA());

        console.log('invoke -factory:' + s3.getText());
    });
});