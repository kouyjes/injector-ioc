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
});