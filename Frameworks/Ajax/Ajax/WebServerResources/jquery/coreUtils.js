/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function() {
	var initializing = false, fnTest = /xyz/.test(function() {
		xyz;
	}) ? /\b_super\b/ : /.*/;

	// The base Class implementation (does nothing)
	this.Class = function() {
	};

	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for ( var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function"
					&& fnTest.test(prop[name]) ? (function(name, fn) {
				return function() {
					var tmp = this._super;

					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];

					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(name, prop[name]) : prop[name];
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;

		return Class;
	};
})();
// **************************************************************************************//

withId = function(id) {
	return document.getElementById(id);
}

defer = function(func) {
	return window.setTimeout(func, 0.01);
}

jQueryId = function(id) {
	if (ObjectUtils.isString(id)) {
		return jQuery("#" + id);
	} else {
		return jQuery(id);
	}
}

function notImplemented(msg) {
	throw "Not implemented: " + msg;
}

var Abstract = {}

jQuery.fn.extend({
	checked : function(value) {
		return value === undefined ? jQuery(this).attr("checked") == "checked" : jQuery(this).attr("checked", value);
	},

	disabled : function(value) {
		return value === undefined ? jQuery(this).attr("disabled") == "disabled" : (value ? jQuery(this).attr(
				"disabled", "disabled") : jQuery(this).removeAttr("disabled"));
	},

	clickLink : function() {
		this.each(function() {
			var fireDefault = true;

			if (document.createEvent) {
				var event = document.createEvent("MouseEvents");
				event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				fireDefault = this.dispatchEvent(event);
			} else if (this.fireEvent && document.createEventObject) {
				fireDefault = this.fireEvent("onclick");
			}

			if (fireDefault) {
				window.location = this.href;
			}
		});
	},

	cumulativeZIndex : function() {
		var $this = jQuery(this);

		zIndex = $this.elemZIndex();

		$this.parents().each(function() {
			zIndex = zIndex + jQuery(this).elemZIndex();
		});

		return zIndex;
	},

	elemZIndex : function() {
		try {
			var res = Number(this.css("zIndex"));
			if (isNaN(res)) {
				return 0;
			} else {
				return res;
			}
		} catch (e) {
			return 0;
		}
	},

	isInDOM : function() {
		return this.closest('html').length > 0;
	}
});

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
})();

