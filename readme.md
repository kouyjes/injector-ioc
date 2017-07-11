## Injector 依赖注入会帮助我们创建service、factory、provider，自动创建依赖并注入
## 起步
定义一个普通的类函数，如：
```javascript
    function serviceA(){
        this.serviceText = 'serviceA hello world' + Math.random();
        this.getText = function(){
            return this.getText();
        }
    }
```
初始化injector
```javascript
    var injector = new Injector();
```
定义方式：
1.通过函数方式获取服务
```javascript
    injector.service(serviceA);
    var sA = injector.getService(serviceA);
    sA.getText(); // 'serviceA hello world..'
```
2.通过名称获取服务
```javascript
    injector.service('serviceA',serviceA);
    var sA = injector.getService(serviceA) 或者 injector.getService('serviceA')
    sA.getText(); // 'serviceA hello world..'
```
3.服务是单例的
```javascript
   var sB =  injector.getService(serviceA);
   sB === sA; //true
   
   //获取不同的实例
   var sC = injector.getFactory(serviceA) 或 injector.getFactory('serviceA');
   sC === sB // false
```
4.服务的名称
```javascript
    //定义服务的时候不指定服务名称,injector会自动生成默认的服务名称
     injector.service(serviceA);
     Injector.identify(serviceA); //获取服务名称
     Injector.identify(serviceA,'serviceA_name'); //自定义服务的名称
     //获取服务
     var sA = injector.getService('serviceA_name'); //通过名称获取
     sA = injector.getService(serviceA); //通过类型获取
     
    //注:在注入服务的时候定义名称,这个名称拥有最高优先级,会覆盖之前定义的服务名称
    injector.service('serviceA_name_new',serviceA);
    sA = injector.getService('serviceA_name_new');
```
5.服务的依赖注入
```javascript
    function serviceB(serviceA){
        this.getText = function(){
            return serviceA.getText();
        }
    }
    injector.service('serviceB',serviceB);
    var sB = injector.getService('serviceB');
    sB.getText(); // 'serviceA hello world ..'
    //注：这种方式仅在代码为经过压缩的时候生效，且serviceA的名称是serviceA时可用
    
    //定义依赖
    serviceB.$injector = [serviceA]; //通过类型注入
    serviceB.$injector = ['serviceA'];//通过名称注入
```