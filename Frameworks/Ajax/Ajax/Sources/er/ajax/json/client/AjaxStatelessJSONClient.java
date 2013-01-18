package er.ajax.json.client;


import com.webobjects.appserver.WOApplication;
import com.webobjects.appserver.WOContext;
import com.webobjects.appserver.WORequestHandler;
import com.webobjects.appserver.WOResponse;
import com.webobjects.foundation.NSDictionary;
import com.webobjects.foundation.NSMutableArray;

import er.ajax.AjaxOption;
import er.ajax.AjaxOptions;
import er.ajax.AjaxUtils;
import er.ajax.json.JSONBridge;
import er.ajax.json.JSONRequestHandler;
import er.extensions.appserver.ERXApplication;
import er.extensions.components.ERXComponent;

/**
 * StatelessJSONClient renders a "new JSONRpcClient('...')" with a URL back to
 * your application (along with a session ID if there is one).
 * 
 * <code>
 * var jsonClient = <wo:StatelessJSONClient/>;
 * </code>
 * 
 * @author mschrag
 * @binding callback the initialization callback
 */
public class AjaxStatelessJSONClient extends ERXComponent {
	/**
	 * Do I need to update serialVersionUID? See section 5.6 <cite>Type Changes
	 * Affecting Serialization</cite> on page 51 of the <a
	 * href="http://java.sun.com/j2se/1.4/pdf/serial-spec.pdf">Java Object
	 * Serialization Spec</a>
	 */
	private static final long serialVersionUID = 1L;

	public AjaxStatelessJSONClient(WOContext context) {
		super(context);
	}

	@Override
	public boolean synchronizesVariablesWithBindings() {
		return false;
	}

	public boolean global() {
		return booleanValueForBinding("global", false);
	}

	public boolean isStateless() {
		return true;
	}

	public String jsonComponent() {
		return null;
	}

	public String jsonInstance() {
		return null;
	}

	public NSDictionary createAjaxOptions(WOContext woContext, String componentName, String instance, String queryString) {
		String methods = null;
		WORequestHandler requestHandler = ERXApplication.erxApplication().requestHandlerForKey(JSONRequestHandler.RequestHandlerKey);
		if (requestHandler != null && requestHandler instanceof JSONRequestHandler) {
			methods = JSONBridge.getMethods(((JSONRequestHandler) requestHandler).getJSONBridge());
		}
		
		String jsonUrl = JSONRequestHandler.jsonUrl(woContext, componentName, instance, queryString);

		NSMutableArray<AjaxOption> ajaxOptionsArray = new NSMutableArray<AjaxOption>();
		ajaxOptionsArray.addObject(new AjaxOption("readyCB", "callback", null, AjaxOption.SCRIPT));
		ajaxOptionsArray.addObject(new AjaxOption("serverURL", jsonUrl, AjaxOption.STRING));
		ajaxOptionsArray.addObject(new AjaxOption("methods", methods, AjaxOption.SCRIPT));
		
		return AjaxOption.createAjaxOptionsDictionary(ajaxOptionsArray, this,  _keyAssociations);
	}

	@Override
	public void appendToResponse(WOResponse woresponse, WOContext wocontext) {
		AjaxUtils.addScriptResourceInHead(wocontext, woresponse, "jsonrpc.js");

		String queryString = null;
		if (wocontext.request().sessionID() != null && wocontext.session().storesIDsInURLs()) {
			String sessionIdKey = WOApplication.application().sessionIdKey();
			queryString = sessionIdKey + "=" + wocontext.request().sessionID();
		}

		String componentName = jsonComponent();
		String instance;
		if (componentName == null) {
			instance = null;
		}
		else {
			instance = jsonInstance();
		}

		woresponse.appendContentString("new JSONRpcClient(");
		AjaxOptions.appendToResponse(createAjaxOptions(wocontext, componentName, instance, queryString), woresponse, wocontext);
		woresponse.appendContentString(");");
	}
}
