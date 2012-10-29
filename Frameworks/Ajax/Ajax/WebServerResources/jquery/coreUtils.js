var ScriptFragment = '<script[^>]*>([\\S\\s]*?)<\/script>';

(function() {
    var _toString = Object.prototype.toString;
    var FUNCTION_CLASS = '[object Function]';
    var NUMBER_CLASS = '[object Number]';
    var STRING_CLASS = '[object String]';
    var DATE_CLASS = '[object Date]';

    window.ObjectUtils = {
        isFunction : function(object) {
            return _toString.call(object) === FUNCTION_CLASS;
        },

        isString : function(object) {
            return _toString.call(object) === STRING_CLASS;
        },

        isNumber : function(object) {
            return _toString.call(object) === NUMBER_CLASS;
        },

        isDate : function(object) {
            return _toString.call(object) === DATE_CLASS;
        },

        isUndefined : function(object) {
            return typeof object === "undefined";
        }
    };

    window.StringUtils = {
        addQueryParameters : function(str, params) {
            if (params) {
                return str + (str.match(/\?/) ? '&' : '?') + params;
            } else {
                return str;
            }
        },

        stripScripts : function(str) {
            return str.replace(new RegExp(ScriptFragment, 'img'), '');
        }
    }
})();

var Ajax = {}

Ajax.prepareJQueryOption = function(prototypeOptions) {
    var opts = jQuery.extend({}, prototypeOptions || {});
    jQuery.extend(opts, {
        async : opts.asynchronous,
        type : opts.method ? opts.method.toUpperCase() : null
    });
    return opts;
}

var Element = function() {
}

Ajax.Updater = function(container, url, options) {
    if (options.insertion) {
        throw "Not implemented: insertion";
    }

    var _container = {
        success : (container.success || container),
        failure : (container.failure || (container.success ? null : container))
    };
    var onComplete = options.onComplete || function() {
    };
    var evalScripts = options.evalScripts;

    var opts = jQuery.extend(Ajax.prepareJQueryOption(options), {
        url : url,
        dataType : "html"
    });

    var self = this;

    jQuery.ajax(opts).done(function(responseText, statusText, jqXHR) {
        if (_container[jqXHR.success ? 'success' : 'failure']) {

            if (!evalScripts) {
                responseText = responseText.stripScripts();
            }

            jQueryId(_container[jqXHR.success ? 'success' : 'failure']).html(responseText);
        }
    }, onComplete);

};
