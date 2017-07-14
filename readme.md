## Injector 依赖注入会帮助我们创建Service、Factory、Provider，自动创建依赖并注入
## 起步
```html
    <script src="dest/injector.js"></script>
```
### 初始化Injector
```javascript
    var injector = new HERE.Injector();
```
### 定义变量
定义方式
```javascript
    injector.value('configInfo',{
        info:'configInfo'
    });
    var configInfo = injector.getValue('configInfo');
```
### 定义Service：
```javascript
    function serviceA(){
        this.serviceText = 'serviceA hello world' + Math.random();
        this.getText = function(){
            return this.getText();
        }
    }
```
#### 定义方式：
1.通过类型获取Service
```javascript
    injector.service(serviceA);
    var sA = injector.getService(serviceA);
    sA.getText(); // 'serviceA hello world..'
```
2.通过名称获取Service
```javascript
    injector.service('serviceA',serviceA);
    var sA = injector.getService(serviceA) 或者 injector.getService('serviceA')
    sA.getText(); // 'serviceA hello world..'
```
3.Service是单例的
```javascript
   var sB =  injector.getService(serviceA);
   sB === sA; //true
   
   //获取不同的实例
   var sC = injector.getFactory(serviceA) 或 injector.getFactory('serviceA');
   sC === sB // false
```
4.Service的名称
```javascript
    //定义Service的时候不指定Service名称,injector会自动生成默认的Service名称
     injector.service(serviceA);
     Injector.identify(serviceA); //获取Service名称
     Injector.identify(serviceA,'serviceA_name'); //自定义Service的名称
     //获取Service
     var sA = injector.getService('serviceA_name'); //通过名称获取
     sA = injector.getService(serviceA); //通过类型获取
     
    //注:在声明Service的时候定义名称,这个名称拥有最高优先级,会覆盖之前定义的Service名称
    injector.service('serviceA_name_new',serviceA);
    sA = injector.getService('serviceA_name_new');
```
5.Service的依赖注入
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
    
    //声明时定义依赖
    injector.service('serviceB',['serviceA',serviceB]); //依赖通过名称注入
    injector.service('serviceB',[serviceA,serviceB]); //依赖通过类型注入
    
    注:Service依赖可以时已经声明的Value、Service、Factory,如依赖的是Service，则会返回单例的实例
```
### 定义Factory
```javascript
    function factoryA(){
        return {
            text:'factoryA helloworld' + Math.random(),
            getText:function(){
                return this.text;
            }
        };
    }
```
#### 定义方式
1.通过类型
```javascript
    injector.factory(factoryA);
    var fA = injector.getFactory(factory);
    fA.getText(); // 'factoryA helloworld..'
    
    var fA_ = injector.getFactory(factory);
    fA === fA_; // false
    
    var fA__ = injector.getService(factory);
    fA__.getText(); // 'factoryA helloworld..' 与getFactory 等效
```
2.通过名称
```javascript
    injector.factory('factoryA',factoryA);
    var fA = injector.getFactory('factoryA') 或 injector.getFactory(factoryA);
    fA.getText(); // 'factoryA helloworld..'
```
3.Factory名称
```javascript
//定义Factory的时候不指定Factory名称,injector会自动生成默认的Service名称
     injector.factory(factoryA);
     Injector.identify(factoryA); //获取Factory名称
     Injector.identify(factoryA,'factoryA_name'); //自定义Factory的名称
     //获取Service
     var fA = injector.getFactory('factoryA_name'); //通过名称获取
     fA = injector.getFactory(factoryA); //通过类型获取
     
    //注:在声明Factory的时候定义名称,这个名称拥有最高优先级,会覆盖之前定义的Factory名称
    injector.factory('factoryA_name_new',factoryA);
    fA = injector.getFactory('factoryA_name_new');
```
4.factory名称
```javascript
    function factoryB(factoryA){
        this.getText = function(){
            return factoryA.getText();
        }
    }
    injector.factory('factoryB',factoryB);
    var fB = injector.getFactory('factoryB');
    fB.getText(); // 'factoryA helloworld..'
    //注：这种方式仅在代码为经过压缩的时候生效，且factoryA的名称是factoryA时可用
    
    //定义依赖
    factoryB.$injector = [factoryA]; //通过类型注入
    factoryB.$injector = ['factoryA'];//通过名称注入
    
    //声明时定义依赖
    injector.factory('factoryB',['factoryA',factoryB]); //依赖通过名称注入
    injector.factory('factoryB',[factoryA,factoryB]); //依赖通过类型注入
    
    注:Service依赖可以时已经声明的Value、Service、Factory,如依赖的是Service，则会返回新创建的实例
```
### 调用函数
```javascript
    injector.invoke(function(){
        console.log('invoke function');
    });
    injector.invoke(['serviceA',function(sA){
        sA.getText();
    }]);
    injector.invoke([serviceA,function(sA){
        sA.getText();
    }]);
```
### 定义Provider
1.定义方式
```javascript
    function providerA(){
        this.testText = 'providerA text';
        this.$get = function(){
            return this.testText;
        }
    }
    injector.provider(providerA);
    var pA = injector.getProvider(providerA);
    pA.$get(); // 'providerA text';
    var pA_ = injector.getProvider(providerA);
    pA === pA_; //true Provider是单例的
    
    注：Provider的定义与Service、Factory类似，区别在于Provider只能依赖已经声明的Provider,且必须包含一个$get方法签名
```
### Injector的继承
1.继承方式
```javascript
    var injectorB = new HERE.Injector(injector);
    var sA = injectorB.getService('serviceA'); //获取injector中定义的Service
    injectorB.service('serviceA',function(){
        this.getText = function(){
            return 'serviceB from injectorB';
        };
    });
    sA = injectorB.getService('serviceA');
    sA.getText(); // 'serviceB from injectorB'
```
2.多继承
```javascript
    var injectorC = new HERE.Injector();
    var injectorD = new HERE.Injector(injectorA,injectorC); //或 new HERE.Injector([injectorA,injectorC]);
    injectorD.getService('serviceA');
    //注:获取Service、Factory、Provider、Value顺序：先从injectorD中获取，获取不到则从injectorA、injectorC中获取
```

### 配置
```javascript
    Injector.config({
        debugMode:true,
        injectorIdentifyKey:'$injectorName',
        injectorDepIdentifyKey:'$injector'
    });
    //注:配置需要在初始化Injector之前进行，初始化后不能进行配置，一般不需要配置，当$injectorName、$injector发生命名冲突时才需要配置
```