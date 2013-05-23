package com.webobjects.appserver._private;

/**
 * @author kkubacki
 */

import java.io.IOException;
import java.util.Random;

import org.apache.commons.lang.StringUtils;

import com.webobjects.appserver.WOApplication;
import com.webobjects.appserver.WOAssociation;
import com.webobjects.appserver.WOComponent;
import com.webobjects.appserver.WOContext;
import com.webobjects.appserver.WOResourceManager;
import com.webobjects.appserver.WOResponse;
import com.webobjects.foundation.NSData;
import com.webobjects.foundation.NSForwardException;
import com.webobjects.foundation.NSPathUtilities;
import com.webobjects.foundation.NSRange;


public class WOURLValuedElementData {

    public WOURLValuedElementData(final NSData someData, final String mimeType, final String key) {
        if (someData == null && key == null) {
            throw new IllegalArgumentException((new StringBuilder()).append("<").append(getClass().getName()).append(
                    "> No data and no key specified in constructor.").toString());
        }
        if (mimeType == null) {
            throw new IllegalArgumentException((new StringBuilder()).append("<").append(getClass().getName()).append(
                    "> No type specified in constructor.").toString());
        }
        _data = someData;
        _mimeType = mimeType;
        if (key == null) {
            _key = String.valueOf(_random.nextLong());
            _temporaryKey = true;
        } else {
            _key = key;
            _temporaryKey = false;
        }
    }

    public String key() {
        return _key;
    }

    public String type() {
        return _mimeType;
    }

    public NSData data() {
        return _data;
    }

    public boolean isTemporary() {
        return _temporaryKey;
    }

    @Override
    public String toString() {
        return (new StringBuilder()).append("<WOURLValuedElementData  data size: ").append(
                _data == null ? "0" : (new StringBuilder()).append("").append(_data.length()).toString()).append(
                " key: ").append(_key == null ? "null" : _key).append(" mimeType: ").append(
                _mimeType == null ? "null" : _mimeType.toString()).append(" >").toString();
    }

    public void appendToResponse(final WOResponse aResponse, final WOContext aContext) {
        NSData someData;
        if (_data != null) {
            someData = _data;
        } else {
            try {
                someData = new NSData(NSPathUtilities._URLWithPathURL(_key));
            } catch (IOException e) {
                throw NSForwardException._runtimeExceptionForThrowable(e);
            }
        }
        int aContentLength;
        if (someData != null) {
            aContentLength = someData.length();
        } else {
            aContentLength = 0;
        }
        aResponse.setHeader(WOShared.unsignedIntString(aContentLength), "content-length");
        aResponse.setContent(someData);
        aResponse.setHeader(_mimeType, "content-type");
    }

    public String dataURL(final WOContext context) {
        StringBuffer buffer = new StringBuffer(64);
        buffer.append("wodata");
        buffer.append('=');
        buffer.append(WOURLEncoder.encode(key()));
        String aQueryString = new String(buffer);
        int reqAppId = context.request().applicationNumber();
        String previousApplicationNumber = null;
        if (reqAppId > 0) {
            previousApplicationNumber = context._url().applicationNumber();
            context._url().setApplicationNumber((new StringBuilder()).append("").append(reqAppId).toString());
        }
        String aDataURL = context.urlWithRequestHandlerKey(
                WOApplication.application().resourceRequestHandlerKey(),
                null,
                aQueryString);
        if (reqAppId > 0) {
            context._url().setApplicationNumber(previousApplicationNumber);
        }
        return aDataURL;
    }

    protected static NSData _dataValueInComponent(final WOAssociation dataAssoc, final WOComponent aComponent) {
        NSData data = null;
        Object anObject = dataAssoc.valueInComponent(aComponent);
        if (anObject == null || (anObject instanceof NSData)) {
            data = (NSData) anObject;
        } else {
            byte b[] = (byte[]) anObject;
            data = new NSData(b, new NSRange(0, b.length), true);
        }
        return data;
    }

    public static Object _uvedInComponent(final WOAssociation keyAssoc, final WOAssociation dataAssoc, final WOAssociation mimeTypeAssoc, final WOComponent aComponent) {
        WOURLValuedElementData uved = null;
        String key = null;
        WOResourceManager resourceManager = WOApplication.application().resourceManager();
        if (keyAssoc != null) {
            Object keyValue = keyAssoc.valueInComponent(aComponent);
            if (keyValue != null) {
                key = keyValue.toString();
            }
        }
        if (key != null) {
            uved = resourceManager._cachedDataForKey(key);
        }
        if (uved == null) {
            NSData data = _dataValueInComponent(dataAssoc, aComponent);
            String type = (String) mimeTypeAssoc.valueInComponent(aComponent);
            if (data != null && type != null) {
                uved = new WOURLValuedElementData(data, type, key);
                resourceManager._cacheData(uved);
            }
        }
        if (uved == null) {
            return "/ERROR/NOT_FOUND/DYNAMIC_DATA";
        } else {
            return uved;
        }
    }

    protected static String _dataURL(final WOContext aContext, final WOAssociation keyAssoc, final WOAssociation dataAssoc, final WOAssociation mimeTypeAssoc, final WOComponent aComponent) {
        Object uved = _uvedInComponent(keyAssoc, dataAssoc, mimeTypeAssoc, aComponent);
        String urlAttributeValue = null;
        if (uved instanceof String) {
            urlAttributeValue = (String) uved;
        } else {
            urlAttributeValue = ((WOURLValuedElementData) uved).dataURL(aContext);
        }
        return operaImageHack(mimeTypeAssoc, aComponent, urlAttributeValue);
    }

    protected static String operaImageHack(final WOAssociation mimeTypeAssoc, final WOComponent aComponent, final String urlAttributeValue) {
        String type = (String) mimeTypeAssoc.valueInComponent(aComponent);
        if (StringUtils.isNotEmpty(type) && StringUtils.startsWithIgnoreCase(type, "image")) {
            return urlAttributeValue + "&i=img." + StringUtils.substringAfterLast(type, "/");
        }
        return urlAttributeValue;
    }

    public static void _appendDataURLAttributeToResponse(final WOResponse aResponse, final WOContext aContext, final WOAssociation keyAssoc, final WOAssociation dataAssoc, final WOAssociation mimeTypeAssoc, final String urlAttributeName, final WOComponent aComponent) {
        String urlAttributeValue = _dataURL(aContext, keyAssoc, dataAssoc, mimeTypeAssoc, aComponent);
        aResponse._appendTagAttributeAndValue(urlAttributeName, urlAttributeValue, false);
    }

    String        _key;
    String        _mimeType;
    NSData        _data;
    boolean       _temporaryKey;
    static Random _random = new Random();

}

