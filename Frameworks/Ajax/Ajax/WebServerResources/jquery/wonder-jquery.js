var AjaxOptions = {
    defaultOptions : function(additionalOptions) {
        return jQuery.extend({
            method : 'GET',
            asynchronous : true,
            evalScripts : true
        }, additionalOptions || {});
    }
}

var Effect = {
    PAIRS : {
        'slide' : {
            hide : 'SlideUp',
            show : 'SlideDown',
            effect : 'slide'
        },
        'blind' : {
            hide : 'BlindUp',
            show : 'BlindDown',
            effect : 'blind'
        },
        'appear' : {
            hide : 'Fade',
            show : 'Appear',
            effect : 'fade'
        }
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

    insertionFunc : function(effectPairName, beforeDuration, afterDuration) {
        var insertionFunction;

        for ( var existingPairName in Effect.PAIRS) {
            pair = Effect.PAIRS[existingPairName];

            if (effectPairName == existingPairName) {
                var effect = pair.effect;
                insertionFunction = function(receiver, response) {
                    jQuery(receiver).hide({
                        effect : effect,
                        duration : (beforeDuration || 0.5) * 1000,
                        complete : function() {
                            jQuery(receiver).html(response);
                            jQuery(receiver).show({
                                effect : effect,
                                duration : (afterDuration || 0.5) * 1000
                            });
                        }
                    });
                };
            } else if (effectPairName == pair.hide) {
                var effect = pair.effect;
                insertionFunction = function(receiver, response) {
                    jQuery(receiver).hide({
                        effect : effect,
                        duration : (beforeDuration || 0.5) * 1000,
                        complete : function() {
                            jQuery(receiver).html(response);
                            jQuery(receiver).show();
                        }
                    });
                };
            } else if (effectPairName == pair.show) {
                var effect = pair.effect;
                insertionFunction = function(receiver, response) {
                    jQuery(receiver).hide();
                    jQuery(receiver).html(response);
                    jQuery(receiver).show({
                        effect : effect,
                        duration : (afterDuration || 0.5) * 1000
                    });
                };
            }
        }

        return insertionFunction;
    },

    register : function(id, options) {
        if (!options) {
            options = {};
        }
        eval(id + "Update = function() {AjaxUpdateContainer.update(id, options) }");
    },

    update : function(id, options) {
        return AUL.update(id, options);
    }
};
var AUC = AjaxUpdateContainer;

var AjaxUpdateLink = {
    updateFunc : function(id, options, elementID) {
        var updateFunction = function(queryParams) {
            AjaxUpdateLink.update(id, options, elementID, queryParams);
        };
        return updateFunction;
    },

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
        actionUrl = StringUtils.addQueryParameters(actionUrl, queryParams);
        if (options && options['_r']) {
            actionUrl = StringUtils.addQueryParameters(actionUrl, '_r=' + id);
        } else {
            actionUrl = StringUtils.addQueryParameters(actionUrl, '_u=' + id);
        }
        actionUrl = StringUtils.addQueryParameters(actionUrl, '__updateTime=' + new Date().getTime());

        new Ajax.Updater(id, actionUrl, AjaxOptions.defaultOptions(options));
    }

// request : function(actionUrl, options, elementID, queryParams) {
// if (elementID) {
// actionUrl = actionUrl.sub(/[^\/]+$/, elementID);
// }
// actionUrl = actionUrl.addQueryParameters(queryParams);
// new Ajax.Request(actionUrl, AjaxOptions.defaultOptions(options));
// }
};
var AUL = AjaxUpdateLink;

