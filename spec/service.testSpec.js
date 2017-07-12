var Injector = require('../dest/Injector.js').Injector;
describe("service injector test", function() {
    var injector;
    beforeEach(function () {
        injector = new Injector();
    });
    it("define and get a service", function() {
        var text = 'serviceA text';
        function serviceA(){
            this.text = text;
            this.getText = function () {
                return this.text;
            }
        }
        injector.service(serviceA);
        var sA = injector.getService(serviceA);
        expect(sA.getText()).toEqual(text);
        console.log(sA.getText());
    });

    it("service singleton test", function() {
        function serviceA(){
            this.text = 'text' + Math.random();
            this.getText = function () {
                return this.text;
            }
        }
        injector.service(serviceA);
        var sA = injector.getService(serviceA),
            sA_ = injector.getService(serviceA);
        console.log(sA.getText());
        expect(sA).toEqual(sA_);
    });

    it("service name injector test", function() {
        function serviceA(){
            this.text = 'text service name' + Math.random();
            this.getText = function () {
                return this.text;
            }
        }
        injector.service('serviceA',serviceA);
        var sA = injector.getService('serviceA');
        expect(sA).not.toBe(null);

        function serviceB(){
            this.getText = function () {
                return 'serviceB getText';
            }
        }
        Injector.identify(serviceB,'serviceB_rename');
        injector.service(serviceB);
        var sB = injector.getService('serviceB_rename');
        console.log('sB:' + sB.getText());
        expect(sB).not.toBe(null);
    });
});
describe('service dependence test', function () {
    var injector;
    beforeEach(function () {
        injector = new Injector();
    });
    it('serviceB depend serviceA,serviceC depend serviceA and serviceB', function () {
        function serviceA(){
            this.getTextA = function () {
                return 'serviceA';
            }
        }
        injector.service('serviceA',serviceA);

        function serviceB(sA){

            this.getTextB = function () {
                return 'serviceB';
            }
            this.getText = function () {
                return sA.getTextA() + this.getTextB();
            }
        }
        Injector.depInjector(serviceB,['serviceA']);
        injector.service(serviceB);

        function serviceC(sA,sB){
            this.getTextC = function () {
                return 'serviceC';
            };
            this.getText = function () {
                return sA.getTextA() + sB.getText() + this.getTextC();
            }
        }
        injector.service('serviceC',['serviceA',serviceB,serviceC]);

        var sA = injector.getService('serviceA');
        var sB = injector.getService(serviceB);
        var sC = injector.getService('serviceC');
        console.log(sC.getText());
        expect(sC.getText()).toEqual(sA.getTextA() + sB.getText() + sC.getTextC());


        //test argument parser
        function serviceD(serviceA){
            this.getText = function () {
                return serviceA.getTextA();
            }
        }
        injector.service(serviceD);
        var sD = injector.getService(serviceD);
        expect(sD.getText()).toEqual(sA.getTextA());

    });
});