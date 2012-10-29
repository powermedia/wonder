jQueryId = function(id) {
    return jQuery("#" + id);
}

var AjaxOptions = {
    defaultOptions : function(additionalOptions) {
        var options = {
            method : 'GET',
            asynchronous : true,
            evalScripts : true
        };
        jQuery.extend(options, additionalOptions || {});
        return options;
    }
}

var AjaxUpdateContainer = {
    // registerPeriodic: function(id, canStop, stopped, options) {
    // var url = $(id).getAttribute('updateUrl');
    // var updater;
    // if (!canStop) {
    // updater = new Ajax.PeriodicalUpdater(id, url, options);
    // }
    // else if (stopped) {
    // var newOptions = Object.extend({}, options);
    // newOptions.stopped = true;
    // updater = new Ajax.StoppedPeriodicalUpdater(id, url, newOptions);
    // }
    // else {
    // updater = new Ajax.ActivePeriodicalUpdater(id, url, options);
    // }
    //    
    // eval(id + "PeriodicalUpdater = updater;");
    // eval(id + "Stop = function() { " + id + "PeriodicalUpdater.stop() };");
    // },
    //  
    // insertionFunc: function(effectPairName, beforeDuration, afterDuration) {
    // var insertionFunction;
    //    
    // var showEffect = 0;
    // var hideEffect = 1;
    //    
    // for (var existingPairName in Effect.PAIRS) {
    // var pairs = Effect.PAIRS[existingPairName];
    //  
    // if (effectPairName == existingPairName) {
    // insertionFunction = function(receiver, response) {
    // Effect[Effect.PAIRS[effectPairName][hideEffect]](receiver, {
    // duration: beforeDuration || 0.5,
    // afterFinish: function() {
    // receiver.update(response);
    // Effect[Effect.PAIRS[effectPairName][showEffect]](receiver, {
    // duration: afterDuration || 0.5
    // });
    // }
    // });
    // };
    // }
    // else if (effectPairName == pairs[hideEffect]) {
    // insertionFunction = function(receiver, response) {
    // Effect[effectPairName](receiver, {
    // duration: beforeDuration || 0.5,
    // afterFinish: function() {
    // receiver.update(response);
    // receiver.show();
    // }
    // });
    // };
    // }
    // else if (effectPairName == pairs[showEffect]) {
    // insertionFunction = function(receiver, response) {
    // receiver.hide();
    // receiver.update(response);
    // Effect[effectPairName](receiver, {
    // duration: afterDuration || 0.5
    // });
    // };
    // }
    // }
    //    
    // return insertionFunction;
    // },
    //  

    register : function(id, options) {
        if (!options) {
            options = {};
        }
        eval(id + "Update = function() {AjaxUpdateContainer.update(id, options) }");
    },

//  
// update: function(id, options) {
// var updateElement = $(id);
// if (updateElement == null) {
// alert('There is no element on this page with the id "' + id + '".');
// }
// var actionUrl = updateElement.getAttribute('updateUrl');
// if (options && options['_r']) {
// actionUrl = actionUrl.addQueryParameters('_r='+ id);
// }
// else {
// actionUrl = actionUrl.addQueryParameters('_u='+ id);
// }
// actionUrl = actionUrl.addQueryParameters(new Date().getTime());
// new Ajax.Updater(id, actionUrl, AjaxOptions.defaultOptions(options));
// }
};
var AUC = AjaxUpdateContainer;

var AjaxUpdateLink = {
    // updateFunc : function(id, options, elementID) {
    // var updateFunction = function(queryParams) {
    // AjaxUpdateLink.update(id, options, elementID, queryParams);
    // };
    // return updateFunction;
    // },

    update : function(id, options, elementID, queryParams) {
        var updateElement = jQueryId(id);
        if (updateElement.length == 0) {
            alert('There is no element on this page with the id "' + id + '".');
        }
        AjaxUpdateLink._update(id, updateElement.attr('updateUrl'), options, elementID, queryParams);
    },

    _update : function(id, actionUrl, options, elementID, queryParams) {
        if (elementID) {
            actionUrl = actionUrl.replace(/[^\/]+$/g, elementID);
        }
        actionUrl = actionUrl.addQueryParameters(queryParams);
        if (options && options['_r']) {
            actionUrl = actionUrl.addQueryParameters('_r=' + id);
        } else {
            actionUrl = actionUrl.addQueryParameters('_u=' + id);
        }
        actionUrl = actionUrl.addQueryParameters(new Date().getTime());
        
        Ajax.updater(id, actionUrl, AjaxOptions.defaultOptions(options));
    },

// request : function(actionUrl, options, elementID, queryParams) {
// if (elementID) {
// actionUrl = actionUrl.sub(/[^\/]+$/, elementID);
// }
// actionUrl = actionUrl.addQueryParameters(queryParams);
// new Ajax.Request(actionUrl, AjaxOptions.defaultOptions(options));
// }
};
var AUL = AjaxUpdateLink;
