class Cache {
    private parent:Cache[] = [];
    private cache = {};

    constructor(parent?) {
        if (parent) {
            this.parent = this.parent.concat(parent);
        }
    }

    get(key) {
        var value = this.cache[key];
        if (value) {
            return value;
        }
        this.parent.some(function (cache) {
            value = cache.get(key);
            return !!value;
        });
        return value;
    }

    put(key, value) {
        this.cache[key] = value;
    }

    remove(key) {
        delete this.cache[key];
    }

    has(key) {
        return this.cache.hasOwnProperty(key);
    }
}
export { Cache };