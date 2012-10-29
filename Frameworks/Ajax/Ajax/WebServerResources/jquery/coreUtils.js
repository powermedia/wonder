

(function() {
    function extend(destination, source) {
        for ( var property in source)
            destination[property] = source[property];
        return destination;
    }

    extend(Object, {
        extend : extend
    });
})();

Object.extend(String.prototype, {
    addQueryParameters : function(additionalParameters) {
        if (additionalParameters) {
            return this + (this.match(/\?/) ? '&' : '?') + additionalParameters;
        } else {
            return this;
        }
    }
});
