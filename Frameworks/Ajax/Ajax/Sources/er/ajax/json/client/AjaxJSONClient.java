package er.ajax.json.client;

import com.webobjects.appserver.WOContext;

import er.extensions.foundation.ERXRandomGUID;

/**
 * AjaxJSONClient renders a "new JSONRpcClient('...')" with a URL back to your application (along with a session ID if
 * there is one).
 * 
 * <code>
 * var jsonClient = <wo:AjaxJSONClient/>;
 * </code>
 * 
 * @author mschrag
 * @binding callback the initialization callback
 * @binding componentName the JSON component to use
 * @binding global if true, a single component instance will be shared for the session (defaults false)
 * @binding instance if global is false, you can set a specific instance identifier (leave out for a generated value)
 */
public class AjaxJSONClient extends AjaxStatelessJSONClient {
	/**
	 * Do I need to update serialVersionUID?
	 * See section 5.6 <cite>Type Changes Affecting Serialization</cite> on page 51 of the 
	 * <a href="http://java.sun.com/j2se/1.4/pdf/serial-spec.pdf">Java Object Serialization Spec</a>
	 */
	private static final long serialVersionUID = 1L;

	private String _instance;

	public AjaxJSONClient(WOContext context) {
		super(context);
	}

	public boolean isStateless() {
		return false;
	}

	public boolean global() {
		return booleanValueForBinding("global", false);
	}

	public String jsonComponent() {
		return stringValueForBinding("component");
	}

	public String jsonInstance() {
		String instance = stringValueForBinding("instance");
		if (instance == null) {
			if (_instance == null && !global()) {
				_instance = ERXRandomGUID.newGid();
				instance = _instance;
			}
			instance = _instance;
		}
		return instance;
	}
}
