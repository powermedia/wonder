package wowodc.background.tasks;


import java.text.DecimalFormat;
import java.text.Format;

import org.apache.log4j.Logger;

import wowodc.background.utilities.Utilities;
import er.extensions.concurrency.ERXTaskPercentComplete;
import er.extensions.concurrency.IERXStoppable;
import er.extensions.foundation.ERXStatusInterface;

/**
 * This task does practically the same as the previous example in {@link T01T02SimpleBackgroundTask}, but we have
 * added support for 3 interfaces indicating that the task provides a status message ({@link ERXStatusInterface}), 
 * a percent complete value ({@link ERXTaskPercentComplete}) and
 * that the task can be stopped by the user in a graceful way ({@link IERXStoppable}).
 * 
 * @author kieran
 * 
 */
public class T03BackgroundTaskWithProgressFeedback implements Runnable, ERXStatusInterface , ERXTaskPercentComplete, IERXStoppable {
	
	private static final Logger log = Logger.getLogger(T03BackgroundTaskWithProgressFeedback.class);
	
	// Duration of the example task in milliseconds
	// (For demonstration, I want predictable task run times rather than too short or too long)
	private final long DURATION = 12000;
	
	// Task elapsed time in milliseconds
	private long _elapsedTime = 0l;
	
	// Value between 0.0 and 1.0 indicating the task's percentage complete
	private double _percentComplete = 0.0d;
	
	// A message indicating current status
	private String _status = "Starting...";
	
	private long _numberToCheck = 0;
	
	private final long _primesFound = 0;
	
	private volatile boolean _isStopped = false;

	public void run() {

		_numberToCheck = 0;
		_elapsedTime = 0;
		Format wholeNumberFormatter = new DecimalFormat("#,##0");
		
		long startTime = System.currentTimeMillis();

		// Loop for fixed period of time
		while (_elapsedTime < DURATION && !_isStopped) {

			if (Utilities.isPrime(_numberToCheck)) {
				log.info("==>> " + _numberToCheck + " is a PRIME number.");
			} else {
				log.debug(_numberToCheck + " is not a prime number but is a COMPOSITE number.");
			}
			
			
			_elapsedTime = System.currentTimeMillis() - startTime;
			
			// Update progress variables
			_percentComplete = (double)(_elapsedTime) / (double)DURATION;
			_status = wholeNumberFormatter.format(_numberToCheck) + " numbers checked for prime qualification";
			if (log.isDebugEnabled())
				log.debug("_numberToCheck = " + _numberToCheck + "; _status = " + _status);
			_numberToCheck++;
		}

	}

	/* (non-Javadoc)
	 * @see er.extensions.concurrency.ERXTaskPercentComplete#percentComplete()
	 */
	public Double percentComplete() {
		return _percentComplete;
	}

	/* (non-Javadoc)
	 * @see er.extensions.foundation.ERXStatusInterface#status()
	 */
	public String status() {
		return _status;
	}

	/* (non-Javadoc)
	 * @see er.extensions.concurrency.IERXStoppable#stop()
	 */
	public void stop() {
		log.info("The task was stopped by the user.");
		_isStopped = true;
	}

}
