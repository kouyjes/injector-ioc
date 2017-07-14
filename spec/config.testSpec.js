var Injector = require('../dest/Injector.js').Injector;
describe("config injector test", function() {
    var injector;
    beforeEach(function () {
        injector = new Injector();
    });
    it('modify config test', function () {
       /* Injector.config({
           injectorIdentifyKey:'$injectorName_new',
           injectorDepIdentifyKey:'$injector_new'
        });
        function factoryA(){

        }
        Injector.identify(factoryA,'factoryA_custom');
        injector.factory(factoryA);

        expect(factoryA['$injectorName_new']).toEqual('factoryA_custom');

        expect(factoryA['$injector_new']).not.toBe(null);

        console.log(factoryA['$injector_new']);*/

   });
});