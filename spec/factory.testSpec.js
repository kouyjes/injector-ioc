var Injector = require('../dest/Injector.js').Injector;
describe('factory injector test', function () {
    var injector;
    beforeEach(function () {
        injector = new Injector();
    });
   it('define and get factory', function () {
       console.log('start factory test');
        function factoryA(){
            return {
                text: function () {
                    return 'factoryA';
                }
            };
        }
       injector.factory(factoryA);
       var fa = injector.getFactory(factoryA);
       var fa_ = injector.getFactory(factoryA);
       expect(fa.text()).toEqual('factoryA');
       expect(fa).not.toEqual(fa_);
   });

    it('factory depend test', function () {

        function factoryA(){
            return {
                text: function () {
                    return 'factoryA';
                }
            };
        }
        injector.factory(factoryA);


        function factoryB(fA){
            return {
                text: function () {
                    return fA.text() + '_B';
                }
            };
        }

        Injector.depInjector(factoryB,[factoryA]);

        injector.factory('factoryB',factoryB);

        function factoryC(fB,fA){
            return {
                getTextC:function () {
                    return fB.text() + '-' + fA.text() + '_C';
                }
            };
        }
        Injector.depInjector(factoryC,'factoryB',factoryA);

        injector.factory(factoryC);

        var fC = injector.getFactory(factoryC);

        console.log(fC.getTextC());

    });
});