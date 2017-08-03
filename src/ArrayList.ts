class ArrayList<T>{
    protected __list__:T[] = [];
    constructor(list:T[] = []){
        Array.prototype.push.apply(this.__list__,list);
    }
    indexOf(value:T):number{
        return this.__list__.indexOf(value);
    }
    has(value:T):boolean{
        return this.indexOf(value) >= 0;
    }
    push(value:T){
        return this.__list__.push(value);
    }
    pop(){
        return this.__list__.pop();
    }
    unshift(value:T){
        return this.__list__.unshift(value);
    }
    shift(){
        return this.__list__.shift();
    }
    items():T[]{
        return this.__list__;
    }
    remove(value:T){
        var index = this.indexOf(value);
        if(index >= 0){
            this.__list__.splice(index,1);
            return value;
        }
    }
    empty(){
        this.__list__.length = 0;
    }
}
export { ArrayList };