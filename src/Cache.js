function Cache(parent) {
    this.super = parent ? [].concat(parent) : [];
    this.cache = {};
}
Cache.prototype.get = function (key) {
    var value = this.cache[key];
    if(value){
        return value;
    }
    this.super.some(function (cache) {
        value = cache.get(key);
        return !!value;
    });
    return value;
};
Cache.prototype.put = function (key,value) {
    this.cache[key] = value;
};
Cache.prototype.remove = function (key) {
    delete this.cache[key];
};
Cache.prototype.has = function (key) {
    return this.cache.hasOwnProperty(key);
};
export { Cache };