RegExp.escape = function(str) {
	return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

(function() {

	function prepareReplacement(replacement) {
		if (ObjectUtils.isFunction(replacement)) {
			return replacement;
		}
		var template = new Template(replacement);
		return function(match) {
			return template.evaluate(match)
		};
	}

	function sub(str, pattern, replacement, count) {
		replacement = prepareReplacement(replacement);
		count = ObjectUtils.isUndefined(count) ? 1 : count;

		return StringUtils.gsub(str, pattern, function(match) {
			if (--count < 0) {
				return match[0];
			}
			return replacement(match);
		});
	}

	function gsub(source, pattern, replacement) {
		var result = '', match;
		replacement = prepareReplacement(replacement);

		if (ObjectUtils.isString(pattern)) {
			pattern = RegExp.escape(pattern);
		}

		if (!(pattern.length || pattern.source)) {
			replacement = replacement('');
			return replacement + source.split('').join(replacement) + replacement;
		}

		while (source.length > 0) {
			if (match = source.match(pattern)) {
				result += source.slice(0, match.index);
				result += StringUtils.emptyIfNull(replacement(match));
				source = source.slice(match.index + match[0].length);
			} else {
				result += source, source = '';
			}
		}
		return result;
	}

	window.StringUtils = {
		emptyIfNull : function(value) {
			return value == null ? '' : String(value);
		},

		addQueryParameters : function(str, params) {
			if (params) {
				return str + (str.match(/\?/) ? '&' : '?') + params;
			} else {
				return str;
			}
		},

		stripScripts : function(str) {
			return str.replace(new RegExp(ScriptFragment, 'img'), '');
		},

		isEmpty : function(str) {
			return (ObjectUtils.isUndefined(str) || str == null || StringUtils.strip(str) == "");
		},

		strip : function(str) {
			return str.replace(/^\s+/, '').replace(/\s+$/, '');
		},

		sub : sub,
		gsub : gsub
	}
})();

var Template = Class.extend({
	init : function(template, pattern) {
		this.template = template.toString();
		this.pattern = pattern || Template.Pattern;
	},

	evaluate : function(object) {
		if (object && ObjectUtils.isFunction(object.toTemplateReplacements)) {
			object = object.toTemplateReplacements();
		}

		return StringUtils.gsub(this.template, this.pattern, function(match) {
			if (object == null) {
				return (match[1] + '');
			}

			var before = match[1] || '';
			if (before == '\\') {
				return match[2];
			}

			var ctx = object, expr = match[3], pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

			match = pattern.exec(expr);
			if (match == null) {
				return before;
			}

			while (match != null) {
				var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
				ctx = ctx[comp];
				if (null == ctx || '' == match[3]) {
					break;
				}
				expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
				match = pattern.exec(expr);
			}

			return before + StringUtils.emptyIfNull(ctx);
		});
	}
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var Form = {
	Element : {},

	serializeWithoutSubmits : function(form) {
		return jQuery(form).serialize();
	}
}

var Element = {}

var Ajax = {
	prepareJQueryOption : function(prototypeOptions) {
		var opts = jQuery.extend({}, prototypeOptions || {});
		jQuery.extend(opts, {
			async : opts.asynchronous,
			type : opts.method ? opts.method.toUpperCase() : null,
			data : opts.parameters || ""
		});
		return opts;
	}
}

Ajax.Updater = Class.extend({
	init : function(container, url, options) {
		this.container = {
			success : (container.success || container),
			failure : (container.failure || (container.success ? null : container))
		};

		var onComplete = options.onComplete || function() {
		};

		this.options = jQuery.extend(Ajax.prepareJQueryOption(options), {
			url : url,
			dataType : "html",
			container : this.container
		});

		jQuery.ajax(this.options).done(jQuery.proxy(this.updateContent, this), onComplete);
	},

	updateContent : function(responseText, statusText, jqXHR) {
		var receiver = this.container[jqXHR.success ? 'success' : 'failure'];

		if (receiver && jQueryId(receiver).length > 0) {
			if (!this.options.evalScripts) {
				responseText = responseText.stripScripts();
			}

			if (this.options.insertion) {
				this.options.insertion(jQueryId(receiver), responseText);
			} else {
				jQueryId(receiver).html(responseText);
			}
		}
	}

});

Ajax.Request = Class.extend({
	init : function(url, options) {
		var onComplete = options.onComplete || function() {
		};

		this.options = jQuery.extend(Ajax.prepareJQueryOption(options), {
			url : url,
			dataType : "html"
		});

		jQuery.ajax(this.options).done(onComplete);
	}
});

// Observers
Abstract.EventObserver = Class.extend({
	init : function(element, callback) {
		this.element = element;
		this.$element = jQuery(element);
		this.callback = callback;

		this.lastValue = this.getValue();
		if (this.$element.is('form')) {
			this.registerFormCallbacks();
		} else {
			this.registerCallback(this.element);
		}
	},

	onElementEvent : function() {
		var value = this.getValue();
		if (this.lastValue != value) {
			this.callback(this.element, value);
			this.lastValue = value;
		}
	},

	registerFormCallbacks : function() {
		notImplemented("registerFormCallbacks");
		Form.getElements(this.element).each(this.registerCallback, this);
	},

	registerCallback : function(element) {
		if (this.$element.is(":checkbox") || this.$element.is(":radio")) {
			this.$element.click(jQuery.proxy(this.onElementEvent, this));
		} else {
			this.$element.change(jQuery.proxy(this.onElementEvent, this));
		}
	}
});

Form.Element.EventObserver = Abstract.EventObserver.extend({
	getValue : function() {
		if (this.$element.is(":checkbox")) {
			return this.$element.checked();
		}
		return this.$element.val();
	}
});

Form.Element.RadioButtonObserver = Form.Element.EventObserver.extend({
	onElementEvent : function() {
		var value = this.getValue();
		this.callback(this.element, value);
		this.lastValue = value;
	}
});
