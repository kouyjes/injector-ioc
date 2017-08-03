abstract class CircularCheck{
    protected __invoking__ = false;
    protected invoke(fn:Function,...params){
        if(this.__invoking__){
            throw new Error('Circular invoked ' + this);
        }
        this.__invoking__ = true;
        var result = fn.apply(this,params);
        this.__invoking__ = false;
        return result;
    }
}
export { CircularCheck }