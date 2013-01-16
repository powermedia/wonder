
import java.util.ArrayList;
import java.util.List;

import com.webobjects.appserver.WOContext;
import com.webobjects.foundation.NSArray;

import er.ajax.json.JSONComponent;

public class ExampleJSONComponent extends JSONComponent {
	private int _counter;

	public ExampleJSONComponent(WOContext context) {
		super(context);
	}

	public int next() {
		return _counter++;
	}

	public NSArray<String> next1() {
		return new NSArray<String>("A","B","XX","X12",""+next());
	}
}
