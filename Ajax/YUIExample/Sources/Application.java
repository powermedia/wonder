// Generated by the WOLips Templateengine Plug-in at Oct 1, 2006 2:16:32 PM

import com.webobjects.appserver.WOApplication;
import com.webobjects.foundation.NSLog;

public class Application extends WOApplication {
    
    public static void main(String argv[]) {
        WOApplication.main(argv, Application.class);
    }

    public Application() {
        super();
        NSLog.out.appendln("Welcome to " + this.name() + " !");
        /* ** put your initialization code in here ** */
    }
}