var AjaxSubmitButton = {
    PartialFormSenderIDKey : '_partialSenderID',
    AjaxSubmitButtonNameKey : 'AJAX_SUBMIT_BUTTON_NAME',

    defaultOptions : function(additionalOptions) {
        var options = AjaxOptions.defaultOptions(additionalOptions);
        options['method'] = 'post';
        return options;
    },

    generateActionUrl : function(id, form, queryParams, options) {
        var actionUrl = form.action;
        if (queryParams != null) {
            actionUrl = StringUtils.addQueryParameters(actionUrl, queryParams);
        }
        actionUrl = StringUtils.sub(actionUrl, '/wo/', '/ajax/');
        if (id != null) {
            if (options && options['_r']) {
                actionUrl = StringUtils.addQueryParameters(actionUrl, '_r=' + id);
            } else {
                actionUrl = StringUtils.addQueryParameters(actionUrl, '_u=' + id);
            }
        }
        actionUrl = StringUtils.addQueryParameters(actionUrl, '__updateTime=' + new Date().getTime());
        return actionUrl;
    },

    processOptions : function(form, options) {
        var processedOptions = null;
        if (options != null) {
            processedOptions = jQuery.extend({}, options);

            var ajaxSubmitButtonName = processedOptions['_asbn'];
            if (ajaxSubmitButtonName != null) {
                processedOptions['_asbn'] = null;
                var parameters = processedOptions['parameters'];
                if (parameters === undefined || parameters == null) {
                    jQuery(form).trigger('ajax:submit');
                    var formSerializer = processedOptions['_fs'];
                    if (formSerializer == null) {
                        formSerializer = Form.serializeWithoutSubmits;
                    } else {
                        processedOptions['_fs'] = null;
                    }
                    var serializedForm = formSerializer(form);

                    processedOptions['parameters'] = serializedForm + '&' + AjaxSubmitButton.AjaxSubmitButtonNameKey
                            + '=' + ajaxSubmitButtonName;
                } else {
                    processedOptions['parameters'] = parameters + '&' + AjaxSubmitButton.AjaxSubmitButtonNameKey + '='
                            + ajaxSubmitButtonName;
                }
            }
        }
        processedOptions = AjaxSubmitButton.defaultOptions(processedOptions);
        return processedOptions;
    },
    /*
     * partial : function(updateContainerID, formFieldID, options) { var
     * optionsCopy = Object.extend(new Object(), options); var formField =
     * $(formFieldID); var form = formField.form;
     * 
     * var queryParams = {}; queryParams[formField.name] = $F(formField);
     * queryParams[AjaxSubmitButton.PartialFormSenderIDKey] = formField.name;
     * optionsCopy['parameters'] = Hash.toQueryString(queryParams);
     * 
     * if (updateContainerID == null) { AjaxSubmitButton.request(form, null,
     * optionsCopy); } else { AjaxSubmitButton.update(updateContainerID, form,
     * null, optionsCopy); } },
     */

    update : function(id, form, queryParams, options) {
        var updateElement = withId(id);
        if (updateElement == null) {
            alert('There is no element on this page with the id "' + id + '".');
        }
        var finalUrl = AjaxSubmitButton.generateActionUrl(id, form, queryParams, options);
        var finalOptions = AjaxSubmitButton.processOptions(form, options);
        new Ajax.Updater(id, finalUrl, finalOptions);
    },

    /*
     * request : function(form, queryParams, options) { var finalUrl =
     * AjaxSubmitButton.generateActionUrl(null, form, queryParams, options); var
     * finalOptions = AjaxSubmitButton.processOptions(form, options); new
     * Ajax.Request(finalUrl, finalOptions); },
     * 
     * observeDescendentFields : function(updateContainerID, containerID,
     * observeFieldFrequency, partial, observeDelay, options) {
     * $(containerID).descendants().find( function(element) { if (element.type !=
     * 'hidden' && [ 'input', 'select', 'textarea'
     * ].include(element.tagName.toLowerCase())) {
     * AjaxSubmitButton.observeField(updateContainerID, element,
     * observeFieldFrequency, partial, observeDelay, options); } }); },
     */

    observeField : function(updateContainerID, formFieldID, observeFieldFrequency, partial, observeDelay, options) {
        var $formField = jQueryId(formFieldID);
        if ($formField.length > 0 && ($formField.is("input") || $formField.is("select") || $formField.is("textarea"))) {
            var submitFunction;
            if (partial) {
                // We need to cheat and make the WOForm that contains the
                // form
                // action appear to have been
                // submitted. So we grab the action url, pull off the
                // element ID
                // from its action URL
                // and pass that in as FORCE_FORM_SUBMITTED_KEY, which is
                // processed
                // by ERXWOForm just like
                // senderID is on the real WOForm. Unfortunately we can't
                // hook into
                // the real WOForm to do
                // this :(
                submitFunction = function(element, value) {
                    if (!options.onBeforeSubmit || options.onBeforeSubmit(formFieldID)) {
                        ASB.partial(updateContainerID, formFieldID, options);
                    }
                }
            } else if (updateContainerID != null) {
                submitFunction = function(element, value) {
                    if (!options.onBeforeSubmit || options.onBeforeSubmit(formFieldID)) {
                        ASB.update(updateContainerID, withId(formFieldID).form, null, options);
                    }
                }
            } else {
                submitFunction = function(element, value) {
                    if (!options.onBeforeSubmit || options.onBeforeSubmit(formFieldID)) {
                        ASB.request(withId(formFieldID).form, null, options);
                    }
                }
            }

            if (observeDelay) {
                var delayer = new AjaxObserveDelayer(observeDelay, submitFunction);
                submitFunction = delayer.valueChanged.bind(delayer);
            }

            defer(function() {
                if (observeFieldFrequency == null) {
                    if (withId(formFieldID).type.toLowerCase() == 'radio') {
                        notImplemented("Element.RadioButtonObserver");
                        new Form.Element.RadioButtonObserver(withId(formFieldID), submitFunction);
                    } else {
                        new Form.Element.EventObserver(withId(formFieldID), submitFunction);
                    }
                } else {
                    notImplemented("Element.Observer");
                    new Form.Element.Observer(withId(formFieldID), observeFieldFrequency, submitFunction);
                }
            });
        }
    }
};
var ASB = AjaxSubmitButton;

