/*
 * bridge.jslib
 * Unity3D / JavaScript Bridge
 * Don Hopkins, Ground Up Software.
 */


var w = window;


if (!w.bridge) {
    w.bridge = {};
}


w.bridge._UnityToJSEventQueue = [];
w.bridge._JSToUnityEventQueue = [];


// Called by Unity to receive all events from JS.
w.bridge._ReceiveJSToUnityEvents = function() {
    var eventCount = w.bridge._JSToUnityEventQueue.length;
    if (eventCount == 0) {
        return null;
    }

    var str =
        w.bridge._JSToUnityEventQueue.join(',');

    w.bridge._JSToUnityEventQueue.splice(0, eventCount);

    var bufferSize = lengthBytesUTF8(str) + 1;
    var buffer = _malloc(bufferSize);
    stringToUTF8(str, buffer, bufferSize);

    return buffer;
};


// Called by Unity to queue events to JS.
w.bridge._SendUnityToJSEvents = function (evListStringPointer) {
    var evListString = Pointer_stringify(evListStringPointer);
    w.bridge._UnityToJSEventQueue.push(evListString);
};


// Called by Unity to distribute queued events from Unity to JS.
w.bridge._DistributeJSEvents = function() {
    var evList = null;
    var evListStringLength = 0;
    var evListString = w.bridge._ReceiveUnityToJSEvents();

    if (evListString) {
        var json = "[" + evListString + "]";
        evListStringLength = json.length;
        evList = JSON.parse(json);
    }

    w.DistributeEvents(evList, evListStringLength);
};

// Called by Unity when awakened.
w.bridge._HandleAwake = function() {
    console.log("bridge.jslib: w.bridge._HandleAwake");
};


// Called by Unity when destroyed.
w.bridge._HandleDestroy = function() {
    console.log("bridge.jslib: w.bridge._HandleDestroy");
};


// Called by Unity to evaluate JS code.
w.bridge._EvaluateJS = function(jsPointer) {
    var js = Pointer_stringify(jsPointer);
    console.log("bridge.jslib: w.bridge._EvaluateJS: js:", js);
    EvaluateJS(js);
};


// Called by JS to queue events to Unity.
w.bridge._SendJSToUnityEvents = function (evListString) {
    w.bridge._JSToUnityEventQueue.push(evListString);
};


// Called by JS to receive all events from Unity.
w.bridge._ReceiveUnityToJSEvents = function() {
    var eventCount = w.bridge._UnityToJSEventQueue.length;

    if (eventCount == 0) {
        return null;
    }

    var str =
        w.bridge._UnityToJSEventQueue.join(',');

    w.bridge._UnityToJSEventQueue.splice(0, eventCount);

    return str;
};


mergeInto(LibraryManager.library, w.bridge);
