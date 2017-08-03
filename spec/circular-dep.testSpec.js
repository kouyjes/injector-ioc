var Injector = require('../dest/Injector.js').Injector;
describe("circular  test", function() {
    it('circular service', function () {
        var injector = new Injector();

        injector.service('serviceA', ['serviceC',function () {

        }])
        injector.service('serviceB',['serviceA', function () {

        }]);

        injector.service('serviceC',['serviceB', function () {

        }]);
        expect(function () {
            injector.getService('serviceA');
        }).toThrow();

    });
});