var AjaxBusy = {
    spinners : {},

    requestContainer : function(ajaxOptions) {
        var updateContainer;
        if (ajaxOptions && ajaxOptions.container && ajaxOptions.container.success) {
            updateContainer = ajaxOptions.container.success;
        }
        return updateContainer;
    },

    register : function(busyClass, busyAnimationElement, watchContainerID, onCreateCallback, onCompleteCallback,
            useSpinJS, spinOpts) {

        jQuery(document).ajaxSend(function(event, jqXHR, ajaxOptions) {
            var updateContainer = AjaxBusy.requestContainer(ajaxOptions);

            if (!watchContainerID || (updateContainer && updateContainer.id == watchContainerID)) {
                if (useSpinJS == true) {
                    var spinner = AjaxBusy.spinners[busyAnimationElement];
                    if (spinner == undefined) {
                        spinner = new Spinner(spinOpts);
                        AjaxBusy.spinners[busyAnimationElement] = spinner;
                    }
                    spinner.spin(busyAnimationElement);
                }
                if (busyClass && updateContainer) {
                    jQuery(updateContainer).addClass(busyClass);
                }

                if (busyAnimationElement) {
                    jQuery(busyAnimationElement).fadeIn();
                }

                if (onCreateCallback) {
                    onCreateCallback(event, jqXHR, ajaxOptions);
                }
            }
        });

        jQuery(document).ajaxStop(function(event, jqXHR, ajaxOptions) {
            var updateContainer = AjaxBusy.requestContainer(ajaxOptions);
            if (!watchContainerID || (updateContainer && updateContainer.id == watchContainerID)) {
                if (busyClass && updateContainer) {
                    jQuery(updateContainer).removeClass(busyClass);
                }

                if (busyAnimationElement) {
                    jQuery(busyAnimationElement).fadeOut();
                }

                if (onCompleteCallback) {
                    onCompleteCallback(event, jqXHR, ajaxOptions);
                }

                if (useSpinJS == true) {
                    var spinner = AjaxBusy.spinners[busyAnimationElement];
                    if (spinner) {
                        AjaxBusy.spinners[busyAnimationElement] = undefined;
                        setTimeout(function() {
                            spinner.stop();
                        }, 500);
                    }
                }
            }
        });
    }
};

var AjaxInPlace = {
    saveFunctionName : function(id) {
        return "window." + id + "Save";
    },

    cancelFunctionName : function(id) {
        return "window." + id + "Cancel";
    },

    editFunctionName : function(id) {
        return "window." + id + "Edit";
    },

    cleanupEdit : function(id) {
        var saveFunctionName = this.saveFunctionName(id);
        var cancelFunctionName = this.cancelFunctionName(id);
        if (typeof eval(saveFunctionName) != 'undefined') {
            eval(saveFunctionName + " = null");
        }
        if (typeof eval(cancelFunctionName) != 'undefined') {
            eval(cancelFunctionName + " = null");
        }
    },

    cleanupView : function(id) {
        var editFunctionName = this.editFunctionName(id);
        if (typeof eval(editFunctionName) != 'undefined') {
            eval(editFunctionName + " = null");
        }
    }
};
var AIP = AjaxInPlace;
