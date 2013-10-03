#!/bin/sh

java -jar yuicompressor-2.4.7.jar -o ../WebServerResources/jquery/coreUtils-compressed.js ../WebServerResources/jquery/coreUtils.js 
java -jar yuicompressor-2.4.7.jar -o ../WebServerResources/jquery/wonder-jquery-compressed.js ../WebServerResources/jquery/wonder-jquery.js 
java -jar yuicompressor-2.4.7.jar -o ../WebServerResources/jsonrpc-compressed.js ../WebServerResources/jsonrpc.js 
