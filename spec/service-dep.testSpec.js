var Injector = require('../dest/Injector.js').Injector;
describe('service dependence test suite', function () {

    var baseInjector = new Injector();
    function serviceA(){
        this.getText = function () {
            return 'service_base_A';
        };
    }
    baseInjector.service('serviceA',serviceA);
    it('inherit serviceA test', function () {


        var injector =  new Injector(baseInjector);
        var sA = injector.getService('serviceA');
        var sA_ = baseInjector.getService(serviceA);

        expect(sA).toEqual(sA_);

        expect(sA.getText()).toEqual('service_base_A');

        injector.service('serviceA', function () {
            this.getText = function () {
                return 'service_base_A_override';
            }
        });

        var overridesA = injector.getService('serviceA');
        expect(overridesA.getText()).toEqual('service_base_A_override');


        var injectorC = new Injector([baseInjector,injector]);
        var c_sA = injectorC.getService('serviceA');
        var c_fA = injectorC.getFactory('serviceA');
        expect(c_sA).toEqual(sA);
        expect(c_fA).not.toEqual(c_sA);
    });
});