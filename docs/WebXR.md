WebXR Device API
W3C Candidate Recommendation Draft, 21 October 2024

More details about this document
This version:
https://www.w3.org/TR/2024/CRD-webxr-20241021/
Latest published version:
https://www.w3.org/TR/webxr/
Editor's Draft:
https://immersive-web.github.io/webxr/
Previous Versions:
https://www.w3.org/TR/2024/CRD-webxr-20240927/
History:
https://www.w3.org/standards/history/webxr/
Implementation Report:
https://wpt.fyi/results/webxr?label=master&label=experimental&aligned
Feedback:
GitHub
Editors:
Brandon Jones (Google)
Manish Goregaokar (Google [Mozilla until 2020])
Rik Cabanier (Meta)
Former Editor:
Nell Waliczek (Amazon [Microsoft until 2018])
Participate:
File an issue (open issues)
Mailing list archive
W3C’s #immersive-web IRC
Copyright © 2024 World Wide Web Consortium. W3C® liability, trademark and permissive document license rules apply.

Abstract
This specification describes support for accessing virtual reality (VR) and augmented reality (AR) devices, including sensors and head-mounted displays, on the Web.

Status of this document
This section describes the status of this document at the time of its publication. A list of current W3C publications and the latest revision of this technical report can be found in the W3C technical reports index at https://www.w3.org/TR/.

The Immersive Web Working Group maintains a list of all bug reports that the group has not yet addressed. This draft highlights some of the pending issues that are still to be discussed in the working group. No decision has been taken on the outcome of these issues including whether they are valid. Pull requests with proposed specification text for outstanding issues are strongly encouraged.

This document was published by the Immersive Web Working Group as a Candidate Recommendation Draft using the Recommendation track. This document is intended to become a W3C Recommendation.

Publication as a Candidate Recommendation does not imply endorsement by W3C and its Members. A Candidate Recommendation Draft integrates changes from the previous Candidate Recommendation that the Working Group intends to include in a subsequent Candidate Recommendation Snapshot. This is a draft document and may be updated, replaced or obsoleted by other documents at any time. It is inappropriate to cite this document as other than work in progress.

The entrance criteria for this document to enter the Proposed Recommendation stage is to have a minimum of two independent and interoperable user agents that implementation all the features of this specification, which will be determined by passing the user agent tests defined in the test suite developed by the Working Group. The Working Group will prepare an implementation report to track progress.

This document was produced by a group operating under the W3C Patent Policy. W3C maintains a public list of any patent disclosures made in connection with the deliverables of the group; that page also includes instructions for disclosing a patent. An individual who has actual knowledge of a patent which the individual believes contains Essential Claim(s) must disclose the information in accordance with section 6 of the W3C Patent Policy.

This document is governed by the 03 November 2023 W3C Process Document.

For changes since the last draft, see the Changes section.

Table of Contents
1Introduction
1.1Terminology
1.2Application flow
2Model
2.1XR device
3Initialization
3.1navigator.xr
3.2XRSystem
3.3XRSessionMode
3.4Feature Dependencies
4Session
4.1XRSession
4.2XRRenderState
4.3Animation Frames
4.4The XR Compositor
5Frame Loop
5.1XRFrame
6Spaces
6.1XRSpace
6.2XRReferenceSpace
6.3XRBoundedReferenceSpace
7Views
7.1XRView
7.2Primary and Secondary Views
7.3XRViewport
8Geometric Primitives
8.1Matrices
8.2Normalization
8.3XRRigidTransform
9Pose
9.1XRPose
9.2XRViewerPose
10Input
10.1XRInputSource
10.2Transient input
10.3XRInputSourceArray
11Layers
11.1XRLayer
11.2XRWebGLLayer
11.3WebGL Context Compatibility
12Events
12.1XRSessionEvent
12.2XRInputSourceEvent
12.3XRInputSourcesChangeEvent
12.4XRReferenceSpaceEvent
12.5Event Types
13Security, Privacy, and Comfort Considerations
13.1Sensitive Information
13.2User intention
13.2.1User activation
13.2.2Launching a web application
13.2.3Implicit and Explicit consent
13.2.4Duration of consent
13.3Mid-session consent
13.4Data adjustments
13.4.1Throttling
13.4.2Rounding, quantization, and fuzzing
13.4.3Limiting
13.5Protected functionality
13.5.1Immersiveness
13.5.2Poses
13.5.3Reference spaces
13.6Trusted Environment
13.7Context Isolation
13.8Fingerprinting
13.8.1Fingerprinting considerations of isSessionSupported()
13.8.2Considerations for when to automatically grant "xr-session-supported"
14Integrations
14.1Permissions Policy
14.2Permissions API Integration
Changes
Changes from the Candidate Recommendation Snapshot, 31 March 2022
Changes from the Working Draft 24 July 2020
Changes from the Working Draft 10 October 2019
Changes from the First Public Working Draft 5 Feburary 2019
15Acknowledgements
Conformance
Document conventions
Conformant Algorithms
Index
Terms defined by this specification
Terms defined by reference
References
Normative References
Informative References
IDL Index
1. Introduction
Hardware that enables Virtual Reality (VR) and Augmented Reality (AR) applications are now broadly available to consumers, offering an immersive computing platform with both new opportunities and challenges. The ability to interact directly with immersive hardware is critical to ensuring that the web is well equipped to operate as a first-class citizen in this environment.

Immersive computing introduces strict requirements for high-precision, low-latency communication in order to deliver an acceptable experience. It also brings unique security concerns for a platform like the web. The WebXR Device API provides the interfaces necessary to enable developers to build compelling, comfortable, and safe immersive applications on the web across a wide variety of hardware form factors.

Other web interfaces, such as the RelativeOrientationSensor and AbsoluteOrientationSensor, can be repurposed to surface input from some devices to polyfill the WebXR Device API in limited situations. These interfaces cannot support multiple features of high-end immersive experiences, however, such as 6DoF tracking, presentation to headset peripherals, or tracked input devices.

1.1. Terminology
This document uses the acronym XR throughout to refer to the spectrum of hardware, applications, and techniques used for Virtual Reality, Augmented Reality, and other related technologies. Examples include, but are not limited to:

Head-mounted displays, whether they are opaque, transparent, or utilize video passthrough

Mobile devices with positional tracking

Fixed displays with head tracking capabilities

The important commonality between them being that they offer some degree of spatial tracking with which to simulate a view of virtual content.

Terms like "XR device", "XR application", etc. are generally understood to apply to any of the above. Portions of this document that only apply to a subset of these devices will indicate so as appropriate.

The terms 3DoF and 6DoF are used throughout this document to describe the tracking capabilities of XR devices.

A 3DoF device, short for "Three Degrees of Freedom", is one that can only track rotational movement. This is common in devices which rely exclusively on accelerometer and gyroscope readings to provide tracking. 3DoF devices do not respond to translational movements from the user, though they may employ algorithms to estimate translational changes based on modeling of the neck or arms.

A 6DoF device, short for "Six Degrees of Freedom", is one that can track both rotation and translation, enabling precise 1:1 tracking in space. This typically requires some level of understanding of the user’s environment. That environmental understanding may be achieved via inside-out tracking, where sensors on the tracked device itself (such as cameras or depth sensors) are used to determine the device’s position, or outside-in tracking, where external devices placed in the user’s environment (like a camera or light emitting device) provides a stable point of reference against which the XR device can determine its position.

1.2. Application flow
Most applications using the WebXR Device API will follow a similar usage pattern:

Query navigator.xr.isSessionSupported() to determine if the desired type of XR content is supported by the hardware and UA.

If so, advertise the XR content to the user.

Wait for the window to have transient activation. This is most commonly indicated by the user clicking a button on the page indicating they want to begin viewing XR content.

Request an XRSession within the user activation event with navigator.xr.requestSession().

If the XRSession request succeeds, use it to run a frame loop to respond to XR input and produce images to display on the XR device in response.

Continue running the frame loop until the session is shut down by the UA or the user indicates they want to exit the XR content.

2. Model
2.1. XR device
An XR device is a physical unit of hardware that can present immersive content to the user. Content is considered to be "immersive" if it produces visual, audio, haptic, or other sensory output that simulates or augments various aspects of the user’s environment. Most frequently this involves tracking the user’s motion in space and producing outputs that are synchronized to the user’s movement. On desktop clients, this is usually a headset peripheral. On mobile clients, it may represent the mobile device itself in conjunction with a viewer harness. It may also represent devices without stereo-presentation capabilities but with more advanced tracking.

An XR device has a list of supported modes (a list of strings) that contains the enumeration values of XRSessionMode that the XR device supports.

Each XR device has a set of granted features for each XRSessionMode in its list of supported modes, which is a set of feature descriptors which MUST be initially an empty set.

The user agent has a list of immersive XR devices (a list of XR device), which MUST be initially an empty list.

The user agent has an immersive XR device (null or XR device) which is initially null and represents the active XR device from the list of immersive XR devices. This object MAY live on a separate thread and be updated asynchronously.

The user agent MUST have a default inline XR device, which is an XR device that MUST contain "inline" in its list of supported modes. The default inline XR device MUST NOT report any pose information, and MUST NOT report XR input sources or events other than those created by pointer events.

Note: The default inline XR device exists purely as a convenience for developers, allowing them to use the same rendering and input logic for both inline and immersive content. The default inline XR device does not expose any information not already available to the developer through other mechanisms on the page (such as pointer events for input), it only surfaces those values in an XR-centric format.

The user agent MUST have a inline XR device, which is an XR device that MUST contain "inline" in its list of supported modes. The inline XR device MAY be the immersive XR device if the tracking it provides makes sense to expose to inline content or the default inline XR device otherwise.

Note: On phones, the inline XR device may report pose information derived from the phone’s internal sensors, such as the gyroscope and accelerometer. On desktops and laptops without similar sensors, the inline XR device will not be able to report a pose, and as such should fall back to the default inline XR device. In case the user agent is already running on an XR device, the inline XR device will be the same device, and may support multiple views. User consent must be given before any tracking or input features beyond what the default inline XR device exposes are provided.

The current values of list of immersive XR devices, inline XR device, and immersive XR device MAY live on a separate thread and be updated asynchronously. These objects SHOULD NOT be directly accessed in steps that are not running in parallel.

3. Initialization
3.1. navigator.xr
partial interface Navigator {
  [SecureContext, SameObject] readonly attribute XRSystem xr;
};
The xr attribute’s getter MUST return the XRSystem object that is associated with it.

3.2. XRSystem
[SecureContext, Exposed=Window] interface XRSystem : EventTarget {
  // Methods
  Promise<boolean> isSessionSupported(XRSessionMode mode);
  [NewObject] Promise<XRSession> requestSession(XRSessionMode mode, optional XRSessionInit options = {});

  // Events
  attribute EventHandler ondevicechange;
};
The user agent MUST create an XRSystem object when a Navigator object is created and associate it with that object.

An XRSystem object is the entry point to the API, used to query for XR features available to the user agent and initiate communication with XR hardware via the creation of XRSessions.

The user agent MUST be able to enumerate immersive XR devices attached to the system, at which time each available device is placed in the list of immersive XR devices. Subsequent algorithms requesting enumeration MUST reuse the cached list of immersive XR devices. Enumerating the devices should not initialize device tracking. After the first enumeration the user agent MUST begin monitoring device connection and disconnection, adding connected devices to the list of immersive XR devices and removing disconnected devices.

Each time the list of immersive XR devices changes the user agent should select an immersive XR device by running the following steps:

Let oldDevice be the immersive XR device.

If the list of immersive XR devices is an empty list, set the immersive XR device to null.

If the list of immersive XR devices's size is one, set the immersive XR device to the list of immersive XR devices[0].

Set the immersive XR device as follows:

If there are any active XRSessions and the list of immersive XR devices contains oldDevice:
Set the immersive XR device to oldDevice.

Otherwise:
Set the immersive XR device to a device of the user agent’s choosing.

The user agent MAY update the inline XR device to the immersive XR device if appropriate, or the default inline XR device otherwise.

If this is the first time devices have been enumerated or oldDevice equals the immersive XR device, abort these steps.

Shut down any active XRSessions.

Queue a task to set the XR compatible boolean of all WebGLRenderingContextBase instances to false.

Queue a task to fire an event named devicechange on the relevant Global object's navigator's xr.

Queue a task to fire appropriate change events on any XRPermissionStatus objects who are affected by the change in the immersive XR device or inline XR device.

Note: These steps should always be run in parallel.

Note: The user agent is allowed to use any criteria it wishes to select an immersive XR device when the list of immersive XR devices contains multiple devices. For example, the user agent may always select the first item in the list, or provide settings UI that allows users to manage device priority. Ideally the algorithm used to select the default device is stable and will result in the same device being selected across multiple browsing sessions.

The user agent can ensure an immersive XR device is selected by running the following steps:

If immersive XR device is not null, return immersive XR device and abort these steps.

Enumerate immersive XR devices.

Select an immersive XR device.

Return the immersive XR device.

Note: These steps should always be run in parallel.

The ondevicechange attribute is an Event handler IDL attribute for the devicechange event type.

The isSessionSupported(mode) method queries if a given mode may be supported by the user agent and device capabilities.
When this method is invoked, it MUST run the following steps:

Let promise be a new Promise in the relevant realm of this XRSystem.

If mode is "inline", resolve promise with true and return it.

If the requesting document’s origin is not allowed to use the "xr-spatial-tracking" permissions policy, reject promise with a "SecurityError" DOMException and return it.

Check whether the session mode is supported as follows:

If the user agent and system are known to never support mode sessions
Resolve promise with false.

If the user agent and system are known to usually support mode sessions
promise MAY be resolved with true provided that all instances of this user agent indistinguishable by user agent string produce the same result here.

Otherwise
Run the following steps in parallel:

Let device be the result of ensuring an immersive XR device is selected.

If device is null, resolve promise with false and abort these steps.

If device’s list of supported modes does not contain mode, queue a task to resolve promise with false and abort these steps.

request permission to use the powerful feature "xr-session-supported" with XRSessionSupportedPermissionDescriptor with mode equal to mode. If it returns "denied" queue a task to resolve promise with false and abort these steps. See Fingerprinting considerations for more information.

queue a task to resolve promise with true.

Return promise.

Note: The purpose of isSessionSupported() is not to report with perfect accuracy the user agent’s ability to create an XRSession, but to inform the page whether or not advertising the ability to create sessions of the given mode is advised. A certain level of false-positives are expected, even when user agent checks for the presence of the necessary hardware/software prior to resolving the method. (For example, even if the appropriate hardware is present it may have given exclusive access to another application at the time a session is requested.)

It is expected that most pages with XR content will call isSessionSupported() early in the document lifecycle. As such, calling isSessionSupported() SHOULD avoid displaying any modal or otherwise intrusive UI. Calling isSessionSupported() MUST NOT trigger device-selection UI, MUST NOT interfere with any running XR applications on the system, and MUST NOT cause XR-related applications to launch such as system trays or storefronts.

The following code checks to see if immersive-vr sessions are supported.
const supported = await navigator.xr.isSessionSupported('immersive-vr');
if (supported) {
  // 'immersive-vr' sessions may be supported.
  // Page should advertise support to the user.
} else {
  // 'immersive-vr' sessions are not supported.
}
The XRSystem object has a pending immersive session boolean, which MUST be initially false, an active immersive session, which MUST be initially null, and a list of inline sessions, which MUST be initially empty.

The requestSession(mode, options) method attempts to initialize an XRSession for the given mode if possible, entering immersive mode if necessary.

When this method is invoked, the user agent MUST run the following steps:

Let promise be a new Promise in the relevant realm of this XRSystem.

Let immersive be true if mode is an immersive session mode, and false otherwise.

Let global object be the relevant Global object for the XRSystem on which this method was invoked.

Check whether the session request is allowed as follows:

If immersive is true:
Check if an immersive session request is allowed for the global object, and if not reject promise with a "SecurityError" DOMException and return promise.

If pending immersive session is true or active immersive session is not null, reject promise with an "InvalidStateError" DOMException and return promise.

Set pending immersive session to true.

Otherwise:
Check if an inline session request is allowed for the global object, and if not reject promise with a "SecurityError" DOMException and return promise.

Run the following steps in parallel:

Let requiredFeatures be options’ requiredFeatures.

Let optionalFeatures be options’ optionalFeatures.

Set device to the result of obtaining the current device for mode, requiredFeatures, and optionalFeatures.

Queue a task to perform the following steps:

If device is null or device’s list of supported modes does not contain mode, run the following steps:

Reject promise with a "NotSupportedError" DOMException.

If immersive is true, set pending immersive session to false.

Abort these steps.

Let descriptor be an XRPermissionDescriptor initialized with mode, requiredFeatures, and optionalFeatures

Let status be an XRPermissionStatus, initially null

Request the xr permission with descriptor and status.

If status’ state is "denied" run the following steps:

Reject promise with a "NotSupportedError" DOMException.

If immersive is true, set pending immersive session to false.

Abort these steps.

Let granted be a set obtained from status’ granted.

Let session be a new XRSession object in the relevant realm of this XRSystem.

Initialize the session with session, mode, granted, and device.

Potentially set the active immersive session as follows:

If immersive is true:
Set the active immersive session to session, and set pending immersive session to false.

Otherwise:
Append session to the list of inline sessions.

Resolve promise with session.

Queue a task to perform the following steps:

Note: These steps ensure that initial inputsourceschange events occur after the initial session is resolved.
Set session’s promise resolved flag to true.

Let sources be any existing input sources attached to session.

If sources is non-empty, perform the following steps:

Set session’s list of active XR input sources to sources.

Fire an XRInputSourcesChangeEvent named inputsourceschange on session with added set to sources.

Return promise.

To obtain the current device for an XRSessionMode mode, requiredFeatures, and optionalFeatures the user agent MUST run the following steps:

Choose device as follows:

If mode is an immersive session mode:
Set device to the result of ensuring an immersive XR device is selected.

Else if requiredFeatures or optionalFeatures are not empty:
Set device to the inline XR device.

Otherwise:
Set device to the default inline XR device.

Return device.

Note: These steps should always be run in parallel.

The following code attempts to retrieve an immersive-vr XRSession.
const xrSession = await navigator.xr.requestSession("immersive-vr");
3.3. XRSessionMode
The XRSessionMode enum defines the modes that an XRSession can operate in.

enum XRSessionMode {
  "inline",
  "immersive-vr",
  "immersive-ar"
};
A session mode of inline indicates that the session’s output will be shown as an element in the HTML document. inline session content MUST be displayed in mono (i.e., with a single view). It MAY allow for viewer tracking. User agents MUST allow inline sessions to be created.

A session mode of immersive-vr indicates that the session’s output will be given exclusive access to the immersive XR device display and that content is not intended to be integrated with the user’s environment.

The behavior of the immersive-ar session mode is defined in the WebXR AR Module and MUST NOT be added to the immersive XR device's list of supported modes unless the UA implements that module.

In this document, the term inline session is synonymous with an inline session and the term immersive session refers to either an immersive-vr or immersive-ar session.

Immersive sessions MUST provide some level of viewer tracking, and content MUST be shown at the proper scale relative to the user and/or the surrounding environment. Additionally, Immersive sessions MUST be given exclusive access to the immersive XR device, meaning that while the immersive session is "visible" the HTML document is not shown on the immersive XR device's display, nor does content from any other source have exclusive access. Exclusive access does not prevent the user agent from overlaying its own UI, however this UI SHOULD be minimal.

Note: UA may choose to overlay content for accessibility or safety such as guardian boundaries, obstructions or the user’s hands when there are no alternative input sources.

Note: Future specifications or modules may expand the definition of immersive session to include additional session modes.

Note: Examples of ways exclusive access may be presented include stereo content displayed on a virtual reality headset.

Note: As an example of overlaid UI, the user agent or operating system in an immersive session may show notifications over the rendered content.

Note: While the HTML document is not shown on the immersive XR device's display during an immersive session, it may still be shown on a separate display, e.g. when the user is entering the immersive session from a 2d browser on their computer tethered to their immersive XR device.

3.4. Feature Dependencies
Some features of an XRSession may not be universally available for a number of reasons, among which is the fact not all XR devices can support the full set of features. Another consideration is that some features expose sensitive information which may require a clear signal of user intent before functioning.

Since it is a poor user experience to initialize the underlying XR platform and create an XRSession only to immediately notify the user that the applications cannot function correctly, developers can indicate required features by passing an XRSessionInit dictionary to requestSession(). This will block the creation of the XRSession if any of the required features are unavailable due to device limitations or in the absence of a clear signal of user intent to expose sensitive information related to the feature.

Additionally, developers are encouraged to design experiences which progressively enhance their functionality when run on more capable devices. Optional features which the experience does not require but will take advantage of when available must also be indicated in an XRSessionInit dictionary to ensure that user intent can be determined before enabling the feature if necessary.

dictionary XRSessionInit {
  sequence<DOMString> requiredFeatures;
  sequence<DOMString> optionalFeatures;
};
The requiredFeatures array contains any Required features for the experience. If any value in the list is not a recognized feature descriptor the XRSession will not be created. If any feature listed in the requiredFeatures array is not supported by the XR device or, if necessary, has not received a clear signal of user intent the XRSession will not be created.

The optionalFeatures array contains any Optional features for the experience. If any value in the list is not a recognized feature descriptor it will be ignored. Features listed in the optionalFeatures array will be enabled if supported by the XR device and, if necessary, given a clear signal of user intent, but will not block creation of the XRSession if absent.

Values given in the feature lists are considered a valid feature descriptor if the value is one of the following:

The string representation of any XRReferenceSpaceType enum value

Future iterations of this specification and additional modules may expand the list of accepted feature descriptors.

Note: If a feature needs additional initialization, XRSessionInit should be extended with a new field for that feature.

Depending on the XRSessionMode requested, certain feature descriptors are added to the requiredFeatures or optionalFeatures lists by default. The following table describes the default features associated with each session type and feature list:

Feature	Sessions	List
"viewer"	Inline sessions and immersive sessions	requiredFeatures
"local"	Immersive sessions	requiredFeatures
The combined list of feature descriptors given by the requiredFeatures and optionalFeatures are collectively considered the requested features for an XRSession.

Some feature descriptors, when present in the requested features list, are subject to permissions policy and/or requirements that user intent to use the feature is well understood, via either explicit consent or implicit consent. The following table describes the feature requirements that must be satisfied prior to being enabled:

Feature	Permissions Policy Required	Consent Required
"local"	"xr-spatial-tracking"	Inline sessions require consent
"local-floor"	"xr-spatial-tracking"	Always requires consent
"bounded-floor"	"xr-spatial-tracking"	Always requires consent
"unbounded"	"xr-spatial-tracking"	Always requires consent
Note: "local" is always included in the requested features of immersive sessions as a default feature, and as such immersive sessions always need to obtain explicit consent or implicit consent.

Requested features can only be enabled for a session if the XR device is capable of supporting the feature, which means that the feature is known to be supported by the XR device in some configurations, even if the current configuration has not yet been verified as supporting the feature. The user agent MAY apply more rigorous constraints if desired in order to yield a more consistent user experience.

Note: For example, several VR devices support either configuring a safe boundary for the user to move around within or skipping boundary configuration and operating in a mode where the user is expected to stand in place. Such a device can be considered to be capable of supporting "bounded-floor" XRReferenceSpaces even if they are currently not configured with safety boundaries, because it’s expected that the user could configure the device appropriately if the experience required it. This is to allow user agents to avoid fully initializing the XR device or waiting for the user’s environment to be recognized prior to resolving the requested features if desired. If, however, the user agent knows the boundary state at the time the session is requested without additional initialization it may choose to reject the "bounded-floor" feature if the safety boundary is not already configured.

4. Session
4.1. XRSession
Any interaction with XR hardware is done via an XRSession object, which can only be retrieved by calling requestSession() on the XRSystem object. Once a session has been successfully acquired, it can be used to poll the viewer pose, query information about the user’s environment, and present imagery to the user.

The user agent, when possible, SHOULD NOT initialize device tracking or rendering capabilities until an XRSession has been acquired. This is to prevent unwanted side effects of engaging the XR systems when they’re not actively being used, such as increased battery usage or related utility applications from appearing when first navigating to a page that only wants to test for the presence of XR hardware in order to advertise XR features. Not all XR platforms offer ways to detect the hardware’s presence without initializing tracking, however, so this is only a strong recommendation.

enum XRVisibilityState {
  "visible",
  "visible-blurred",
  "hidden",
};

[SecureContext, Exposed=Window] interface XRSession : EventTarget {
  // Attributes
  readonly attribute XRVisibilityState visibilityState;
  readonly attribute float? frameRate;
  readonly attribute Float32Array? supportedFrameRates;
  [SameObject] readonly attribute XRRenderState renderState;
  [SameObject] readonly attribute XRInputSourceArray inputSources;
  [SameObject] readonly attribute XRInputSourceArray trackedSources;
  readonly attribute FrozenArray<DOMString> enabledFeatures;
  readonly attribute boolean isSystemKeyboardSupported;

  // Methods
  undefined updateRenderState(optional XRRenderStateInit state = {});
  Promise<undefined> updateTargetFrameRate(float rate);
  [NewObject] Promise<XRReferenceSpace> requestReferenceSpace(XRReferenceSpaceType type);

  unsigned long requestAnimationFrame(XRFrameRequestCallback callback);
  undefined cancelAnimationFrame(unsigned long handle);

  Promise<undefined> end();

  // Events
  attribute EventHandler onend;
  attribute EventHandler oninputsourceschange;
  attribute EventHandler onselect;
  attribute EventHandler onselectstart;
  attribute EventHandler onselectend;
  attribute EventHandler onsqueeze;
  attribute EventHandler onsqueezestart;
  attribute EventHandler onsqueezeend;
  attribute EventHandler onvisibilitychange;
  attribute EventHandler onframeratechange;
};
Each XRSession has a mode, which is one of the values of XRSessionMode.

Each XRSession has an animation frame, which is an XRFrame initialized with active set to false, animationFrame set to true, and session set to the XRSession.

Each XRSession has a set of granted features, which is a set of DOMStrings corresponding to the feature descriptors that have been granted to the XRSession.

The enabledFeatures attribute returns the features in the set of granted features as a new array of DOMStrings.

The isSystemKeyboardSupported attribute indicates that the XRSystem has the ability to display the system keyboard while the XRSession is active. If isSystemKeyboardSupported is true, Web APIs that would trigger the overlay keyboard (such as focus) will show the system keyboard. The XRSession MUST set the visibility state of the XRSession to "visible-blurred" while the keyboard is shown.

To initialize the session, given session, mode, granted, and device, the user agent MUST run the following steps:

Set session’s mode to mode.

Set session’s XR device to device.

Set session’s set of granted features to granted.

Initialize the render state.

If no other features of the user agent have done so already, perform the necessary platform-specific steps to initialize the device’s tracking and rendering capabilities, including showing any necessary instructions to the user.

Note: Some devices require additional user instructions for activation. For example, going into immersive mode on a phone-based headset device requires inserting the phone into the headset, and doing so on a desktop browser connected to an external headset requires wearing the headset. It is the responsibility of the user agent — not the author — to ensure any such instructions are shown.

A number of different circumstances may shut down the session, which is permanent and irreversible. Once a session has been shut down the only way to access the XR device's tracking or rendering capabilities again is to request a new session. Each XRSession has an ended boolean, initially set to false, that indicates if it has been shut down.

When an XRSession session is shut down the following steps are run:

Set session’s ended value to true.

If the active immersive session is equal to session, set the active immersive session to null.

Remove session from the list of inline sessions.

Reject any outstanding promises returned by session with an InvalidStateError, except for any promises returned by end().

If no other features of the user agent are actively using them, perform the necessary platform-specific steps to shut down the device’s tracking and rendering capabilities. This MUST include:

Releasing exclusive access to the XR device if session is an immersive session.

Deallocating any graphics resources acquired by session for presentation to the XR device.

Putting the XR device in a state such that a different source may be able to initiate a session with the same device if session is an immersive session.

Queue a task that fires an XRSessionEvent named end on session.

The end() method provides a way to manually shut down a session. When invoked, it MUST run the following steps:

Let promise be a new Promise in the relevant realm of this XRSession.

If the ended value of this is true, reject promise with a "InvalidStateError" DOMException and return promise.

Shut down this.

Queue a task to perform the following steps:

Wait until any platform-specific steps related to shutting down the session have completed.

Resolve promise.

Return promise.

Each XRSession has an active render state which is a new XRRenderState, and a pending render state, which is an XRRenderState which is initially null.

The renderState attribute returns the XRSession's active render state.

Each XRSession has a minimum inline field of view and a maximum inline field of view, defined in radians. The values MUST be determined by the user agent and MUST fall in the range of 0 to PI.

Each XRSession has a minimum near clip plane and a maximum far clip plane, defined in meters. The values MUST be determined by the user agent and MUST be non-negative. The minimum near clip plane SHOULD be less than 0.1. The maximum far clip plane SHOULD be greater than 1000.0 (and MAY be infinite).

When the user agent will update the pending layers state with XRSession session and XRRenderStateInit newState, it must run the following steps:

If newState’s layers's value is not null, throw a NotSupportedError.

NOTE: The WebXR layers module will introduce new semantics for this algorithm.

When the user agent wants to apply the nominal frame rate rate on an XRSession session, it MUST run the following steps:

If rate is the same as session’s internal nominal framerate, abort these steps.

If session’s ended value is true, abort these steps.

Set session’s internal nominal framerate to rate.

Fire an XRSessionEvent event named frameratechange on session.

The updateTargetFrameRate(rate) method passes the target frame rate rate to the XRSession.

When this method is invoked, the user agent MUST run the following steps:

Let session be this.

Let promise be a new Promise in the relevant realm of session.

If the session has no internal nominal framerate, reject promise with an "InvalidStateError" DOMException and return promise.

If session’s ended value is true, reject promise with an "InvalidStateError" DOMException and return promise.

If rate is not in supportedFrameRates, reject promise with an "TypeError" DOMException and return promise.

Set session’s internal target framerate to rate.

Queue a task to perform the following steps:

The XR Compositor MAY use rate to calculate a new display frame rate and/or nominal frame rate.

Let newrate be the new nominal frame rate.

Queue a task to perform the following steps:

Await until the XRSystem's actions to update the nominal frame rate to newrate have taken effect.

Apply the nominal frame rate with newrate and session.

Resolve promise.

Return promise.

If the XR Compositor changes the nominal frame rate for any reason (for example during a "visible-blurred" event), it SHOULD use the internal target framerate once the event that caused the frame rate change has ended.

The updateRenderState(newState) method queues an update to the active render state to be applied on the next frame. Unset fields of the XRRenderStateInit newState passed to this method will not be changed.

When this method is invoked, the user agent MUST run the following steps:

Let session be this.

If session’s ended value is true, throw an InvalidStateError and abort these steps.

If newState’s baseLayer was created with an XRSession other than session, throw an InvalidStateError and abort these steps.

If newState’s inlineVerticalFieldOfView is set and session is an immersive session, throw an InvalidStateError and abort these steps.

If none of newState’s depthNear, depthFar, inlineVerticalFieldOfView, baseLayer, layers are set, abort these steps.

Run update the pending layers state with session and newState.

Let activeState be session’s active render state.

If session’s pending render state is null, set it to a copy of activeState.

If newState’s depthNear value is set, set session’s pending render state's depthNear to newState’s depthNear.

If newState’s depthFar value is set, set session’s pending render state's depthFar to newState’s depthFar.

If newState’s inlineVerticalFieldOfView is set, set session’s pending render state's inlineVerticalFieldOfView to newState’s inlineVerticalFieldOfView.

If newState’s baseLayer is set, set session’s pending render state's baseLayer to newState’s baseLayer.

When requested, the XRSession session MUST apply the pending render state by running the following steps:

Let activeState be session’s active render state.

Let newState be session’s pending render state.

Set session’s pending render state to null.

Let oldBaseLayer be activeState’s baseLayer.

Let oldLayers be activeState’s layers.

Queue a task to perform the following steps:

Set activeState to newState.

If oldBaseLayer is not equal to activeState’s baseLayer, oldLayers is not equal to activeState’s layers, or the dimensions of any of the layers have changed, update the viewports for session.

If activeState’s inlineVerticalFieldOfView is less than session’s minimum inline field of view set activeState’s inlineVerticalFieldOfView to session’s minimum inline field of view.

If activeState’s inlineVerticalFieldOfView is greater than session’s maximum inline field of view set activeState’s inlineVerticalFieldOfView to session’s maximum inline field of view.

If activeState’s depthNear is less than session’s minimum near clip plane set activeState’s depthNear to session’s minimum near clip plane.

If activeState’s depthFar is greater than session’s maximum far clip plane set activeState’s depthFar to session’s maximum far clip plane.

Let baseLayer be activeState’s baseLayer.

Set activeState’s composition enabled and output canvas as follows:

If session’s mode is "inline" and baseLayer is an instance of an XRWebGLLayer with composition enabled set to false:
Set activeState’s composition enabled boolean to false.

Set activeState’s output canvas to baseLayer’s context's canvas.

Otherwise:
Set activeState’s composition enabled boolean to true.

Set activeState’s output canvas to null.

The requestReferenceSpace(type) method constructs a new XRReferenceSpace of a given type, if possible.
When this method is invoked, the user agent MUST run the following steps:

Let promise be a new Promise in the relevant realm of this XRSession.

Run the following steps in parallel:

If the result of running reference space is supported for type and session is false, queue a task to reject promise with a NotSupportedError and abort these steps.

Set up any platform resources required to track reference spaces of type type.

User agents need not wait for tracking to be established for such reference spaces to resolve requestReferenceSpace(). It is okay for getViewerPose() to return null when the session is initially attempting to establish tracking, and content can use this time to show a splash screen or something else. Note that if type is "bounded-floor", and the bounds have not yet been established, user agents MAY set the bounds to a small initial area and use a reset event when bounds are established.
Queue a task to run the following steps:

Create a reference space, referenceSpace, with type and session.

Resolve promise with referenceSpace.

Return promise.

Each XRSession has a list of active XR input sources (a list of XRInputSource) and a list of active XR tracked sources (a list of XRInputSource) which MUST both be initially an empty list.

Each XRSession has an XR device, which is an XR device set at initialization.

The inputSources attribute returns the XRSession's list of active XR input sources.

The trackedSources attribute returns the XRSession's list of active XR tracked sources.

The user agent MUST monitor any XR input sources associated with the XR device, including detecting when XR input sources are added, removed, or changed.

Each XRSession has a promise resolved flag, initially false.

NOTE: The purpose of this flag is to ensure that the add input source, remove input source, and change input source algorithms do not run until the user code actually has had a chance to attach event listeners. Implementations may not need this flag if they simply choose to start listening for input source changes after the session resolves.

When new XR input sources become available for XRSession session, the user agent MUST run the following steps:

If session’s promise resolved flag is not set, abort these steps.

Let added primary sources be a new list.

Let added tracked sources be a new list.

For each new XR input source:

Let inputSource be a new XRInputSource in the relevant realm of this XRSession, then perform the following step:

If inputSource is a primary input source:
Add inputSource to added primary sources.

Otherwise:
Add inputSource to added tracked sources.

Queue a task to perform the following steps:

Extend session’s list of active XR input sources with added primary sources.

If added primary sources is not empty, fire an XRInputSourcesChangeEvent named inputsourceschange on session with added set to added primary sources.

Extend session’s list of active XR tracked sources with added tracked sources.

If added tracked sources is not empty, fire an XRInputSourcesChangeEvent named trackedsourceschange on session with added set to added tracked sources.

When any previously added XR input sources are no longer available for XRSession session, the user agent MUST run the following steps:

If session’s promise resolved flag is not set, abort these steps.

Let removed primary sources be a new list.

Let removed tracked sources be a new list.

For each XR input source that is no longer available:

Let inputSource be the XRInputSource in session’s list of active XR input sources associated with the XR input source, then perform the following step:

If inputSource is a primary input source:
Add inputSource to removed primary sources.

Otherwise:
Add inputSource to removed tracked sources.

Queue a task to perform the following steps:

Remove each XRInputSource in removed primary sources from session’s list of active XR input sources.

If removed primary sources is not empty, fire an XRInputSourcesChangeEvent named inputsourceschange on session with removed set to removed primary sources.

Remove each XRInputSource in removed tracked sources from session’s list of active XR tracked sources.

If removed tracked sources is not empty, fire an XRInputSourcesChangeEvent named trackedsourceschange on session with removed set to removed tracked sources.

Note: The user agent MAY fire this event when an input source temporarily loses both position and orientation tracking. It is recommended that this only be done for physical handheld controller input sources. It is not recommended that this event be fired when this happens for tracked hand input sources, because this will happen often, nor is it recommended when this happens for tracker object input sources, since this makes it harder for the application to maintain a notion of identity.

When the handedness, targetRayMode, profiles, presence of a gripSpace or the status as a primary input source or tracked input source for any XR input sources change for XRSession session, the user agent MUST run the following steps:

If session’s promise resolved flag is not set, abort these steps.

Let added primary sources be a new list.

Let removed primary sources be a new list.

Let added tracked sources be a new list.

Let removed tracked sources be a new list.

For each changed XR input source:

Let oldInputSource be the XRInputSource in session’s list of active XR input sources previously associated with the XR input source, then perform the following step:

If oldInputSource is a primary input source or its state changed from a primary input source to tracked input source a:
Add oldInputSource to removed primary sources.

Otherwise:
Add oldInputSource to removed tracked sources.

Let newInputSource be a new XRInputSource in the relevant realm of session, then perform the following step:

If newInputSource is a primary input source or its state changed from a tracked input source to primary input source :
Add newInputSource to added primary sources.

Otherwise:
Add newInputSource to added tracked sources.

Queue a task to perform the following steps:

Remove each XRInputSource in removed primary sources from session’s list of active XR input sources.

Extend session’s list of active XR input sources with added primary sources.

If added primary sources or removed primary sources are not empty, fire an XRInputSourcesChangeEvent named inputsourceschange on session withadded set to added primary sources and removed set to removed primary sources.

Remove each XRInputSource in removed tracked sources from session’s list of active XR tracked sources.

Extend session’s list of active XR input sources with added tracked sources.

If added tracked sources or removed tracked sources are not empty, fire an XRInputSourcesChangeEvent named trackedsourceschange on session with added set to added tracked sources and removed set to removed tracked sources.

Each XRSession has a visibility state value, which is an enum. For inline sessions the visibility state MUST mirror the Document's visibilityState. For immersive sessions the visibility state MUST be set to whichever of the following values best matches the state of session.

A state of visible indicates that imagery rendered by the XRSession can be seen by the user and requestAnimationFrame() callbacks are processed at the XR device's native refresh rate. Input is processed by the XRSession normally.

A state of visible-blurred indicates that imagery rendered by the XRSession may be seen by the user, but is not the primary focus. requestAnimationFrame() callbacks MAY be throttled. Input is not processed by the XRSession.

A state of hidden indicates that imagery rendered by the XRSession cannot be seen by the user. requestAnimationFrame() callbacks will not be processed until the visibility state changes. Input is not processed by the XRSession.

The visibilityState attribute returns the XRSession's visibility state. The onvisibilitychange attribute is an Event handler IDL attribute for the visibilitychange event type.

The visibility state MAY be changed by the user agent at any time other than during the processing of an XR animation frame, and the user agent SHOULD monitor the XR platform when possible to observe when session visibility has been affected external to the user agent and update the visibility state accordingly.

Note: The XRSession's visibility state does not necessarily imply the visibility of the HTML document. Depending on the system configuration the page may continue to be visible while an immersive session is active. (For example, a headset connected to a PC may continue to display the page on the monitor while the headset is viewing content from an immersive session.) Developers should continue to rely on the Page Visibility to determine page visibility.

Note: The XRSession's visibility state does not affect or restrict mouse behavior on tethered sessions where 2D content is still visible while an immersive session is active. Content should consider using the [pointerlock] API if it wishes to have stronger control over mouse behavior.

In an XRSystem, there are several definitions which can describe a frame rate:

The nominal frame rate: the rate at which the XRSystem is asking the experience to render frames to maintain nominal performance. Experiences that miss frames may not end up actually getting calls to requestAnimationFrame() this many times per second, but that is what the XRSystem is aiming to achieve.

The effective frame rate: a performance measurement of how many calls to requestAnimationFrame() the experience is actually managing to process each second. This will fluctuate based on the experience hitting or missing the XRSystem's frame timing.

The target frame rate: the experience’s hint to the XRSystem on what nominal frame rate it prefers to target.

The display frame rate: the actual rate at which frames are drawn to the physical display, which MAY be derived from the experience’s nominal frame rate. This is a hardware implementation detail that is not exposed to the experience.

Each XRSession MAY have an internal target frameRate which is the target frame rate.

Each XRSession MAY have an internal nominal frameRate which is the nominal frame rate. If the effective frame rate is lower than the nominal frame rate, the XR Compositor MAY use reprojection or other techniques to improve the experience. It is optional and MUST NOT be present for inline sessions.

The frameRate attribute reflects the internal nominal framerate. If the XRSession has no internal nominal framerate, return null.

The onframeratechange attribute is an Event handler IDL attribute for the frameratechange event type. If XRSession's nominal frame rate is changed for any reason, it MUST apply the nominal frame rate with the new nominal frame rate and the XRSession.

The supportedFrameRates attribute returns a list of supported target frame rate values. This attribute is optional and MUST NOT be present for inline sessions or for an XRSystem that doesn’t let the author control the frame rate. If the XRSession supports the supportedFrameRates attribute, it also MUST support frameRate.

Each XRSession has a viewer reference space, which is an XRReferenceSpace of type "viewer" with an identity transform origin offset.

Each XRSession has a list of views, which is a list of views corresponding to the views provided by the XR device. If the XRSession's renderState's composition enabled boolean is set to false the list of views MUST contain a single view. The list of views is immutable during the XRSession and MUST contain any views that may be surfaced during the session, including secondary views that may not initially be active.

The onend attribute is an Event handler IDL attribute for the end event type.

The oninputsourceschange attribute is an Event handler IDL attribute for the inputsourceschange event type.

The onselectstart attribute is an Event handler IDL attribute for the selectstart event type.

The onselectend attribute is an Event handler IDL attribute for the selectend event type.

The onselect attribute is an Event handler IDL attribute for the select event type.

The onsqueezestart attribute is an Event handler IDL attribute for the squeezestart event type.

The onsqueezeend attribute is an Event handler IDL attribute for the squeezeend event type.

The onsqueeze attribute is an Event handler IDL attribute for the squeeze event type.

4.2. XRRenderState
An XRRenderState represents a set of configurable values which affect how an XRSession's output is composited. The active render state for a given XRSession can only change between frame boundaries, and updates can be queued up via updateRenderState().

dictionary XRRenderStateInit {
  double depthNear;
  double depthFar;
  double inlineVerticalFieldOfView;
  XRWebGLLayer? baseLayer;
  sequence<XRLayer>? layers;
};

[SecureContext, Exposed=Window] interface XRRenderState {
  readonly attribute double depthNear;
  readonly attribute double depthFar;
  readonly attribute double? inlineVerticalFieldOfView;
  readonly attribute XRWebGLLayer? baseLayer;
};
Each XRRenderState has a output canvas, which is an HTMLCanvasElement initially set to null. The output canvas is the DOM element that will display any content rendered for an "inline" XRSession.

Each XRRenderState also has a composition enabled boolean, which is initially true. The XRRenderState is considered to have composition enabled if rendering commands are performed against a surface provided by the API and displayed by the XR Compositor. If rendering is performed for an "inline" XRSession in such a way that it is directly displayed into an output canvas, the XRRenderState's composition enabled flag MUST be false.

Note: At this point the XRRenderState will only have an output canvas if it has composition enabled set to false, but future versions of the specification are likely to introduce methods for setting output canvases that support more advanced uses like mirroring and layer compositing that will require composition.

When an XRRenderState object is created for an XRSession session, the user agent MUST initialize the render state by running the following steps:

Let state be a new XRRenderState object in the relevant realm of session.

Initialize state’s depthNear to 0.1.

Initialize state’s depthFar to 1000.0.

Initialize state’s inlineVerticalFieldOfView as follows:

If session is an inline session:
Initialize state’s inlineVerticalFieldOfView to PI * 0.5.

Otherwise:
Initialize state’s inlineVerticalFieldOfView to null.

Initialize state’s baseLayer to null.

The depthNear attribute defines the distance, in meters, of the near clip plane from the viewer. The depthFar attribute defines the distance, in meters, of the far clip plane from the viewer.

depthNear and depthFar are used in the computation of the projectionMatrix of XRViews. When the projectionMatrix is used during rendering, only geometry with a distance to the viewer that falls between depthNear and depthFar will be drawn. They also determine how the values of an XRWebGLLayer depth buffer are interpreted. depthNear MAY be greater than depthFar.

Note: Typically when constructing a perspective projection matrix for rendering the developer specifies the viewing frustum and the near and far clip planes. When displaying to an immersive XR device the correct viewing frustum is determined by some combination of the optics, displays, and cameras being used. The near and far clip planes, however, may be modified by the application since the appropriate values depend on the type of content being rendered.

The inlineVerticalFieldOfView attribute defines the default vertical field of view in radians used when computing projection matrices for "inline" XRSessions. The projection matrix calculation also takes into account the aspect ratio of the output canvas. This value MUST be null for immersive sessions.

The baseLayer attribute defines an XRWebGLLayer which the XR compositor will obtain images from.

4.3. Animation Frames
The primary way an XRSession provides information about the tracking state of the XR device is via callbacks scheduled by calling requestAnimationFrame() on the XRSession instance.

callback XRFrameRequestCallback = undefined (DOMHighResTimeStamp time, XRFrame frame);
Each XRFrameRequestCallback object has a cancelled boolean initially set to false.

Each XRSession has a list of animation frame callbacks, which is initially empty, a list of currently running animation frame callbacks, which is also initially empty, and an animation frame callback identifier, which is a number which is initially zero.

The requestAnimationFrame(callback) method queues up callback for being run the next time the user agent wishes to run an animation frame for the device.

When this method is invoked, the user agent MUST run the following steps:

Let session be this.

If session’s ended value is true, return 0 and abort these steps.

Increment session’s animation frame callback identifier by one.

Append callback to session’s list of animation frame callbacks, associated with session’s animation frame callback identifier’s current value.

Return session’s animation frame callback identifier’s current value.

The cancelAnimationFrame(handle) method cancels an existing animation frame callback given its animation frame callback identifier handle.

When this method is invoked, the user agent MUST run the following steps:

Let session be this.

Find the entry in session’s list of animation frame callbacks or session’s list of currently running animation frame callbacks that is associated with the value handle.

If there is such an entry, set its cancelled boolean to true and remove it from session’s list of animation frame callbacks.

To check the layers state with renderState state, the user agent MUST run the following steps:
If state’s baseLayer is null, return false.

return true.

NOTE: The WebXR layers module will introduce new semantics for this algorithm.

To determine if a frame should be rendered for XRSession session, the user agent MUST run the following steps:
If check the layers state with session’s renderState is false, return false.

If session’s mode is "inline" and session’s renderState's output canvas is null, return false.

return true.

When an XRSession session receives updated viewer state for timestamp frameTime from the XR device, it runs an XR animation frame, which MUST run the following steps regardless of if the list of animation frame callbacks is empty or not:

Queue a task to perform the following steps:

Let now be the current high resolution time.

Let frame be session’s animation frame.

Set frame’s time to frameTime.

Set frame’s predictedDisplayTime to frameTime.

If session’s mode is not "inline", set frame’s predictedDisplayTime to the average timestamp the XR Compositor is expected to display this XR animation frame.

For each view in list of views, set view’s viewport modifiable flag to true.

If the active flag of any view in the list of views has changed since the last XR animation frame, update the viewports.

If the frame should be rendered for session:

Set session’s list of currently running animation frame callbacks to be session’s list of animation frame callbacks.

Set session’s list of animation frame callbacks to the empty list.

Set frame’s active boolean to true.

Apply frame updates for frame.

For each entry in session’s list of currently running animation frame callbacks, in order:

If the entry’s cancelled boolean is true, continue to the next entry.

Invoke entry with « now, frame » and "report".

Set session’s list of currently running animation frame callbacks to the empty list.

Set frame’s active boolean to false.

If session’s pending render state is not null, apply the pending render state.

The behavior of the Window interface’s requestAnimationFrame() method is not changed by the presence of any active XRSession, nor does calling requestAnimationFrame() on any XRSession interact with Window's requestAnimationFrame() in any way. An active immersive session MAY affect the rendering opportunity of a browsing context if it causes the page to be obscured. If the 2D browser view is visible during an active immersive session (i.e., when the sesson is running on a tethered headset), the timing of callbacks run with Window's requestAnimationFrame() and requestIdleCallback() MAY NOT coincide with that of the session’s requestAnimationFrame() and should not be relied upon by the user for rendering XR content.

Note: User agents may wish to display a warning to the developer console if XRSession's requestAnimationFrame() is called during callbacks scheduled via Window's requestAnimationFrame(), as these callbacks are not guaranteed to occur if the active immersive session affects the rendering opportunity of the browsing context, and may not have the correct timing even if they run.

If an immersive session prevents rendering opportunities then callbacks supplied to Window requestAnimationFrame() may not be processed while the session is active. This depends on the type of device being used and is most likely to happen depend on mobile or standalone devices where the immersive content completely obscures the HTML document. As such, developers must not rely on Window requestAnimationFrame() callbacks to schedule XRSession requestAnimationFrame() callbacks and visa-versa, even if they share the same rendering logic. Applications that do not follow this guidance may not execute properly on all platforms. A more effective pattern for applications that wish to transition between these two types of animation loops is demonstrated below:
let xrSession = null;

function onWindowAnimationFrame(time) {
  window.requestAnimationFrame(onWindowAnimationFrame);

  // This may be called while an immersive session is running on some devices,
  // such as a desktop with a tethered headset. To prevent two loops from
  // rendering in parallel, skip drawing in this one until the session ends.
  if (!xrSession) {
    renderFrame(time, null);
  }
}

// The window animation loop can be started immediately upon the page loading.
window.requestAnimationFrame(onWindowAnimationFrame);

function onXRAnimationFrame(time, xrFrame) {
  xrSession.requestAnimationFrame(onXRAnimationFrame);
  renderFrame(xrFrame.predictedDisplayTime, xrFrame);
}

function renderFrame(time, xrFrame) {
  // Shared rendering logic.
}

// Assumed to be called by a user gesture event elsewhere in code.
async function startXRSession() {
  xrSession = await navigator.xr.requestSession('immersive-vr');
  xrSession.addEventListener('end', onXRSessionEnded);
  // Do necessary session setup here.
  // Begin the session’s animation loop.
  xrSession.requestAnimationFrame(onXRAnimationFrame);
}

function onXRSessionEnded() {
  xrSession = null;
}
Applications which use "inline" sessions for rendering to the HTML document do not need to take any special steps to coordinate the animation loops, since the user agent will automatically suspend the animation loops of any "inline" sessions while an immersive session is active.

4.4. The XR Compositor
The user agent MUST maintain an XR Compositor which handles presentation to the XR device and frame timing. The compositor MUST use an independent rendering context whose state is isolated from that of any graphics contexts created by the document. The compositor MUST prevent the page from corrupting the compositor state or reading back content from other pages or applications. The compositor MUST also run in separate thread or processes to decouple performance of the page from the ability to present new imagery to the user at the appropriate framerate. The compositor MAY composite additional device or user agent UI over rendered content, like device menus.

Note: Future extensions to this spec may utilize the compositor to composite multiple layers coming from the same page as well.

5. Frame Loop
5.1. XRFrame
An XRFrame represents a snapshot of the state of all of the tracked objects for an XRSession. Applications can acquire an XRFrame by calling requestAnimationFrame() on an XRSession with an XRFrameRequestCallback. When the callback is called it will be passed an XRFrame. Events which need to communicate tracking state, such as the select event, will also provide an XRFrame.

[SecureContext, Exposed=Window] interface XRFrame {
  [SameObject] readonly attribute XRSession session;
  readonly attribute DOMHighResTimeStamp predictedDisplayTime;

  XRViewerPose? getViewerPose(XRReferenceSpace referenceSpace);
  XRPose? getPose(XRSpace space, XRSpace baseSpace);
};
Each XRFrame has an active boolean which is initially set to false, and an animationFrame boolean which is initially set to false.

The session attribute returns the XRSession that produced the XRFrame.

For an immersive session the predictedDisplayTime attribute MUST return the DOMHighResTimeStamp corresponding to the average point in time this XRFrame is expected to be displayed on the devices' display. For an "inline" XRSession, predictedDisplayTime MUST return the same value as the timestamp passed to the XRFrameRequestCallback.

The predictedDisplayTime is intended to allow rendering an animated XR scene in the state that it should be in when the frame is displayed rather than when the requestAnimationFrame() callback was scheduled or when it was executed.
The predictedDisplayTime is not intended be used to infer how much time the application has for rendering, as the XR Compositor typically has to do extra processing after the frame is submitted. If the experience assumes that it can process up to predictedDisplayTime, the XR Compositor will not be able to make use of the submitted frames, and the application would not make target framerate.

Each XRFrame represents the state of all tracked objects for a given time, and either stores or is able to query concrete information about this state at the time.

The getViewerPose(referenceSpace) method provides the pose of the viewer relative to referenceSpace as an XRViewerPose, at the XRFrame's time.

When this method is invoked, the user agent MUST run the following steps:

Let frame be this.

Let session be frame’s session object.

If frame’s animationFrame boolean is false, throw an InvalidStateError and abort these steps.

Let pose be a new XRViewerPose object in the relevant realm of session.

Populate the pose of session’s viewer reference space in referenceSpace at the time represented by frame into pose, with force emulation set to true.

If pose is null return null.

Let xrviews be an empty list.

For each active view view in the list of views on session, perform the following steps:

Let xrview be a new XRView object in the relevant realm of session.

Initialize xrview’s underlying view to view.

Initialize xrview’s eye to view’s eye.

Initialize xrview’s frame to frame.

Initialize xrview’s session to session.

Let offset be an new XRRigidTransform object equal to the view offset of view in the relevant realm of session.

Set xrview’s transform property to the result of multiplying the XRViewerPose's transform by the offset transform in the relevant realm of session

Append xrview to xrviews

Set pose’s views to xrviews

Return pose.

The getPose(space, baseSpace) method provides the pose of space relative to baseSpace as an XRPose, at the time represented by the XRFrame.

When this method is invoked, the user agent MUST run the following steps:

Let frame be this.

Let pose be a new XRPose object in the relevant realm of frame.

Populate the pose of space in baseSpace at the time represented by frame into pose.

Return pose.

A frame update is an algorithm that can be run given an XRFrame, which is intended to be run each XRFrame.

Every XRSession has a list of frame updates, which is a list of frame updates, initially the empty list.

To apply frame updates for an XRFrame frame, the user agent MUST run the following steps:

For each frame update in frame’s session's list of frame updates, perform the following steps:

Run frame update with frame.

NOTE: This spec does not define any frame updates, but other specifications may add some.

6. Spaces
A core feature of the WebXR Device API is the ability to provide spatial tracking. Spaces are the interface that enable applications to reason about how tracked entities are spatially related to the user’s physical environment and each other.

6.1. XRSpace
An XRSpace represents a virtual coordinate system with an origin that corresponds to a physical location. Spatial data that is requested from the API or given to the API is always expressed in relation to a specific XRSpace at the time of a specific XRFrame. Numeric values such as pose positions are coordinates in that space relative to its origin. The interface is intentionally opaque.

[SecureContext, Exposed=Window] interface XRSpace : EventTarget {

};
Each XRSpace has a session which is set to the XRSession that created the XRSpace.

Each XRSpace has a native origin which is a position and orientation in space. The XRSpace's native origin may be updated by the XR device's underlying tracking system, and different XRSpaces may define different semantics as to how their native origins are tracked and updated.

Each XRSpace has an effective origin, which is the basis of the XRSpace's coordinate system.

The transform from the effective space to the native origin's space is defined by an origin offset, which is an XRRigidTransform initially set to an identity transform. In other words, the effective origin can be obtained by multiplying origin offset and the native origin.

The effective origin of an XRSpace can only be observed in the coordinate system of another XRSpace as an XRPose, returned by an XRFrame's getPose() method. The spatial relationship between XRSpaces MAY change between XRFrames.

To populate the pose of an XRSpace space in an XRSpace baseSpace at the time represented by an XRFrame frame into an XRPose pose, with an optional force emulation flag, the user agent MUST run the following steps:

If frame’s active boolean is false, throw an InvalidStateError and abort these steps.

Let session be frame’s session object.

If space’s session does not equal session, throw an InvalidStateError and abort these steps.

If baseSpace’s session does not equal session, throw an InvalidStateError and abort these steps.

Check if poses may be reported and, if not, throw a SecurityError and abort these steps.

If session’s visibilityState is "visible-blurred" and space or baseSpace is associated with an XRInputSource, set pose to null and abort these steps.

Let limit be the result of whether poses must be limited between space and baseSpace.

Let transform be pose’s transform.

Query the XR device's tracking system for space’s pose relative to baseSpace at the frame’s time, then perform the following steps:

If limit is false and the tracking system provides a 6DoF pose whose position is actively tracked or statically known for space’s pose relative to baseSpace:
Set transform’s orientation to the orientation of space’s effective origin in baseSpace’s coordinate system.

Set transform’s position to the position of space’s effective origin in baseSpace’s coordinate system.

If supported, set pose’s linearVelocity to the linear velocity of space’s effective origin compared to baseSpace’s coordinate system.

If supported, set pose’s angularVelocity to the angular velocity of space’s effective origin compared to baseSpace’s coordinate system.

Set pose’s emulatedPosition to false.

Else if limit is false and the tracking system provides a 3DoF pose or a 6DoF pose whose position is neither actively tracked nor statically known for space’s pose relative to baseSpace:
Set transform’s orientation to the orientation of space’s effective origin in baseSpace’s coordinate system.

Set transform’s position to the tracking system’s best estimate of the position of space’s effective origin in baseSpace’s coordinate system. This MAY include a computed offset such as a neck or arm model. If a position estimate is not available, the last known position MUST be used.

Set pose’s linearVelocity to null.

Set pose’s angularVelocity to null.

Set pose’s emulatedPosition to true.

Else if space’s pose relative to baseSpace has been determined in the past and force emulation is true:
Set transform’s position to the last known position of space’s effective origin in baseSpace’s coordinate system.

Set transform’s orientation to the last known orientation of space’s effective origin in baseSpace’s coordinate system.

Set pose’s linearVelocity to null.

Set pose’s angularVelocity to null.

Set pose’s emulatedPosition boolean to true.

Otherwise:
Set pose to null.

Note: The XRPose's emulatedPosition boolean does not indicate whether baseSpace’s position is emulated or not, only whether evaluating space’s position relative to baseSpace relies on emulation. For example, a controller with 3DoF tracking would report poses with an emulatedPosition of true when its targetRaySpace or gripSpace are queried against an XRReferenceSpace, but would report an emulatedPosition of false if the pose of the targetRaySpace was queried in gripSpace, because the relationship between those two spaces should be known exactly.

6.2. XRReferenceSpace
An XRReferenceSpace is one of several common XRSpaces that applications can use to establish a spatial relationship with the user’s physical environment.

XRReferenceSpaces are generally expected to remain static for the duration of the XRSession, with the most common exception being mid-session reconfiguration by the user. The native origin for every XRReferenceSpace describes a coordinate system where +X is considered "Right", +Y is considered "Up", and -Z is considered "Forward".

enum XRReferenceSpaceType {
  "viewer",
  "local",
  "local-floor",
  "bounded-floor",
  "unbounded"
};

[SecureContext, Exposed=Window]
interface XRReferenceSpace : XRSpace {
  [NewObject] XRReferenceSpace getOffsetReferenceSpace(XRRigidTransform originOffset);

  attribute EventHandler onreset;
};
Each XRReferenceSpace has a type, which is an XRReferenceSpaceType.

An XRReferenceSpace is most frequently obtained by calling requestReferenceSpace(), which creates an instance of an XRReferenceSpace (or an interface extending it) if the XRReferenceSpaceType enum value passed into the call is supported. The type indicates the tracking behavior that the reference space will exhibit:

Passing a type of viewer creates an XRReferenceSpace instance. It represents a tracking space with a native origin which tracks the position and orientation of the viewer. Every XRSession MUST support "viewer" XRReferenceSpaces.

Passing a type of local creates an XRReferenceSpace instance. It represents a tracking space with a native origin near the viewer at the time of creation. The exact position and orientation will be initialized based on the conventions of the underlying platform. When using this reference space the user is not expected to move beyond their initial position much, if at all, and tracking is optimized for that purpose. For devices with 6DoF tracking, local reference spaces should emphasize keeping the origin stable relative to the user’s environment.

Passing a type of local-floor creates an XRReferenceSpace instance. It represents a tracking space with a native origin at the floor in a safe position for the user to stand. The Y axis equals 0 at floor level, with the X and Z position and orientation initialized based on the conventions of the underlying platform. If the floor level isn’t known it MUST be estimated, with some estimated floor level. If the estimated floor level is determined with a non-default value, it MUST be rounded sufficiently to prevent fingerprinting. When using this reference space the user is not expected to move beyond their initial position much, if at all, and tracking is optimized for that purpose. For devices with 6DoF tracking, local-floor reference spaces should emphasize keeping the origin stable relative to the user’s environment.

Note: If the floor level of a "local-floor" reference space is adjusted to prevent fingerprinting, rounded to the nearest 1cm is suggested.

Passing a type of bounded-floor creates an XRBoundedReferenceSpace instance. It represents a tracking space with its native origin at the floor, where the user is expected to move within a pre-established boundary, given as the boundsGeometry. Tracking in a bounded-floor reference space is optimized for keeping the native origin and boundsGeometry stable relative to the user’s environment.

Passing a type of unbounded creates an XRReferenceSpace instance. It represents a tracking space where the user is expected to move freely around their environment, potentially even long distances from their starting point. Tracking in an unbounded reference space is optimized for stability around the user’s current position, and as such the native origin may drift over time.

Note: It is assumed that the conventions of the underlying platform regarding Y axes of the reference spaces stay consistent across different types of XRReferenceSpaces. In other words, if an XR system supports multiple reference spaces, their Y axes will be parallel to each other and point in the same direction for the duration of the XRSession in which they were created. This does not apply to "viewer", which does not rely on the conventions of the underlying platform for its orientation. "unbounded" reference spaces should align their Y axes with other reference spaces when their origins are nearby, but may deviate if the user moves over large distances.

Devices that support "local" reference spaces MUST support "local-floor" reference spaces, through emulation if necessary, and vice versa.

The onreset attribute is an Event handler IDL attribute for the reset event type.

When an XRReferenceSpace is requested with XRReferenceSpaceType type for XRSession session, the user agent MUST create a reference space by running the following steps:

Initialize referenceSpace as follows:

If type is bounded-floor:
Let referenceSpace be a new XRBoundedReferenceSpace in the relevant realm of session.

Otherwise:
Let referenceSpace be a new XRReferenceSpace in the relevant realm of session.

Initialize referenceSpace’s type to type.

Initialize referenceSpace’s session to session.

Return referenceSpace.

To check if a reference space is supported for a given reference space type type and XRSession session, run the following steps:
If type is not contained in session’s set of granted features, return false.

If type is viewer, return true.

If type is local or local-floor, and session is an immersive session, return true.

If type is local or local-floor, and the XR device supports reporting orientation data, return true.

If type is bounded-floor and session is an immersive session, return the result of whether bounded reference spaces are supported by the XR device.

If type is unbounded, session is an immersive session, and the XR device supports stable tracking near the user over an unlimited distance, return true.

Return false.

The getOffsetReferenceSpace(originOffset) method MUST perform the following steps when invoked:
Let base be the XRReferenceSpace the method was called on.

Initialize offsetSpace as follows:

If base is an instance of XRBoundedReferenceSpace:
Let offsetSpace be a new XRBoundedReferenceSpace in the relevant realm of base, and set offsetSpace’s boundsGeometry to base’s boundsGeometry, with each point multiplied by the inverse of originOffset.

Otherwise:
Let offsetSpace be a new XRReferenceSpace in the relevant realm of base.

Set offsetSpace’s type to base’s type.

Set offsetSpace’s origin offset to the result of multiplying base’s origin offset by originOffset in the relevant realm of base.

Return offsetSpace.

Note: It’s expected that some applications will use getOffsetReferenceSpace() to implement scene navigation controls based on mouse, keyboard, touch, or gamepad input. This will result in getOffsetReferenceSpace() being called frequently, at least once per-frame during periods of active input. As a result UAs are strongly encouraged to make the creation of new XRReferenceSpaces with getOffsetReferenceSpace() a lightweight operation.

6.3. XRBoundedReferenceSpace
XRBoundedReferenceSpace extends XRReferenceSpace to include boundsGeometry, indicating the pre-configured boundaries of the user’s space.

[SecureContext, Exposed=Window]
interface XRBoundedReferenceSpace : XRReferenceSpace {
  readonly attribute FrozenArray<DOMPointReadOnly> boundsGeometry;
};
The origin of an XRBoundedReferenceSpace MUST be positioned at the floor, such that the Y axis equals 0 at floor level. The X and Z position and orientation are initialized based on the conventions of the underlying platform, typically expected to be near the center of the room facing in a logical forward direction.

Note: Other XR platforms sometimes refer to the type of tracking offered by a bounded-floor reference space as "room scale" tracking. An XRBoundedReferenceSpace is not intended to describe multi-room spaces, areas with uneven floor levels, or very large open areas. Content that needs to handle those scenarios should use an unbounded reference space.

Each XRBoundedReferenceSpace has a native bounds geometry describing the border around the XRBoundedReferenceSpace, which the user can expect to safely move within. The polygonal boundary is given as an array of DOMPointReadOnlys, which represents a loop of points at the edges of the safe space. The points describe offsets from the native origin in meters. Points MUST be given in a clockwise order as viewed from above, looking towards the negative end of the Y axis. The y value of each point MUST be 0 and the w value of each point MUST be 1. The bounds can be considered to originate at the floor and extend infinitely high. The shape it describes MAY be convex or concave.

Each point in the native bounds geometry MUST be limited to a reasonable distance from the reference space’s native origin.

Note: It is suggested that points of the native bounds geometry be limited to 15 meters from the native origin in all directions.

Each point in the native bounds geometry MUST also be quantized sufficiently to prevent fingerprinting. For user’s safety, quantized points values MUST NOT fall outside the bounds reported by the platform.

Note: It is suggested that points of the native bounds geometry be quantized to the nearest 5cm.

The boundsGeometry attribute is an array of DOMPointReadOnlys such that each entry is equal to the entry in the XRBoundedReferenceSpace's native bounds geometry premultiplied by the inverse of the origin offset. In other words, it provides the same border in XRBoundedReferenceSpace coordinates relative to the effective origin.

If the native bounds geometry is temporarily unavailable, which may occur for several reasons such as during XR device initialization, extended periods of tracking loss, or movement between pre-configured spaces, the boundsGeometry MUST report an empty array.

To check if bounded reference spaces are supported run the following steps:
If the XR device cannot report boundaries, return false.

If the XR device cannot identify the height of the user’s physical floor, return false.

Return true.

Note: Bounded reference spaces may be returned if the boundaries or floor height have not been resolved at the time of the reference space request, but the XR device is known to support them.

Note: Content should not require the user to move beyond the boundsGeometry. It is possible for the user to move beyond the bounds if their physical surroundings allow for it, resulting in position values outside of the polygon they describe. This is not an error condition and should be handled gracefully by page content.

Note: Content generally should not provide a visualization of the boundsGeometry, as it’s the user agent’s responsibility to ensure that safety critical information is provided to the user.

7. Views
7.1. XRView
An XRView describes a single view into an XR scene for a given frame.

A view corresponds to a display or portion of a display used by an XR device to present imagery to the user. They are used to retrieve all the information necessary to render content that is well aligned to the view's physical output properties, including the field of view, eye offset, and other optical properties. Views may cover overlapping regions of the user’s vision. No guarantee is made about the number of views any XR device uses or their order, nor is the number of views required to be constant for the duration of an XRSession.

A view has an associated internal view offset, which is an XRRigidTransform describing the position and orientation of the view in the viewer reference space's coordinate system.

NOTE: There are no constraints on what the view offset might be, and views are allowed to have differing orientations. This can crop up in head-mounted devices with eye displays centered at an angle, and it can also surface itself in more extreme cases like CAVE rendering. Techniques like z-sorting and culling may need to be done per-eye because of this.

A view has an associated projection matrix which is a matrix describing the projection to be used when rendering the view, provided by the underlying XR device. The projection matrix MAY include transformations such as shearing that prevent the projection from being accurately described by a simple frustum.

A view has an associated eye which is an XREye describing which eye this view is expected to be shown to. If the view does not have an intrinsically associated eye (the display is monoscopic, for example) this value MUST be set to "none".

A view has an active flag that may change through the lifecycle of an XRSession. Primary views MUST always have the active flag set to true.

Note: Many HMDs will request that content render two views, one for the left eye and one for the right, while most magic window devices will only request one view, but applications should never assume a specific view configuration. For example: A magic window device may request two views if it is capable of stereo output, but may revert to requesting a single view for performance reasons if the stereo output mode is turned off. Similarly, HMDs may request more than two views to facilitate a wide field of view or displays of different pixel density.

A view has an internal viewport modifiable flag that indicates if the viewport scale can be changed by a requestViewportScale() call at this point in the session. It is set to true at the start of an animation frame, and set to false when getViewport() is called.

A view has an internal requested viewport scale value that represents the requested viewport scale for this view. It is initially set to 1.0, and can be modified by the requestViewportScale() method if the system supports dynamic viewport scaling.

A view has an internal current viewport scale value that represents the current viewport scale for this view as used internally by the system. It is initially set to 1.0. It is updated to match the requested viewport scale when the viewport change is successfully applied by a getViewport() call.

Note: Dynamic viewport scaling allows applications to render to a subset of the full-sized viewport using a scale factor that can be changed every animation frame. This is intended to be efficiently modifiable on a per-frame basis without reallocation. For correct rendering, it’s essential that the XR system and application agree on the active viewport. An application can call requestViewportScale() for an XRView multiple times within a single animation frame, but the requested scale does not take effect until the application calls getViewport() for that view. The first getViewport call in an animation frame applies the change (taking effect immediately for the current animation frame), locks in the view’s current scaled viewport for the remainder of this animation frame, and sets the scale as the new default for future animation frames. Optionally, the system can provide a suggested value through the recommendedViewportScale attribute based on internal performance heuristics and target framerates.

enum XREye {
  "none",
  "left",
  "right"
};

[SecureContext, Exposed=Window] interface XRView {
  readonly attribute XREye eye;
  readonly attribute Float32Array projectionMatrix;
  [SameObject] readonly attribute XRRigidTransform transform;
  readonly attribute double? recommendedViewportScale;

  undefined requestViewportScale(double? scale);
};
The eye attribute describes the eye of the underlying view. This attribute’s primary purpose is to ensure that pre-rendered stereo content can present the correct portion of the content to the correct eye.

The projectionMatrix attribute is the projection matrix of the underlying view. It is strongly recommended that applications use this matrix without modification or decomposition. Failure to use the provided projection matrices when rendering may cause the presented frame to be distorted or badly aligned, resulting in varying degrees of user discomfort. This attribute MUST be computed by obtaining the projection matrix for the XRView.

The transform attribute is the XRRigidTransform of the viewpoint. It represents the position and orientation of the viewpoint in the XRReferenceSpace provided in getViewerPose().

The optional recommendedViewportScale attribute contains a UA-recommended viewport scale value that the application can use for a requestViewportScale() call to configure dynamic viewport scaling. It is null if the system does not implement a heuristic or method for determining a recommended scale. If not null, the value MUST be a numeric value greater than 0.0 and less than or equal to 1.0, and MUST be quantized to avoid providing detailed performance or GPU utilization data.

Note: It is suggested to quantize the recommended viewport scale by rounding it to the nearest value from a short list of possible scale values, and using hysteresis to avoid instant changes when close to a boundary value. (This also helps avoid rapidly oscillating scale values which can be visually distracting or uncomfortable.)

Each XRView has an associated session which is the XRSession that produced it.

Each XRView has an associated frame which is the XRFrame that produced it.

Each XRView has an associated underlying view which is the underlying view that it represents.

Each XRView has an associated internal projection matrix which stores the projection matrix of its underlying view. It is initially null.

Note: The transform can be used to position camera objects in many rendering libraries. If a more traditional view matrix is needed by the application one can be retrieved by calling view.transform.inverse.matrix.

The requestViewportScale(scale) method requests that the user agent should set the requested viewport scale for this viewport to the requested value.

When this method is invoked on an XRView xrview, the user agent MUST run the following steps:

If scale is null or undefined, abort these steps.

If scale is less than or equal to 0.0, abort these steps.

If scale is greater than 1.0, set scale to 1.0.

Let view be xrview’s underlying view.

Set the view’s requested viewport scale value to scale.

Note: The method ignores null or undefined scale values so that applications can safely use view.requestViewportScale(view.recommendedViewportScale) even on systems that don’t provide a recommended scale.

To obtain the projection matrix for a given XRView view:

If view’s internal projection matrix is not null, perform the following steps:

If the operation IsDetachedBuffer on internal projection matrix is false, return view’s internal projection matrix.

Set view’s internal projection matrix to a new matrix in the relevant realm of view which is equal to view’s underlying view's projection matrix.

Return view’s internal projection matrix.

When the active flag of any view in the list of views changes, one can update the viewports for an XRSession session by performing the following steps:

Let layer be the renderState's baseLayer.

If layer is null abort these steps.

Set layer’s list of viewport objects to the empty list.

For each active view view in list of views:

Let viewport be the XRViewport result of obtaining a scaled viewport from the list of full-sized viewports associated with view for session.

Append viewport to layer’s list of viewport objects.

To obtain a scaled viewport for a given XRView view for an XRSession session:

Let glFullSizedViewport be the WebGL viewport from the list of full-sized viewports associated with view.

Let scale be the view’s current viewport scale.

The user agent MAY choose to clamp scale to apply a minimum viewport scale factor.

Let glViewport be a new WebGL viewport.

Set glViewport’s width to an integer value less than or equal to glFullSizedViewport’s width multiplied by scale.

If glViewport’s width is less than 1, set it to 1.

Set glViewport’s height to an integer value less than or equal to glFullSizedViewport’s height multiplied by scale.

If glViewport’s height is less than 1, set it to 1.

Set glViewport’s x component to an integer value between glFullSizedViewport’s x component (inclusive) and glFullSizedViewport’s x component plus glFullSizedViewport’s width minus glViewport’s width (inclusive).

Set glViewport’s y component to a integer value between glFullSizedViewport’s y component (inclusive) and glFullSizedViewport’s y component plus glFullSizedViewport’s height minus glViewport’s height (inclusive).

Let viewport be a new XRViewport in the relevant realm of session.

Initialize viewport’s x to glViewport’s x component.

Initialize viewport’s y to glViewport’s y component.

Initialize viewport’s width to glViewport’s width.

Initialize viewport’s height to glViewport’s height.

Return viewport.

Note: The specific integer value calculation is intentionally left to the UA’s discretion. The straightforward method of rounding down the width/height and using the x and y offsets as-is is valid, but the UA MAY also choose a slightly adjusted value within the specified constraints, for example to align the viewport to a power-of-two pixel grid for efficiency. The scaled viewport MUST be completely contained within the full-sized viewport, but MAY be placed at any location within the full-sized viewport at the UA’s discretion. The size and position calculation MUST be deterministic and return a consistent result for identical input values within a session.

7.2. Primary and Secondary Views
A view is a primary view when rendering to it is necessary for an immersive experience. Primary views MUST be active for the entire duration of the XRSession.

A view is a secondary view when it is possible for content to choose to not render to it and still produce a working immersive experience. When content chooses to not render to these views, the user agent MAY be able to reconstruct them via reprojection. Secondary views MUST NOT be active unless the "secondary-views" feature is enabled.

Examples of primary views include the main mono view for a handheld AR session, the main two stereo views for headworn AR/VR sessions, or all of the wall views for a CAVE session.
Examples of secondary views include the first-person observer view used for video capture, or "quad views" where there are two views per eye with differing resolution and fields of view.

While content should be written to assume that there may be any number of views, we expect a significant amount of content to make incorrect assumptions about the views array and thus break when presented with more than two views.
Because user agents may have the ability to use mechanisms like reprojection to render to these secondary views in lieu of the content, it is desirable to be able to distinguish between content that plans on handling these secondary views itself and content that is either oblivious to the existence of such secondary views or does not wish to deal with them.

To provide for this, user agents that expose secondary views MUST support an "secondary-views" feature descriptor as a hint. Content enabling this feature is expected to:

Handle any nonzero number of views in the views array.

Handle the existence of multiple views that have the same eye.

Handle the size of the views array changing from frame to frame. This can happen when video capture is enabled, for example

When "secondary-views" is enabled, the user agent MAY surface any secondary views the device supports to the XRSession, when necessary. The user agent MUST NOT use reprojection to reconstruct secondary views in such a case, and instead rely on whatever the content decides to render.

Note: We recommend content use optionalFeatures to enable "secondary-views" to ensure maximum compatibility.

If secondary views have lower underlying frame rates, the XRSession MAY choose to do one or more of the following:

Lower the overall frame rate of the application while the secondary views are active.

Surface secondary views in the views array only for some of the frames. Implementations doing this SHOULD NOT have frames where the primary views are not present.

Silently discard rendered content for secondary views during some of the frames.

7.3. XRViewport
An XRViewport object describes a viewport, or rectangular region, of a graphics surface.

[SecureContext, Exposed=Window] interface XRViewport {
  readonly attribute long x;
  readonly attribute long y;
  readonly attribute long width;
  readonly attribute long height;
};
The x and y attributes define an offset from the surface origin and the width and height attributes define the rectangular dimensions of the viewport.

The exact interpretation of the viewport values depends on the conventions of the graphics API the viewport is associated with:

When used with an XRWebGLLayer the x and y attributes specify the lower left corner of the viewport rectangle, in pixels, with the viewport rectangle extending width pixels to the right of x and height pixels above y. The values can be passed to the WebGL viewport function directly.

The following code loops through all of the XRViews of an XRViewerPose, queries an XRViewport from an XRWebGLLayer for each, and uses them to set the appropriate WebGL viewports for rendering.
xrSession.requestAnimationFrame((time, xrFrame) => {
  const viewer = xrFrame.getViewerPose(xrReferenceSpace);

  gl.bindFramebuffer(xrWebGLLayer.framebuffer);
  for (xrView of viewer.views) {
    let xrViewport = xrWebGLLayer.getViewport(xrView);
    gl.viewport(xrViewport.x, xrViewport.y, xrViewport.width, xrViewport.height);

    // WebGL draw calls will now be rendered into the appropriate viewport.
  }
});
8. Geometric Primitives
8.1. Matrices
WebXR provides various transforms in the form of matrices. WebXR uses the WebGL conventions when communicating matrices, in which 4x4 matrices are given as 16 element Float32Arrays with column major storage, and are applied to column vectors by premultiplying the matrix from the left. They may be passed directly to WebGL’s uniformMatrix4fv function, used to create an equivalent DOMMatrix, or used with a variety of third party math libraries.

Matrices returned from the WebXR Device API will be a 16 element Float32Array laid out like so:
[a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15]
Applying this matrix as a transform to a column vector specified as a DOMPointReadOnly like so:

{x:X, y:Y, z:Z, w:1}
Produces the following result:

a0 a4 a8  a12  *  X  =  a0 * X + a4 * Y +  a8 * Z + a12
a1 a5 a9  a13     Y     a1 * X + a5 * Y +  a9 * Z + a13
a2 a6 a10 a14     Z     a2 * X + a6 * Y + a10 * Z + a14
a3 a7 a11 a15     1     a3 * X + a7 * Y + a11 * Z + a15
8.2. Normalization
There are several algorithms which call for a vector or quaternion to be normalized, which means to scale the components to have a collective magnitude of 1.0.

To normalize a list of components the UA MUST perform the following steps:

Let length be the square root of the sum of the squares of each component.

If length is 0, throw an InvalidStateError and abort these steps.

Divide each component by length and set the component.

8.3. XRRigidTransform
An XRRigidTransform is a transform described by a position and orientation. When interpreting an XRRigidTransform the orientation is always applied prior to the position.

An XRRigidTransform contains an internal matrix which is a matrix.

[SecureContext, Exposed=Window]
interface XRRigidTransform {
  constructor(optional DOMPointInit position = {}, optional DOMPointInit orientation = {});
  [SameObject] readonly attribute DOMPointReadOnly position;
  [SameObject] readonly attribute DOMPointReadOnly orientation;
  readonly attribute Float32Array matrix;
  [SameObject] readonly attribute XRRigidTransform inverse;
};
The XRRigidTransform(position, orientation) constructor MUST perform the following steps when invoked:

Let transform be a new XRRigidTransform in the current realm.

Let transform’s position be a new DOMPointReadOnly in the current realm.

If position’s w value is not 1.0, throw a TypeError and abort these steps.

If one or more of position’s or orientation’s values is NaN or another non-finite number such as infinity, throw a TypeError and abort these steps.

Set transform’s position’s x value to position’s x dictionary member, y value to position’s y dictionary member, z value to position’s z dictionary member and w value to position’s w dictionary member.

Let transform’s orientation be a new DOMPointReadOnly in the current realm.

Set transform’s orientation’s x value to orientation’s x dictionary member, y value to orientation’s y dictionary member, z value to orientation’s z dictionary member and w value to orientation’s w dictionary member.

Let transform’s internal matrix be null.

Normalize x, y, z, and w components of transform’s orientation.

Return transform.

The position attribute is a 3-dimensional point, given in meters, describing the translation component of the transform. The position's w attribute MUST be 1.0.

The orientation attribute is a quaternion describing the rotational component of the transform. The orientation MUST be normalized to have a length of 1.0.

The matrix attribute returns the transform described by the position and orientation attributes as a matrix. This attribute MUST be computed by obtaining the matrix for the XRRigidTransform.

Note: This matrix when premultiplied onto a column vector will rotate the vector by the 3D rotation described by orientation, and then translate it by position. Mathematically in column-vector notation, this is M = T * R, where T is a translation matrix corresponding to position and R is a rotation matrix corresponding to orientation.

To obtain the matrix for a given XRRigidTransform transform:

If transform’s internal matrix is not null, perform the following steps:

If the operation IsDetachedBuffer on internal matrix is false, return transform’s internal matrix.

Let translation be a new matrix which is a column-vector translation matrix corresponding to position. Mathematically, if position is (x, y, z), this matrix is

Mathematical expression for column-vector translation matrix

Let rotation be a new matrix which is a column-vector rotation matrix corresponding to orientation. Mathematically, if orientation is the unit quaternion (qx, qy, qz, qw), this matrix is

Mathematical expression for column-vector rotation matrix

Set transform’s internal matrix to a new Float32Array in the relevant realm of transform set to the result of multiplying translation and rotation with translation on the left (translation * rotation) in the relevant realm of transform. Mathematically, this matrix is

Mathematical expression for matrix of multiplying translation and rotation with translation on the left

Return transform’s internal matrix.

The inverse attribute of a XRRigidTransform transform returns an XRRigidTransform in the relevant realm of transform which, if applied to an object that had previously been transformed by transform, would undo the transform and return the object to its initial pose. This attribute SHOULD be lazily evaluated. The XRRigidTransform returned by inverse MUST return transform as its inverse.

An XRRigidTransform with a position of { x: 0, y: 0, z: 0 w: 1 } and an orientation of { x: 0, y: 0, z: 0, w: 1 } is known as an identity transform.

To multiply two XRRigidTransforms, B and A in a Realm realm, the UA MUST perform the following steps:

Let result be a new XRRigidTransform object in realm.

Set result’s matrix to a new Float32Array in realm, the result of premultiplying B’s matrix from the left onto A’s matrix.

Set result’s orientation to a new DOMPointReadOnly in realm, the quaternion that describes the rotation indicated by the top left 3x3 sub-matrix of result’s matrix.

Set result’s position to a new DOMPointReadOnly in realm, the vector given by the fourth column of result’s matrix.

Return result.

result is a transform from A’s source space to B’s destination space.

Note: This is equivalent to constructing an XRRigidTransform whose orientation is the composition of the orientation of A and B, and whose position is equal to A’s position rotated by B’s orientation, added to B’s position.

9. Pose
9.1. XRPose
An XRPose describes a position and orientation in space relative to an XRSpace.

[SecureContext, Exposed=Window] interface XRPose {
  [SameObject] readonly attribute XRRigidTransform transform;
  [SameObject] readonly attribute DOMPointReadOnly? linearVelocity;
  [SameObject] readonly attribute DOMPointReadOnly? angularVelocity;

  readonly attribute boolean emulatedPosition;
};
The transform attribute describes the position and orientation relative to the base XRSpace.

The linearVelocity attribute describes the linear velocity in meters per second relative to the base XRSpace. If the user agent can’t populate this, it’s allowed to return null.

The angularVelocity attribute describes the angular velocity in radians per second relative to the base XRSpace. If the user agent can’t populate this, it’s allowed to return null.

The emulatedPosition attribute is false when the transform represents an actively tracked 6DoF pose based on sensor readings, or true if its position value includes a computed offset, such as that provided by a neck or arm model. Estimated floor levels MUST NOT be considered when determining if an XRPose includes a computed offset.

9.2. XRViewerPose
An XRViewerPose is an XRPose describing the state of a viewer of the XR scene as tracked by the XR device. A viewer may represent a tracked piece of hardware, the observed position of a user’s head relative to the hardware, or some other means of computing a series of viewpoints into the XR scene. XRViewerPoses can only be queried relative to an XRReferenceSpace. It provides, in addition to the XRPose values, an array of views which include rigid transforms to indicate the viewpoint and projection matrices. These values should be used by the application when rendering a frame of an XR scene.

[SecureContext, Exposed=Window] interface XRViewerPose : XRPose {
  [SameObject] readonly attribute FrozenArray<XRView> views;
};
The views array is a sequence of XRViews describing the viewpoints of the XR scene, relative to the XRReferenceSpace the XRViewerPose was queried with. Every view of the XR scene in the array must be rendered in order to display correctly on the XR device. Each XRView includes rigid transforms to indicate the viewpoint and projection matrices, and can be used to query XRViewports from layers when needed.

Note: The XRViewerPose's transform can be used to position graphical representations of the viewer for spectator views of the scene or multi-user interaction.

10. Input
10.1. XRInputSource
An XRInputSource represents an XR input source, which is any input mechanism which allows the user to perform targeted actions in the same virtual space as the viewer. Example XR input sources include, but are not limited to, handheld controllers, optically tracked hands, and gaze-based input methods that operate on the viewer's pose. Input mechanisms which are not explicitly associated with the XR device, such as traditional gamepads, mice, or keyboards SHOULD NOT be considered XR input sources.

enum XRHandedness {
  "none",
  "left",
  "right"
};

enum XRTargetRayMode {
  "gaze",
  "tracked-pointer",
  "screen",
  "transient-pointer"
};

[SecureContext, Exposed=Window]
interface XRInputSource {
  readonly attribute XRHandedness handedness;
  readonly attribute XRTargetRayMode targetRayMode;
  [SameObject] readonly attribute XRSpace targetRaySpace;
  [SameObject] readonly attribute XRSpace? gripSpace;
  [SameObject] readonly attribute FrozenArray<DOMString> profiles;
  readonly attribute boolean skipRendering;
};
Note: The XRInputSource interface is also extended by the WebXR Gamepads Module

The handedness attribute describes which hand the XR input source is associated with, if any. Input sources with no natural handedness (such as headset-mounted controls) or for which the handedness is not currently known MUST set this attribute "none".

The targetRayMode attribute describes the method used to produce the target ray, and indicates how the application should present the target ray to the user if desired.

gaze indicates the target ray will originate at the viewer and follow the direction it is facing. (This is commonly referred to as a "gaze input" device in the context of head-mounted displays.)

tracked-pointer indicates that the target ray originates from either a handheld device or other hand-tracking mechanism and represents that the user is using their hands or the held device for pointing. The orientation of the target ray relative to the tracked object MUST follow platform-specific ergonomics guidelines when available. In the absence of platform-specific guidance, the target ray SHOULD point in the same direction as the user’s index finger if it was outstretched. If the XRSystem determines that part of the handheld device is or becomes intended to contact real-world surfaces (such as a pen tip), the target ray MUST originate at that point.

screen indicates that the input source was an interaction with the canvas element associated with an inline session’s output context, such as a mouse click or touch event.

transient-pointer indicates that the input source was generated as part of an operating system interaction intent rather than a specific piece of hardware. Some examples are user intents based on information too sensitive to expose directly such as gaze, synthesised inputs from web driver or inputs generated by assistive technologies. This should only be used for assistive technologies if it is also used as a primary input so as to not inadvertently indicate that assistive technology is being used as per the W3C design principals.

The targetRaySpace attribute is an XRSpace that has a native origin tracking the position and orientation of the preferred pointing ray of the XRInputSource (along its -Z axis), as defined by the targetRayMode.

For input sources with a targetRayMode of "transient-pointer" the targetRaySpace represents the ray to the interaction target at the start of the interaction. The pose for this should be static within the gripSpace for this XRInput.

The gripSpace attribute is an XRSpace that has a native origin tracking to the pose that should be used to render virtual objects such that they appear to be held in the user’s hand. If the user were to hold a straight rod, this XRSpace places the native origin at the centroid of their curled fingers and where the -Z axis points along the length of the rod towards their thumb. The X axis is perpendicular to the back of the hand being described, with the back of the user’s right hand pointing towards +X and the back of the user’s left hand pointing towards -X. The Y axis is implied by the relationship between the X and Z axis, with +Y roughly pointing in the direction of the user’s arm.

The skipRendering attribute indicates that this input is visible and MAY NOT need to be rendered by the current session. If skipRendering is true and the targetRayMode is "tracked-pointer", the user agent MUST ensure that a representation of the XR input source is always shown to the user.

Examples of the controller being shown to the user include the controller is in between the display and the user, the display is transparent or the controller is rendered by the operating system.

skipRendering is a hint to developers about not rendering input sources such as controllers. Pick rays and cursor should still be rendered.

For input sources with a targetRayMode of "transient-pointer" the gripSpace should be the associated user gesture if there is one, otherwise it should be another space the user controls such as the ViewerSpace or the gripSpace or the targetRaySpace of another XRInput. This is to allow user the user to still manipulate the targetRaySpace.

The gripSpace MUST be null if the input source isn’t inherently trackable such as for input sources with a targetRayMode of "gaze" or "screen".

The profiles attribute is a list of input profile names indicating both the prefered visual representation and behavior of the input source.

An input profile name is an ASCII lowercase DOMString containing no spaces, with separate words concatenated with a hyphen (-) character. A descriptive name should be chosen, using the prefered verbiage of the device vendor when possible. If the platform provides an appropriate identifier, such as a USB vendor and product ID, it MAY be used. Values that uniquely identify a single device, such as serial numbers, MUST NOT be used. The input profile name MUST NOT contain an indication of device handedness. If multiple user agents expose the same device, they SHOULD make an effort to report the same input profile name. The WebXR Input Profiles Registry is the recommended location for managing input profile names.

Profiles are given in descending order of specificity. Any input profile names given after the first entry in the list should provide fallback values that represent alternative representations of the device. This may include a more generic or prior version of the device, a more widely recognized device that is sufficiently similar, or a broad description of the device type (such as "generic-trigger-touchpad"). If multiple profiles are given, the layouts they describe must all represent a superset or subset of every other profile in the list.

If the XRSession's mode is "inline", profiles MUST be an empty list.

The user agent MAY choose to only report an appropriate generic input profile name or an empty list at its discretion. Some scenarios where this would be appropriate are if the input device cannot be reliably identified, no known input profiles match the input device, or the user agent wishes to mask the input device being used.

For example, the Samsung HMD Odyssey’s controller is a design variant of the standard Windows Mixed Reality controller. Both controllers share the same input layout. As a result, the profiles for a Samsung HMD Odyssey controller could be: ["samsung-odyssey", "microsoft-mixed-reality", "generic-trigger-squeeze-touchpad-thumbstick"]. The appearance of the controller is most precisely communicated by the first profile in the list, with the second profile describing an acceptable substitute, and the last profile a generic fallback that describes the device in the roughest sense. (It’s a controller with a trigger, squeeze button, touchpad and thumbstick.)

Similarly, the Valve Index controller is backwards compatible with the HTC Vive controller, but the Index controller has additional buttons and axes. As a result, the profiles for the Valve Index controller could be: ["valve-index", "htc-vive", "generic-trigger-squeeze-touchpad-thumbstick"]. In this case the input layout described by the "valve-index" profile is a superset of the layout described by the "htc-vive" profile. Also, the "valve-index" profile indicates the precise appearance of the controller, while the "htc-vive" controller has a significantly different appearance. In this case the UA would have deemed that difference acceptable. And as in the first example, the last profile is a generic fallback.

(Exact strings are examples only. Actual profile names are managed in the WebXR Input Profiles Registry.)

Note: XRInputSources in an XRSession's inputSources array are "live". As such, values within them are updated in-place. This means that it doesn’t work to save a reference to an XRInputSource's attribute on one frame and compare it to the same attribute in a subsequent frame to test for state changes, because they will be the same object. Therefore developers that wish to compare input state from frame to frame should copy the content of the state in question.

An XR input source is a primary input source if it supports a primary action. The primary action is a platform-specific action that, when engaged, produces selectstart, selectend, and select events. Examples of possible primary actions are pressing a trigger, touchpad, or button, speaking a command, or making a hand gesture. If the platform guidelines define a recommended primary input then it should be used as the primary action, otherwise the user agent is free to select one. The device MUST support at least one primary input source.

An XR input source is an tracked input source if it does not support a primary action. These inputs are primarily intended to provide pose data. Note: An example of a tracked input source would be tracking attachments for a users legs or a prop. Tracked hands may also be considered a tracked input source if there is no gesture recognition being performed to detect primary actions.

When an XR input source source for XRSession session begins its primary action the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session with time being the time the action occurred.

Queue a task to fire an input source event with name selectstart, frame frame, and source source.

When an XR input source source for XRSession session ends its primary action the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session with time being the time the action occurred.

Queue a task to perform the following steps:

Fire an input source event with name select, frame frame, and source source.

Fire an input source event with name selectend, frame frame, and source source.

Each XR input source MAY define a primary squeeze action. The primary squeeze action is a platform-specific action that, when engaged, produces squeezestart, squeezeend, and squeeze events. The primary squeeze action should be used for actions roughly mapping to squeezing or grabbing. Examples of possible primary squeeze actions are pressing a grip trigger or making a grabbing hand gesture. If the platform guidelines define a recommended primary squeeze action then it should be used as the primary squeeze action, otherwise the user agent MAY select one.

When an XR input source source for XRSession session begins its primary squeeze action the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session with time being the time the action occurred.

Queue a task to fire an input source event with name squeezestart, frame frame, and source source.

When an XR input source source for XRSession session ends its primary squeeze action the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session with time being the time the action occurred.

Queue a task to perform the following steps:

Fire an input source event with name squeeze, frame frame, and source source.

Fire an input source event with name squeezeend, frame frame, and source source.

Sometimes platform-specific behavior can result in a primary action or primary squeeze action being interrupted or cancelled. For example, an XR input source may be removed from the XR device after the primary action or primary squeeze action is started but before it ends.

When an XR input source source for XRSession session has its primary action cancelled the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session with time being the time the action occurred.

Queue a task to fire an input source event an XRInputSourceEvent with name selectend, frame frame, and source source.

When an XR input source source for XRSession session has its primary squeeze action cancelled the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session with time being the time the action occurred.

Queue a task to fire an input source event an XRInputSourceEvent with name squeezeend, frame frame, and source source.

10.2. Transient input
Some XR devices may support transient input sources, where the XR input source is only meaningful while performing a transient action, either the primary action for a primary input source, or a device-specific auxiliary action for an tracked input source.

One example would be mouse, touch, or stylus input against an "inline" XRSession, which MUST produce a transient XRInputSource with a targetRayMode set to screen, treated as a primary action for the primary pointer, and as a non-primary auxiliary action for a non-primary pointer.

Another example would be intents from the operating system with input derived from sensitive information that cannot be exposed directly, such as interactions based on gaze. These produce a transient XRInputSource with a targetRayMode set to transient-pointer, treated as a primary action.

Transient input sources are only present in the session’s list of active XR input sources for the duration of the transient action.

Transient input sources follow the following sequence when handling transient actions instead of the algorithms for non-transient primary actions:

When a transient input source source for XRSession session begins its transient action the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session for the time the action occurred.

Queue a task to perform the following steps:

Fire any "pointerdown" events produced by the XR input source's action, if necessary.

Add the XR input source to the list of active XR input sources.

If the transient action is a primary action, fire an input source event with name selectstart, frame frame, and source source.

When a transient input source source for XRSession session ends its transient action the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session for the time the action occurred.

Queue a task to perform the following steps:

If the transient action is a primary action, fire an input source event with name select, frame frame, and source source.

Fire any "click" events produced by the XR input source's action, if necessary.

If the transient action is a primary action, fire an input source event with name selectend, frame frame, and source source.

Remove the XR input source from the list of active XR input sources.

Fire any "pointerup" events produced by the XR input source's action, if necessary.

When a transient input source source for XRSession session has its transient action cancelled the UA MUST run the following steps:

Let frame be a new XRFrame in the relevant realm of session with session session for the time the action occurred.

Queue a task to perform the following steps:

If the transient action is a primary action, fire an input source event with name selectend, frame frame, and source source.

Remove the XR input source from the list of active XR input sources.

Fire any "pointerup" events produced by the XR input source's action, if necessary.

10.3. XRInputSourceArray
An XRInputSourceArray represents a list of XRInputSources. It is used in favor of a frozen array type when the contents of the list are expected to change over time, such as with the XRSession inputSources attribute.

[SecureContext, Exposed=Window]
interface XRInputSourceArray {
  iterable<XRInputSource>;
  readonly attribute unsigned long length;
  getter XRInputSource(unsigned long index);
};
The length attribute of XRInputSourceArray indicates how many XRInputSources are contained within the XRInputSourceArray.

The indexed property getter of XRInputSourceArray retrieves the XRInputSource at the provided index.

11. Layers
Note: While this specification only defines the XRWebGLLayer layer, future extensions to the spec are expected to add additional layer types and the image sources that they draw from.

11.1. XRLayer
[SecureContext, Exposed=Window]
interface XRLayer : EventTarget {};

XRLayer is the base class for XRWebGLLayer and other layer types introduced by future extensions.

11.2. XRWebGLLayer
An XRWebGLLayer is a layer which provides a WebGL framebuffer to render into, enabling hardware accelerated rendering of 3D graphics to be presented on the XR device.

typedef (WebGLRenderingContext or
         WebGL2RenderingContext) XRWebGLRenderingContext;

dictionary XRWebGLLayerInit {
  boolean antialias = true;
  boolean depth = true;
  boolean stencil = false;
  boolean alpha = true;
  boolean ignoreDepthValues = false;
  double framebufferScaleFactor = 1.0;
};

[SecureContext, Exposed=Window]
interface XRWebGLLayer: XRLayer {
  constructor(XRSession session,
             XRWebGLRenderingContext context,
             optional XRWebGLLayerInit layerInit = {});
  // Attributes
  readonly attribute boolean antialias;
  readonly attribute boolean ignoreDepthValues;
  attribute float? fixedFoveation;

  [SameObject] readonly attribute WebGLFramebuffer? framebuffer;
  readonly attribute unsigned long framebufferWidth;
  readonly attribute unsigned long framebufferHeight;

  // Methods
  XRViewport? getViewport(XRView view);

  // Static Methods
  static double getNativeFramebufferScaleFactor(XRSession session);
};
Each XRWebGLLayer has a context object, initially null, which is an instance of either a WebGLRenderingContext or a WebGL2RenderingContext.

Each XRWebGLLayer has an associated session, which is the XRSession it was created with.

The XRWebGLLayer(session, context, layerInit) constructor MUST perform the following steps when invoked:

Let layer be a new XRWebGLLayer in the relevant realm of session.

If session’s ended value is true, throw an InvalidStateError and abort these steps.

If context is lost, throw an InvalidStateError and abort these steps.

If session is an immersive session and context’s XR compatible boolean is false, throw an InvalidStateError and abort these steps.

Initialize layer’s context to context.

Initialize layer’s session to session.

Initialize layer’s ignoreDepthValues as follows:

If layerInit’s ignoreDepthValues value is false and the XR Compositor will make use of depth values:
Initialize layer’s ignoreDepthValues to false.

Otherwise:
Initialize layer’s ignoreDepthValues to true.

Initialize layer’s composition enabled boolean as follows:

If session is an inline session:
Initialize layer’s composition enabled to false.

Otherwise:
Initialize layer’s composition enabled boolean to true.

If layer’s composition enabled boolean is true:
Initialize layer’s antialias to layerInit’s antialias value.

Let scaleFactor be layerInit’s framebufferScaleFactor.

The user agent MAY choose to clamp or round scaleFactor as it sees fit here, for example if it wishes to fit the buffer dimensions into a power of two for performance reasons.

Let framebufferSize be the recommended WebGL framebuffer resolution with width and height separately multiplied by scaleFactor.

Initialize layer’s framebuffer to a new WebGLFramebuffer in the relevant realm of context, which is an opaque framebuffer with the dimensions framebufferSize created with context, session initialized to session, and layerInit’s depth, stencil, and alpha values.

Allocate and initialize resources compatible with session’s XR device, including GPU accessible memory buffers, as required to support the compositing of layer.

If layer’s resources were unable to be created for any reason, throw an OperationError and abort these steps.

Otherwise:
Initialize layer’s antialias to layer’s context's actual context parameters antialias value.

Initialize layer’s framebuffer to null.

Return layer.

Note: If an XRWebGLLayer's composition enabled boolean is set to false all values on the XRWebGLLayerInit object are ignored, since the WebGLRenderingContext's default framebuffer was already allocated using the context’s actual context parameters and cannot be overridden.

The context attribute is the WebGLRenderingContext the XRWebGLLayer was created with.

Each XRWebGLLayer has a composition enabled boolean which is initially set to true. If set to false it indicates that the XRWebGLLayer MUST NOT allocate its own WebGLFramebuffer, and all properties of the XRWebGLLayer that reflect framebuffer properties MUST instead reflect the properties of the context's default framebuffer.

The framebuffer attribute of an XRWebGLLayer is an instance of a WebGLFramebuffer which has been marked as opaque if composition enabled is true, and null otherwise. The framebuffer size cannot be adjusted by the developer after the XRWebGLLayer has been created.

An opaque framebuffer functions identically to a standard WebGLFramebuffer with the following changes that make it behave more like the default framebuffer:

An opaque framebuffer MAY support antialiasing, even in WebGL 1.0.

An opaque framebuffer's attachments cannot be inspected or changed. Calling framebufferTexture2D, framebufferRenderbuffer, deleteFramebuffer, or getFramebufferAttachmentParameter with an opaque framebuffer MUST generate an INVALID_OPERATION error.

An opaque framebuffer has a related session, which is the XRSession it was created for.

An opaque framebuffer is considered incomplete outside of a requestAnimationFrame() callback. When not in the requestAnimationFrame() callback of its session, calls to checkFramebufferStatus MUST generate a FRAMEBUFFER_UNSUPPORTED error and attempts to clear, draw to, or read from the opaque framebuffer MUST generate an INVALID_FRAMEBUFFER_OPERATION error.

An opaque framebuffer initialized with depth true will have an attached depth buffer.

An opaque framebuffer initialized with stencil true will have an attached stencil buffer.

An opaque framebuffer's color buffer will have an alpha channel if and only if alpha is true.

The XR Compositor will assume the opaque framebuffer contains colors with premultiplied alpha. This is true regardless of the premultipliedAlpha value set in the context's actual context parameters.

Note: User agents are required to respect true values of depth and stencil, which is similar to WebGL’s behavior when creating a drawing buffer.

The buffers attached to an opaque framebuffer MUST be cleared to the values in the table below when first created, or prior to the processing of each XR animation frame. This is identical to the behavior of the WebGL context’s default framebuffer. Opaque framebuffers will always be cleared regardless of the associated WebGL context’s preserveDrawingBuffer value.

Buffer	Clear Value
Color	(0, 0, 0, 0)
Depth	1.0
Stencil	0
Note: Implementations may optimize away the required implicit clear operation of the opaque framebuffer as long as a guarantee can be made that the developer cannot gain access to buffer contents from another process. For instance, if the developer performs an explicit clear then the implicit clear is not needed.

If an XRWebGLLayer is created with an alpha set to true, the framebuffer must be backed by a texture with the RGBA color format. If an XRWebGLLayer is created with an alpha set to false, the framebuffer must be backed by a texture with the RGB color format.

However, the XR Compositor MUST treat the framebuffer's backing’s pixels as if they were in the SRGB8_ALPHA8 or SRGB8 colorFormat.

NOTE: this means that the XR Compositor MUST not do any gamma conversion from linear RGBA or RGB when it processes the texture backing the framebuffer. Otherwise, the pixels in the final rendering will appear too bright which will not match the rendering on a regular 2D WebGLRenderingContext context.

When an XRWebGLLayer is set as an immersive session's baseLayer the content of the opaque framebuffer is presented to the immersive XR device immediately after an XR animation frame completes, but only if at least one of the following has occurred since the previous XR animation frame:

The immersive session's baseLayer was changed.

clear, drawArrays, drawElements, or any other rendering operation which similarly affects the framebuffer’s color values has been called while the opaque framebuffer is the currently bound framebuffer of the WebGLRenderingContext associated with the XRWebGLLayer.

Before the opaque framebuffer is presented to the immersive XR device the user agent shall ensure that all rendering operations have been flushed to the opaque framebuffer.

Each XRWebGLLayer has a target framebuffer, which is the framebuffer if composition enabled is true, and the context's default framebuffer otherwise.

The framebufferWidth and framebufferHeight attributes return the width and height of the target framebuffer's attachments, respectively.

The antialias attribute is true if the target framebuffer supports antialiasing using a technique of the UA’s choosing, and false if no antialiasing will be performed.

The ignoreDepthValues attribute, if true, indicates the XR Compositor MUST NOT make use of values in the depth buffer attachment when rendering. When the attribute is false it indicates that the content of the depth buffer attachment will be used by the XR Compositor and is expected to be representative of the scene rendered into the layer.

Depth values stored in the buffer are expected to be between 0.0 and 1.0, with 0.0 representing the distance of depthNear and 1.0 representing the distance of depthFar, with intermediate values interpolated linearly. This is the default behavior of WebGL. (See documentation for the depthRange function for additional details.)

Note: Making the scene’s depth buffer available to the compositor allows some platforms to provide quality and comfort improvements such as improved reprojection.

The fixedFoveation attribute controls the amount of foveation used by the XR Compositor. If the user agent or device does not support this attribute, they should return null on getting, and setting should be a no-op. Setting fixedFoveation to a value less than 0 will set it to 0 and setting it to a value higher than 1 will set it to 1. 0 sets the minimum amount of foveation while 1 sets the maximum. It is up to the user agent how the XR Compositor interprets these values. If the fixedFoveation level was changed, it will take effect at the next XRFrame.

NOTE: Fixed foveation is a technique that reduces the resolution content renders at near the edges of the user’s field of view. It can significantly improve experiences that are limited by GPU fill performance. It reduces power consumption and enables applications to increase the resolution of eye textures. It is most useful for low contrast textures, such as background images but less for high contrast ones such as text or detailed images. Authors can adjust the level on a per frame basis to achieve the best tradeoff between performance and visual quality.

Each XRWebGLLayer MUST have a list of full-sized viewports which is a list containing one WebGL viewport for each view the XRSession may expose, including secondary views that are not currently active but may become active for the current session. The viewports MUST have a width and height greater than 0 and MUST describe a rectangle that does not exceed the bounds of the target framebuffer. The viewports MUST NOT be overlapping. If composition enabled is false, the list of full-sized viewports MUST contain a single WebGL viewport that covers the context's entire default framebuffer.

Each XRWebGLLayer MUST have a list of viewport objects which is a list containing one XRViewport for each active view the XRSession currently exposes.

getViewport() queries the XRViewport the given XRView should use when rendering to the layer.

The getViewport(view) method, when invoked on an XRWebGLLayer layer, MUST run the following steps:

Let session be view’s session.

Let frame be session’s animation frame.

If session is not equal to layer’s session, throw an InvalidStateError and abort these steps.

If frame’s active boolean is false, throw an InvalidStateError and abort these steps.

If view’s frame is not equal to frame, throw an InvalidStateError and abort these steps.

If the viewport modifiable flag is true and view’s requested viewport scale is not equal to current viewport scale:

Set current viewport scale to requested viewport scale.

In the list of viewport objects, set the XRViewport associated with view to the XRViewport result of obtaining a scaled viewport from the list of full-sized viewports associated with view for session.

Set the view’s viewport modifiable flag to false.

Let viewport be the XRViewport from the list of viewport objects associated with view.

Return viewport.

Note: The viewport modifiable flag is intentionally set to false even if there was no change to the current viewport scale. This ensures that getViewport(view) calls always return consistent results within an animation frame for that view, so the first retrieved value is locked in for the remainder of the frame. If an application calls requestViewportScale() after getViewport(), the requested value is only applied later when getViewport() is called again in a future frame.

Each XRSession MUST identify a native WebGL framebuffer resolution, which is the pixel resolution of a WebGL framebuffer required to match the physical pixel resolution of the XR device.

The native WebGL framebuffer resolution for an XRSession session is determined by running the following steps:

If session’s mode value is not "inline", set the native WebGL framebuffer resolution to the resolution required to have a 1:1 ratio between the pixels of a framebuffer large enough to contain all of the session’s XRViews and the physical screen pixels in the area of the display under the highest magnification and abort these steps. If no method exists to determine the native resolution as described, the recommended WebGL framebuffer resolution MAY be used.

If session’s mode value is "inline", set the native WebGL framebuffer resolution to the size of the session’s renderState's output canvas in physical display pixels and reevaluate these steps every time the size of the canvas changes or the output canvas is changed.

Additionally, the XRSession MUST identify a recommended WebGL framebuffer resolution, which represents a best estimate of the WebGL framebuffer resolution large enough to contain all of the session’s XRViews that provides an average application a good balance between performance and quality. It MAY be smaller than, larger than, or equal to the native WebGL framebuffer resolution. New opaque framebuffer will be created with this resolution, with width and height each scaled by any XRWebGLLayerInit's framebufferScaleFactor provided.

Note: The user agent is free to use any method of its choosing to estimate the recommended WebGL framebuffer resolution. If there are platform-specific methods for querying a recommended size it is recommended that they be used, but not required. The scale factors used by framebufferScaleFactor and getNativeFramebufferScaleFactor() apply to width and height separately, so a scale factor of two results in four times the overall pixel count. If the platform exposes an area-based render scale that’s based on pixel count, the user agent needs to take the square root of that to convert it to a WebXR scale factor.

The getNativeFramebufferScaleFactor(session) method, when invoked, MUST run the following steps:

Let session be this.

If session’s ended value is true, return 0.0 and abort these steps.

Return the value that the session’s recommended WebGL framebuffer resolution width and height must each be multiplied by to yield the session’s native WebGL framebuffer resolution.

11.3. WebGL Context Compatibility
In order for a WebGL context to be used as a source for immersive XR imagery it must be created on a compatible graphics adapter for the immersive XR device. What is considered a compatible graphics adapter is platform dependent, but is understood to mean that the graphics adapter can supply imagery to the immersive XR device without undue latency. If a WebGL context was not already created on the compatible graphics adapter, it typically must be re-created on the adapter in question before it can be used with an XRWebGLLayer.

Note: On an XR platform with a single GPU, it can safely be assumed that the GPU is compatible with the immersive XR devices advertised by the platform, and thus any hardware accelerated WebGL contexts are compatible as well. On PCs with both an integrated and discrete GPU the discrete GPU is often considered the compatible graphics adapter since it generally is a higher performance chip. On desktop PCs with multiple graphics adapters installed, the one with the immersive XR device physically connected to it is likely to be considered the compatible graphics adapter.

Note: "inline" sessions render using the same graphics adapter as canvases, and thus do not need xrCompatible contexts.

partial dictionary WebGLContextAttributes {
    boolean xrCompatible = false;
};

partial interface mixin WebGLRenderingContextBase {
    [NewObject] Promise<undefined> makeXRCompatible();
};
When a user agent implements this specification it MUST set an XR compatible boolean, initially set to false, on every WebGLRenderingContextBase. Once the XR compatible boolean is set to true, the context can be used with layers for any XRSession requested from the current immersive XR device.

Note: This flag introduces slow synchronous behavior and is discouraged. Consider calling makeXRCompatible() instead for an asynchronous solution.

The XR compatible boolean can be set either at context creation time or after context creation, potentially incurring a context loss. To set the XR compatible boolean at context creation time, the xrCompatible context creation attribute must be set to true when requesting a WebGL context. If the requesting document’s origin is not allowed to use the "xr-spatial-tracking" permissions policy, xrCompatible has no effect.

The xrCompatible flag on WebGLContextAttributes, if true, affects context creation by requesting the user agent create the WebGL context using a compatible graphics adapter for the immersive XR device. If the user agent succeeds in this, the created context’s XR compatible boolean will be set to true. To obtain the immersive XR device, ensure an immersive XR device is selected SHOULD be called.

Note: Ensure an immersive XR device is selected needs to be run in parallel, which introduces slow synchronous behavior on the main thread. User agents SHOULD print a warning to the console requesting that makeXRCompatible() be used instead.

The following code creates a WebGL context that is compatible with an immersive XR device and then uses it to create an XRWebGLLayer.
function onXRSessionStarted(xrSession) {
  const glCanvas = document.createElement("canvas");
  const gl = glCanvas.getContext("webgl", { xrCompatible: true });

  loadWebGLResources();

  xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });
}
To set the XR compatible boolean after the context has been created, the makeXRCompatible() method is used.

Note: On some systems this flag may turn on a high powered discrete GPU, for example, or proxy all commands to an on-device GPU. If you are in a situation where you may or may not be using XR, it is suggested that you only call makeXRCompatible() when you intend to start an immersive session.

The makeXRCompatible() method ensures the WebGLRenderingContextBase is running on a compatible graphics adapter for the immersive XR device.
When this method is invoked, the user agent MUST run the following steps:

If the requesting document’s origin is not allowed to use the "xr-spatial-tracking" permissions policy, resolve promise and return it. When the XR permissions policy is disabled, we wish to behave as if there is no XR device in this case, since makeXRCompatible() is supposed to be a set-and-forget method.

Let promise be a new Promise created in the Realm of this WebGLRenderingContextBase.

Let context be this.

Run the following steps in parallel:

Let device be the result of ensuring an immersive XR device is selected.

Set context’s XR compatible boolean as follows:

If context’s WebGL context lost flag is set:
Queue a task to set context’s XR compatible boolean to false and reject promise with an InvalidStateError.

If device is null:
Queue a task to set context’s XR compatible boolean to false and reject promise with an InvalidStateError.

If context’s XR compatible boolean is true:
Queue a task to resolve promise.

If context was created on a compatible graphics adapter for device:
Queue a task to set context’s XR compatible boolean to true and resolve promise.

Otherwise:
Queue a task on the WebGL task source to perform the following steps:

Force context to be lost.

Handle the context loss as described by the WebGL specification:

Let canvas be the context’s canvas.

If context’s webgl context lost flag is set, abort these steps.

Set context’s webgl context lost flag.

Set the invalidated flag of each WebGLObject instance created by context.

Disable all extensions except "WEBGL_lose_context".

Queue a task on the WebGL task source to perform the following steps:

Fire a WebGL context event e named "webglcontextlost" at canvas, with statusMessage set to "".

If e’s canceled flag is not set, reject promise with an AbortError and abort these steps.

Run the following steps in parallel.

Await a restorable drawing buffer on a compatible graphics adapter for device.

Queue a task on the WebGL task source to perform the following steps:

Restore the context on a compatible graphics adapter for device.

Set context’s XR compatible boolean to true.

Resolve promise.

Return promise.

Additionally, when any WebGL context is lost run the following steps prior to firing the "webglcontextlost" event:

Set the context’s XR compatible boolean to false.

The following code creates an XRWebGLLayer from a pre-existing WebGL context.
const glCanvas = document.createElement("canvas");
const gl = glCanvas.getContext("webgl");

loadWebGLResources();

glCanvas.addEventListener("webglcontextlost", (event) => {
  // Indicates that the WebGL context can be restored.
  event.canceled = true;
});

glCanvas.addEventListener("webglcontextrestored", (event) => {
  // WebGL resources need to be re-created after a context loss.
  loadWebGLResources();
});

async function onXRSessionStarted(xrSession) {
  // Make sure the canvas context we want to use is compatible with the device.
  // May trigger a context loss.
  await gl.makeXRCompatible();
  xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });
}
12. Events
The task source for all tasks queued in this specification is the XR task source, unless otherwise specified.

12.1. XRSessionEvent
XRSessionEvents are fired to indicate changes to the state of an XRSession.

[SecureContext, Exposed=Window]
interface XRSessionEvent : Event {
  constructor(DOMString type, XRSessionEventInit eventInitDict);
  [SameObject] readonly attribute XRSession session;
};

dictionary XRSessionEventInit : EventInit {
  required XRSession session;
};
The session attribute indicates the XRSession that generated the event.

12.2. XRInputSourceEvent
XRInputSourceEvents are fired to indicate changes to the state of an XRInputSource.

[SecureContext, Exposed=Window]
interface XRInputSourceEvent : Event {
  constructor(DOMString type, XRInputSourceEventInit eventInitDict);
  [SameObject] readonly attribute XRFrame frame;
  [SameObject] readonly attribute XRInputSource inputSource;
};

dictionary XRInputSourceEventInit : EventInit {
  required XRFrame frame;
  required XRInputSource inputSource;
};
The inputSource attribute indicates the XRInputSource that generated this event.

The frame attribute is an XRFrame that corresponds with the time that the event took place. It may represent historical data. getViewerPose() MUST throw an exception when called on frame.

When the user agent has to fire an input source event with name name, XRFrame frame, and XRInputSource source it MUST run the following steps:

Create an XRInputSourceEvent event with type name, frame frame, and inputSource source.

Set frame’s active boolean to true.

Apply frame updates for frame.

Dispatch event on frame’s session

Set frame’s active boolean to false.

12.3. XRInputSourcesChangeEvent
XRInputSourcesChangeEvents are fired to indicate changes to the list of active XR input sources that are available to an XRSession.

[SecureContext, Exposed=Window]
interface XRInputSourcesChangeEvent : Event {
  constructor(DOMString type, XRInputSourcesChangeEventInit eventInitDict);
  [SameObject] readonly attribute XRSession session;
  [SameObject] readonly attribute FrozenArray<XRInputSource> added;
  [SameObject] readonly attribute FrozenArray<XRInputSource> removed;
};

dictionary XRInputSourcesChangeEventInit : EventInit {
  required XRSession session;
  required sequence<XRInputSource> added;
  required sequence<XRInputSource> removed;

};
The session attribute indicates the XRSession that generated the event.

The added attribute is a list of XRInputSources that were added to the XRSession at the time of the event.

The removed attribute is a list of XRInputSources that were removed from the XRSession at the time of the event.

12.4. XRReferenceSpaceEvent
XRReferenceSpaceEvents are fired to indicate changes to the state of an XRReferenceSpace.

[SecureContext, Exposed=Window]
interface XRReferenceSpaceEvent : Event {
  constructor(DOMString type, XRReferenceSpaceEventInit eventInitDict);
  [SameObject] readonly attribute XRReferenceSpace referenceSpace;
  [SameObject] readonly attribute XRRigidTransform? transform;
};

dictionary XRReferenceSpaceEventInit : EventInit {
  required XRReferenceSpace referenceSpace;
  XRRigidTransform? transform = null;
};
The referenceSpace attribute indicates the XRReferenceSpace that generated this event.

The optional transform attribute describes the post-event position and orientation of the referenceSpace's native origin in the pre-event coordinate system. This attribute MAY be null if the XRSystem can’t determine the delta between the old and the new coordinate system.

NOTE: situations where referenceSpace or referenceSpace can be when the headset was doffed and donned between 2 seperate locations. In such cases, if the experience relies on world-locked content, it should warn the user and reset the scene.

12.5. Event Types
The user agent MUST provide the following new events. Registration for and firing of the events must follow the usual behavior of DOM Events.

The user agent MUST fire an event named devicechange event on the XRSystem object to indicate that the availability of immersive XR devices has been changed unless the document’s origin is not allowed to use the "xr-spatial-tracking" permissions policy.

A user agent MUST fire an event named visibilitychange using XRSessionEvent on an XRSession each time the visibility state of the XRSession has changed.

A user agent MUST fire an event named end using XRSessionEvent on an XRSession when the session ends, either by the application or the user agent.

A user agent MUST fire an event named inputsourceschange using XRInputSourcesChangeEvent on an XRSession when the session’s list of active XR input sources has changed.

A user agent MUST fire an event named trackedsourceschange using XRInputSourcesChangeEvent on an XRSession when the session’s list of active XR tracked sources has changed.

A user agent MUST fire an event named selectstart using XRInputSourceEvent on an XRSession when one of its XRInputSources begins its primary action. The event MUST be of type .

A user agent MUST fire an event named selectend using XRInputSourceEvent on an XRSession when one of its XRInputSources ends its primary action or when an XRInputSource that has begun a primary action is disconnected.

A user agent MUST fire an event named select using XRInputSourceEvent on an XRSession when one of its XRInputSources has fully completed a primary action.

A user agent MUST fire an event named squeezestart using XRInputSourceEvent on an XRSession when one of its XRInputSources begins its primary squeeze action.

A user agent MUST fire an event named squeezeend using XRInputSourceEvent on an XRSession when one of its XRInputSources ends its primary squeeze action or when an XRInputSource that has begun a primary squeeze action is disconnected.

A user agent MUST fire an event named squeeze using XRInputSourceEvent on an XRSession when one of its XRInputSources has fully completed a primary squeeze action.

A user agent MUST fire an event named frameratechange using XRSessionEvent on an XRSession when the XR Compositor changes the XRSession's internal nominal framerate.

A user agent MUST fire an event named reset using XRReferenceSpaceEvent on an XRReferenceSpace when discontinuities of the native origin or effective origin occur, i.e. there are significant changes in the origin’s position or orientation relative to the user’s environment. (For example: After user recalibration of their XR device or if the XR device automatically shifts its origin after losing and regaining tracking.) A reset event MUST also be dispatched when the boundsGeometry changes for an XRBoundedReferenceSpace. A reset event MUST NOT be dispatched if the viewer's pose experiences discontinuities but the XRReferenceSpace's origin physical mapping remains stable, such as when the viewer momentarily loses and regains tracking within the same tracking area. A reset event also MUST NOT be dispatched as an unbounded reference space makes small adjustments to its native origin over time to maintain space stability near the user, if a significant discontinuity has not occurred. The event MUST be dispatched prior to the execution of any XR animation frames that make use of the new origin. A reset event MUST be dispatched on all offset reference spaces of a reference space that fires a reset event, and the boundsGeometry of offset XRBoundedReferenceSpaces should also be recomputed.

Note: This does mean that the session needs to hold on to strong references to any XRReferenceSpaces that have reset listeners.

Note: Jumps in viewer position can be handled by the application by observing the emulatedPosition boolean. If a jump in viewer position coincides with emulatedPosition switching from true to false, it indicates that the viewer has regained tracking and their new position represents a correction from the previously emulated values. For experiences without a "teleportation" mechanic, where the viewer can move through the virtual world without moving physically, this is generally the application’s desired behavior. However, if an experience does provide a "teleportation" mechanic, it may be needlessly jarring to jump the viewer's position back after tracking recovery. Instead, when such an application recovers tracking, it can simply resume the experience from the viewer's current position in the virtual world by absorbing that sudden jump in position into its teleportation offset. To do so, the developer calls getOffsetReferenceSpace() to create a replacement reference space with its effective origin adjusted by the amount that the viewer's position jumped since the previous frame.

13. Security, Privacy, and Comfort Considerations
The WebXR Device API provides powerful new features which bring with them several unique privacy, security, and comfort risks that user agents must take steps to mitigate.

13.1. Sensitive Information
In the context of XR, sensitive information includes, but is not limited to, user-configurable data such as interpupillary distance (IPD) and sensor-based data such as XRPoses. All immersive sessions will expose some amount of sensitive data, due to the user’s pose being necessary to render anything. However, in some cases, the same sensitive information will also be exposed via "inline" sessions.

13.2. User intention
User intent for a given action is a signal from the user that such an action was intentional and has their consent.

It is often necessary to be sure of user intent before exposing sensitive information or allowing actions with a significant effect on the user’s experience. This intent may be communicated or observed in a number of ways.

Note: A common way of determining user intent is by transient activation of a UI control, typically an "enter VR" button. Since activation is transient, the browsing context requesting an XR session must be an ancestor or a same origin-domain descendant of the context containing the UI control, and must recently have been the active document of the browsing context.

13.2.1. User activation
Transient activation MAY serve as an indication of user intent in some scenarios.
13.2.2. Launching a web application
In some environments a page may be presented as an application, installed with the express intent of running immersive content. In that case launching a web application MAY also serve as an indication of user intent.
13.2.3. Implicit and Explicit consent
Implicit consent is when the user agent makes a judgement on the consent of a user without explicitly asking for it, for example, based on the install status of a web application, frequency and recency of visits or a user agent defined action where the user clearly signals intent that they want to enter an immersive experience. Given the sensitivity of XR data, caution is strongly advised when relying on implicit signals.

Explicit consent is when the user agent makes a judgement on the consent of a user based on having explicitly asked for it. When gathering explicit consent, user agents present an explanation of what is being requested and provide users the option to decline. Requests for user consent can be presented in many visual forms based on the features being protected and user agent choice. Install status of a web application MAY count as a signal of explicit consent provided some form of explicit consent is requested at install time.

13.2.4. Duration of consent
It is recommended that once explicit consent is granted for a specific origin that this consent persist until the browsing context has ended. User agents may choose to lengthen or shorten this consent duration based upon implicit or explicit signals of user intent, but implementations are advised to exercise caution when deviating from this recommendation, particularly when relying on implicit signals. For example, it may be appropriate for a web application installed with the express intent of running immersive content to persist the user’s consent, but not for an installed web application where immersive content is a secondary feature.
Regardless of how long the user agent chooses to persist the user’s consent, sensitive information MUST only be exposed by an XRSession which has not ended.

13.3. Mid-session consent
There are multiple non-XR APIs which cause user agents to request explicit consent to use a feature. If the user agent will request the user’s consent while there is an active immersive session, the user agent MUST shut down the session prior to displaying the consent request to the user. If the user’s consent for the feature had been granted prior to the active immersive session being created the session does not need to be terminated.

Note: This limitation is to ensure that there is behavioral parity between all user agents until consensus is reached about how user agents should manage mid-session explicit consent. It is not expected to be a long term requirement.

13.4. Data adjustments
In some cases, security and privacy threats can be mitigated through data adjustments such as throttling, quantizing, rounding, limiting, or otherwise manipulating the data reported from the XR device. This may sometimes be necessary to avoid fingerprinting, even in situations when user intent has been established. However, data adjustment mitigations MUST only be used in situations which would not result in user discomfort.

13.4.1. Throttling
Throttling is when sensitive information is reported at a lower frequency than otherwise possible. This mitigation has the potential to reduce a site’s ability to infer user intent, infer location, or perform user profiling. However, when not used appropriately throttling runs a significant risk of causing user discomfort. In addition, under many circumstances it may be inadequate to provide a complete mitigation.
13.4.2. Rounding, quantization, and fuzzing
Rounding, quantization, and fuzzing are three categories of mitigations that modify the raw data that would otherwise be returned to the developer. Rounding decreases the precision of data by reducing the number of digits used to express it. Quantization constrains continuous data to instead report a discrete subset of values. Fuzzing is the introduction of slight, random errors into the data. Collectively, these mitigations are useful to avoid fingerprinting, and are especially useful when doing so does not cause noticeable impact on user comfort.
13.4.3. Limiting
Limiting is when data is reported only when it is within a specific range. For example, it is possible to comfortably limit reporting positional pose data when a user has moved beyond a specific distance away from an approved location. Care should be taken to ensure that the user experience is not negatively affected when employing this mitigation. It is often desirable to avoid a 'hard stop' at the end of a range as this may cause disruptive user experiences.
13.5. Protected functionality
The sensitive information exposed by the API can be divided into categories that share threat profiles and necessary protections against those threats.

13.5.1. Immersiveness
Users must be in control of when immersive sessions are created because the creation causes invasive changes on a user’s machine. For example, starting an immersive session will engage the XR device sensors, take over access to the device’s display, and begin presenting immersive content which may terminate another application’s access to the XR hardware. It may also incur significant power or performance overhead on some systems or trigger the launching of a status tray or storefront.
To determine if an immersive session request is allowed for a given global object the user agent MUST run the following steps:

If the request was not made while the global object has transient activation or when launching a web application, return false

If user intent to begin an immersive session is not well understood, either via explicit consent or implicit consent, return false

Return true

Starting an "inline" session does not implicitly carry the same requirements, though additional requirements may be imposed depending on the session’s requested features.

To determine if an inline session request is allowed for a given global object the user agent MUST run the following steps:

If the session request contained any required features or optional features and the request was not made while the global object has transient activation or when launching a web application, return false.

If the global object is not a Window, return false.

Return true.

13.5.2. Poses
When based on sensor data, XRPose and XRViewerPose will expose sensitive information that may be misused in a number of ways, including input sniffing, gaze tracking, or fingerprinting.
To determine if poses may be reported to an XRSession session, the user agent MUST run the following steps:

If session’s relevant global object is not the current global object, return false.

If session’s visibilityState is "hidden", return false.

Determine if the pose data can be returned as follows:

If the pose data is known by the user agent to not expose fingerprintable sensor data
Return true.

If data adjustments will be applied to the underlying sensor data to prevent fingerprinting or profiling
Return true.

If user intent is well understood, either via explicit consent or implicit consent
Return true.

Otherwise
Return false.

Note: The method by which a user agent determines that poses do not expose fingerprintable data is left to the user agent’s discretion.

The primary difference between XRViewerPose and XRPose is the inclusion of XRView information. When more than one view is present and the physical relationship between these views is configurable by the user, the relationship between these views is considered sensitive information as it can be used to fingerprint or profile the user.

If the relationship between XRViews could uniquely identify the XR device, then the user agent MUST anonymize the XRView data to prevent fingerprinting. The method of anonymization is at the discretion of the user agent.

Note: Furthermore, if the relationship between XRViews is affected by a user-configured interpupillary distance (IPD), then it is strongly recommended that the user agent require explicit consent during session creation, prior to reporting any XRView data.

13.5.3. Reference spaces
Depending on the reference spaces used, several different types of sensitive information may be exposed to the application.
On devices which support 6DoF tracking, "local" reference spaces may be used to perform gait analysis, allowing user profiling and fingerprinting.

On devices which support 6DoF tracking, "local-floor" reference spaces may be used to perform gait analysis, allowing user profiling and fingerprinting. In addition, because the "local-floor" reference spaces provide an established floor level, it may be possible for a site to infer the user’s height, allowing user profiling and fingerprinting.

"bounded-floor" reference spaces, when sufficiently constrained in size, do not enable developers to determine geographic location. However, because the floor level is established and users are able to walk around, it may be possible for a site to infer the user’s height or perform gait analysis, allowing user profiling and fingerprinting. In addition, it may be possible to perform fingerprinting using the bounds reported by a bounded reference space.

"unbounded" reference spaces reveal the largest amount of spatial data and may result in user profiling and fingerprinting. For example, this data may enable determining a user’s specific geographic location or to perform gait analysis.

As a result the various reference space types have restrictions placed on their creation to ensure the sensitive information exposed is handled safely:

Most reference spaces require that user intent to use the reference space is well understood, either via explicit consent or implicit consent. See the feature requirements table for details.

Any group of "local", "local-floor", and "bounded-floor" reference spaces that are capable of being related to one another MUST share a common native origin; This restriction only applies when the creation of "unbounded" reference spaces has been restricted.

To determine if poses must be limited between two spaces, space and baseSpace, the user agent MUST run the following steps:

If either space or baseSpace are an XRBoundedReferenceSpace and the other space’s native origin falls further outside the native bounds geometry than a reasonable distance determined by the user agent, return true.

If either space or baseSpace are an XRReferenceSpace with a type of "local" or "local-floor" and the distance between the spaces' native origins is greater than a reasonable distance determined by the user agent, return true.

Return false.

Note: The requirement for document visibility is based on [DEVICE-ORIENTATION].

Note: It is suggested that poses reported relative to a "local" or "local-floor" reference space be limited to a distance of 15 meters from the XRReferenceSpace's native origin.

Note: It is suggested that poses reported relative to an XRBoundedReferenceSpace be limited to a distance of 1 meter outside the XRBoundedReferenceSpace's native bounds geometry.

13.6. Trusted Environment
A Trusted UI is an interface presented by the User Agent that the user is able to interact with but the page cannot. The user agent MUST support showing trusted UI.

A trusted UI MUST have the following properties:

It must not be spoofable

It indicates where the request/content displayed originates from

If it relies on a shared secret with the user, this shared secret cannot be observed by a mixed reality capture (e.g. it may not be a gesture that can be seen by the camera)

It is consistent between immersive experiences in the same UA

Broadly speaking, there are two options for user agents who wish to support trusted UI. One option is trusted immersive UI, which is a trusted UI which does not exit immersive mode. Implementing trusted immersive UI can be challenging because XRWebGLLayer buffers fill the XR Device display and the User Agent does not typically "reserve" pixels for its own use. User agents are not required to support trusted immersive UI, they may instead temporarily pause/exit immersive mode and show non-immersive trusted UI to the user.

Note: Examples of trusted UI include:
The default 2D mode browser shown when not in immersive mode

A prompt shown within immersive mode which can only be interacted with via a reserved hardware button to prevent spoofing

Pausing the immersive session and showing some form of native system environment in which a prompt can be shown

The ability to read input information (head pose, input pose, etc) poses a risk to the integrity of trusted UI as the page may use this information to snoop on the choices made by the user while interacting with the trusted UI, including guessing keyboard input. To prevent this risk the user agent MUST set the visibility state of all XRSessions to "hidden" or "visible-blurred" when the user is interacting with trusted UI (immersive or non-immersive) such as URL bars or system dialogs. Additionally, to prevent a malicious page from being able to monitor input on other pages the user agent MUST set the XRSession's visibility state to "hidden" if the currently focused area does not belong to the document which created the XRSession.

When choosing between using "hidden" or "visible-blurred" for a particular instance of trusted UI, the user agent MUST consider whether head pose information is a security risk. For example, trusted UI involving text input, especially password inputs, can potentially leak the typed text through the user’s head pose as they type. The user agent SHOULD also stop exposing any eye tracking-related information in such cases.

The user agent MUST use trusted UI to show permissions prompts.

If the virtual environment does not consistently track the user’s head motion with low latency and at a high frame rate the user may become disoriented or physically ill. Since it is impossible to force pages to produce consistently performant and correct content the user agent MUST provide a tracked, trusted environment and an XR Compositor which runs asynchronously from page content. The compositor is responsible for compositing the trusted and untrusted content. If content is not performant, does not submit frames, or terminates unexpectedly the user agent should be able to continue presenting a responsive, trusted UI.

Additionally, page content has the ability to make users uncomfortable in ways not related to performance. Badly applied tracking, strobing colors, and content intended to offend, frighten, or intimidate are examples of content which may cause the user to want to quickly exit the XR experience. Removing the XR device in these cases may not always be a fast or practical option. To accommodate this the user agent MUST provide users with an action, such as pressing a reserved hardware button or performing a gesture, that escapes out of WebXR content and displays the user agent’s trusted UI.

13.7. Context Isolation
The trusted UI must be drawn by an independent rendering context whose state is isolated from any rendering contexts used by the page. (For example, any WebGL rendering contexts.) This is to prevent the page from corrupting the state of the trusted UI’s context, which may prevent it from properly rendering a tracked environment. It also prevents the possibility of the page being able to capture imagery from the trusted UI, which could lead to private information being leaked.

Also, to prevent CORS-related vulnerabilities each browsing context will see a new instance of objects returned by the API, such as XRSession. Attributes such as the context set on an XRWebGLLayer with one relevant realm should not be able to be read through an XRWebGLLayer with a relevant realm that does not have the same origin. Similarly, methods invoked on the API MUST NOT cause an observable state change on other browsing contexts. For example: No method will be exposed that enables a system-level orientation reset, as this could be called repeatedly by a malicious page to prevent other pages from tracking properly. The user agent MUST, however, respect system-level orientation resets triggered by a user gesture or system menu.

Note: This doesn’t apply to state changes that are caused by one browsing context entering immersive mode, acquiring a lock on the device, and potentially firing devicechange events on other browsing contexts.

13.8. Fingerprinting
Given that the API describes hardware available to the user and its capabilities it will inevitably provide additional surface area for fingerprinting. While it’s impossible to completely avoid this, user agents should take steps to mitigate the issue. This spec limits reporting of available hardware to only a single device at a time, which prevents using the rare cases of multiple headsets being connected as a fingerprinting signal. Also, the devices that are reported have no string identifiers and expose very little information about the devices capabilities until an XRSession is created, which requires additional protections when sensitive information will be exposed.

13.8.1. Fingerprinting considerations of isSessionSupported()
Because isSessionSupported() can be called without user activation it may be used as a fingerprinting vector.

"xr-session-supported" powerful feature gates access to the isSessionSupported() API.

The "xr-session-supported"’s permission-related algorithms and types are defined as follows:

permission descriptor type
dictionary XRSessionSupportedPermissionDescriptor: PermissionDescriptor {
  XRSessionMode mode;
};
name for XRPermissionDescriptor is "xr-session-supported".

13.8.2. Considerations for when to automatically grant "xr-session-supported"
There is often tension between privacy and personalization on the Web. This section provides guidance on where that tradeoff can be circumscribed, and when the user agent can describe the browser’s WebXR capabilities to a site via isSessionSupported() without any privacy reduction.

"xr-session-supported" may be granted automatically for some systems based on the criteria below. This can provide a better user experience and mitigate permissions fatigue.

A set of user agents is indistinguishable by user agent string if they all report the same userAgent and appVersion. Such classes are typically identified by the browser version and platform/device being run on, but cannot be distinguished by the status of any connected external device. We can use the concept of user agents that are indistinguishable by user agent string to properly assess fingerprinting risk.

Some user agents indistinguishable by user agent string will never support sessions of a given XRSessionMode. For example: User agents running on a model of phone that is known to not meet requirements for mobile AR support. In these cases there is little fingerprinting risk in isSessionSupported() always reporting the XRSessionMode is not supported because every such device will consistently report the same value and it’s assumed that device type and model can be inferred in other ways, such as through userAgent. Thus, on such systems, the user agent should automatically deny "xr-session-supported" for the relevant XRSessionMode.

Other user agents indistinguishable by user agent string will usually support sessions of a given XRSessionMode. For example: User agents known to support WebXR that run exclusively within VR headsets are likely to support "immersive-vr" sessions unless specifically blocked by the user. In these cases reporting that the XRSessionMode is not supported, while accurate, would offer more uniquely identifying information about the user. As such reporting that the XRSessionMode is always available and allowing requestSession() to fail is more privacy-preserving while likely not being a source of confusion for the user. On such systems, the user agent should automatically grant "xr-session-supported" for the relevant XRSessionMode.

User agents indistinguishable by user agent string for which availability of XR capabilities is highly variable, such as desktop systems which support XR peripherals, present the highest fingerprinting risk. User agents on such devices should not automatically grant "xr-session-supported" in a way that allows the isSessionSupported() API to provide additional fingerprinting bits.

Note: Some acceptable approaches to handle such cases are as follows:
Always judging explicit consent for "xr-session-supported" (with a potentially cached permissions prompt or similar) when isSessionSupported() is called.

Automatically granting "xr-session-supported" but having isSessionSupported() always report true even on platforms which do not consistently have XR capabilities available, regardless of whether or not the appropriate hardware or software is present. This comes at the cost of user ergonomics, as it will cause pages to advertise XR content to users that cannot view it.

Have isSessionSupported() request explicit consent for "xr-session-supported" when the appropriate hardware is present, and when such hardware is _not_ present, return false after an appropriately random length of time. In such an implementation content must not be able to distinguish between cases where the user agent was not connected to XR hardware and cases where the user agent was connected to XR hardware but the user declined to provide explicit consent.

Whatever the technique chosen, it should not reveal additional knowledge about connected XR hardware without explicit consent.

14. Integrations
14.1. Permissions Policy
This specification defines a policy-controlled feature that controls whether any XRSession that requires the use of spatial tracking may be returned by requestSession(), and whether support for session modes that require spatial tracking may be indicated by either isSessionSupported() or devicechange events on the navigator.xr object.

The feature identifier for this feature is "xr-spatial-tracking".

The default allowlist for this feature is ["self"].

Note: If the document’s origin is not allowed to use the "xr-spatial-tracking" permissions policy any immersive sessions will be blocked, because all immersive sessions require some use of spatial tracking. Inline sessions will still be allowed, but restricted to only using the "viewer" XRReferenceSpace.

14.2. Permissions API Integration
The [permissions] API provides a uniform way for websites to request permissions from users and query which permissions they have been granted.

The "xr" powerful feature’s permission-related algorithms and types are defined as follows:

permission descriptor type
dictionary XRPermissionDescriptor: PermissionDescriptor {
  XRSessionMode mode;
  sequence<DOMString> requiredFeatures;
  sequence<DOMString> optionalFeatures;
};
name for XRPermissionDescriptor is "xr".

permission result type
[Exposed=Window]
interface XRPermissionStatus: PermissionStatus {
  attribute FrozenArray<DOMString> granted;
};
permission query algorithm
To query the "xr" permission with an XRPermissionDescriptor descriptor and a XRPermissionStatus status, the UA MUST run the following steps:
Set status’s state to descriptor’s permission state.

If status’s state is "denied", set status’s granted to an empty FrozenArray and abort these steps.

Let result be the result of resolving the requested features given descriptor’s requiredFeatures, optionalFeatures, and mode.

If result is null, run the following steps:

Set status’s granted to an empty FrozenArray.

Set status’s state to "denied".

Abort these steps.

Let (consentRequired, consentOptional, granted) be the fields of result.

Set status’s granted to granted.

If consentRequired is empty and consentOptional is empty, set status’s state to "granted" and abort these steps

Set status’s state to "prompt".

permission request algorithm
To request the "xr" permission with an XRPermissionDescriptor descriptor and a XRPermissionStatus status, the UA MUST run the following steps:
Set status’s granted to an empty FrozenArray.

Let requiredFeatures be descriptor’s requiredFeatures.

Let optionalFeatures be descriptor’s optionalFeatures.

Let device be the result of obtaining the current device for mode, requiredFeatures, and optionalFeatures.

Let result be the result of resolving the requested features given requiredFeatures,optionalFeatures, and mode.

If result is null, run the following steps:

Set status’s state to "denied".

Abort these steps.

Let (consentRequired, consentOptional, granted) be the fields of result.

The user agent MAY at this point ask the user’s permission for the calling algorithm to use any of the features in consentRequired and consentOptional. The results of these prompts should be included when determining if there is a clear signal of user intent for enabling these features.

For each feature in consentRequired perform the following steps:

The user agent MAY at this point ask the user’s permission for the calling algorithm to use feature. The results of these prompts should be included when determining if there is a clear signal of user intent to enable feature.

If a clear signal of user intent to enable feature has not been determined, set status’s state to "denied" and abort these steps.

If feature is not in granted, append feature to granted.

For each feature in consentOptional perform the following steps:

The user agent MAY at this point ask the user’s permission for the calling algorithm to use feature. The results of these prompts should be included when determining if there is a clear signal of user intent to enable feature.

If a clear signal of user intent to enable feature has not been determined, continue to the next entry.

If feature is not in granted, append feature to granted.

Set status’s granted to granted.

Add all elements of granted to device’s set of granted features for mode.

Set status’s state to "granted".

Note: The user agent has the freedom to batch up permissions prompts for all requested features when gauging if there is a clear signal of user intent, but it is also allowed to show them one at a time.

Note: When determining user intent for a web application, user agents must check that it was explicitly launched by the user as a web application. They must NOT just check if the origin matches that of an installed web application.

To resolve the requested features given requiredFeatures and optionalFeatures for an XRSessionMode mode, the user agent MUST run the following steps:

Let consentRequired be an empty list of DOMString.

Let consentOptional be an empty list of DOMString.

Let granted be an empty list of DOMString.

Let device be the result of obtaining the current device for mode, requiredFeatures, and optionalFeatures.

Let previouslyEnabled be device’s set of granted features for mode.

If device is null or device’s list of supported modes does not contain mode, run the following steps:

Return the tuple (consentRequired, consentOptional, granted)

Add every feature descriptor in the default features table associated with mode to granted if it is not already present.

For each feature in requiredFeatures perform the following steps:

If the feature is null, continue to the next entry.

If feature is not a valid feature descriptor, return null.

If feature is already in granted, continue to the next entry.

If the requesting document’s origin is not allowed to use any permissions policy required by feature as indicated by the feature requirements table, return null.

If session’s XR device is not capable of supporting the functionality described by feature or the user agent has otherwise determined to reject the feature, return null.

If the functionality described by feature requires explicit consent and feature is not in previouslyEnabled, append it to consentRequired.

Else append feature to granted.

For each feature in optionalFeatures perform the following steps:

If the feature is null, continue to the next entry.

If feature is not a valid feature descriptor, continue to the next entry.

If feature is already in granted, continue to the next entry.

If the requesting document’s origin is not allowed to use any permissions policy required by feature as indicated by the feature requirements table, continue to the next entry.

If session’s XR device is not capable of supporting the functionality described by feature or the user agent has otherwise determined to reject the feature, continue to the next entry.

If the functionality described by feature requires explicit consent and feature is not in previouslyEnabled, append it to consentOptional.

Else append feature to granted.

Return the tuple (|consentRequired|, |consentOptional|, |granted|)

Changes
Changes from the Candidate Recommendation Snapshot, 31 March 2022
Expose XRSession’s granted features (GitHub #1296)

Add support for the isSystemKeyboardSupported attribute (GitHub #1314)

Clarify getPose behavior with visibile-blurred (GitHub #1332)

Transient intent addition (GitHub #1343)

First draft for adding a property to XRInputSource to say it’s visible elsewhere (GitHub #1353)

Clarify rgb vs srgb behavior (GitHub #1359)

Changes from the Working Draft 24 July 2020
Fixed up predictedDisplayTime and defined inline behavior (GitHub #1230)

Add XRFrame.predictedDisplayTime (GitHub #1217)

Add support for targetFrameRate and supportedFrameRates (GitHub #1201)

Add support for foveation (fixedFoveation (GitHub #1195)

Only allow sessions to use features they explicity request or are implicitly granted based on mode (GitHub #1189)

Enhance examples of implicit user intent (GitHub #1188)

Added support for angular and linear velocity (GitHub #1182)

Ensure platform conventions remain consistent for XRReferenceSpaces (GitHub #1180)

Inverted composition disabled flag to be composition enabled (GitHub #1172)

Reject promise returned from end() if session is already ended (GitHub #1170)

During requestAnimationFrame detect if session has ended (GitHub #1169)

Require quantization for recommendedViewportScale (GitHub #1151)

Make sessionsupported pref autogranting non-normative (GitHub #1146)

Added a definition of XR device that includes nonvisual usage (GitHub #927)

Incorporating conclusions of recent privacy discussions (GitHub #1124)

Switch isSessionSupported from using user intent to using permissions (GitHub #1136)

Clarify that minimum viewport scale may change (GitHub #1134)

Improvements to the fingerprinting PR (GitHub #1133)

Add requestViewportScale/recommendedViewportScale (GitHub #1132)

Clarify that framebuffer scale factors apply to width/height separately (GitHub #1131)

Ensure that pending render state is always applied (GitHub #1128)

Gate context XR compatability on xr-spatial-tracking permissions policy. (GitHub #1126)

Change timing of when updateRenderState changes apply (GitHub #1111)

Changes from the Working Draft 10 October 2019
New features:

Add feature for secondary views (GitHub #1083)

Update XRRenderStateInit with layers sequence (GitHub #999)

Split input sources into primary/auxiliary (GitHub #929)

Define squeeze events (GitHub #893)

Changes:

Primary views MUST always be active (GitHub #1105)

Correctly handle context loss in makeXRCompatible() (GitHub #1097)

Introduce concept of active view (GitHub #1096)

Fixup frame and viewport caching to be explicit (GitHub #1093)

Allow caching various objects (GitHub #1088)

Allow clamping framebufferScaleFactor (GitHub #1084)

Clarify threading nature of "ensure an immersive device is selected", deprecate xrCompatible (GitHub #1081)

Clarify some things about native origins (GitHub #1071)

Change document visibility check to be UA choice (GitHub #1067)

added \'check the layers state\' algorithm (GitHub #1064)

Various changes around null and emulated poses (GitHub #1058)

Mention correct input frame semantics on XRInputSource/frame (GitHub #1053)

Added validation for XRRigidTransform (GitHub #1043)

Minor change to when empty input profile arrays are appropriate. (GitHub #1037)

Allow trusted ui to use visible-blurred, cautioning against text input leakage (GitHub #1034)

Some clarifications about window.rAF() (GitHub #1033)

Cleanups on how we do tasks and promises (GitHub #1032)

Short circuit updateRenderState() if no render state is passed (GitHub #1031)

Removed use of responsible and active and focused documents (GitHub #1030)

Clarify situation around browsing contexts and realms in context isolation (GitHub #1029)

Explicitly specify that reset events work on offset spaces (GitHub #1024)

Made it explicit which realm each object gets created in (GitHub #1023)

Use current timestamp for rAF() callback arguments (GitHub #1015)

Session feature requests no longer need the session parameter (GitHub #1012)

Allow cancelling rAF callbacks from within rAF (GitHub #1005)

Mention that the opaque framebuffer holds a reference to a particular session (GitHub #1004)

Defer initial inputsourcechange event till after the promise resolves (GitHub #1002)

Documented the effects of the framebufferScaleFactor (GitHub #993)

Allow depth&&stencil result if depth||stencil requested (GitHub #987)

Allow more flexibility in what isSessionSupported returns (GitHub #986)

Clarify when tracking/input data is exposed via inline devices (GitHub #985)

Add common sense restrictions on viewport shape (GitHub #976)

Specify that preserveDrawingBuffer has no power here (GitHub #975)

Clarified the behavior of visiblityState for inline sessions (GitHub #974)

Defining when an opaque framebuffer is considered dirty (GitHub #970)

Potentially update the inline device when the device changes (GitHub #947)

Clarify bounded reference space behavior (GitHub #938)

Multiple fixes to XR compatibility algorithms (GitHub #921)

Fill out section on trusted UI (GitHub #875)

Better define how depthNear and depthFar are used (GitHub #888)

Clarify that emulatedPosition is not true when the local-floor space is using an estimated height (GitHub #871)

Changes from the First Public Working Draft 5 Feburary 2019
New features:

Added XRInputSource->profiles for list of input profile name (GitHub #695)

Add none variant to XREye (GitHub #641)

Add an explicit inline XR device (GitHub #737)

Pose privacy considerations with data adjustments and protected functionality (GitHub #761)

Reference space privacy considerations (GitHub #762)

Define sensitive information and user intent (GitHub #757)

Required and optional features (Feature dependencies) (GitHub #749)

Tracking loss and tracking recovery (GitHub #559)

Change blur/focus to visibilitychange (GitHub #687)

Define event order of input sources (GitHub #629)

Describe how the input source list is maintained (GitHub #628)

Make origin offset immutable (GitHub #612)

Add inlineVerticalFieldOfView to XRRenderState (GitHub #519)

Document Gamepad integration (GitHub #553)

Add ignoreDepthValues attribute to the XRWebGLLayer (GitHub #548)

Added XRSpace XREnvironmentBlendMode.viewerSpace (GitHub #522)

Added XRPose and related refactors to the spec (GitHub #496)

Removed features:

Changed canvas inline to single, drop XRPresentationContext (GitHub #656)

Remove XRLayer base type (GitHub #688)

Remove XRWebGLLayer.requestViewportScaling() (GitHub #631)

Remove context Attribute from XRWebGLLayer (GitHub #707)

Remove attribs that only reflect requested values (GitHub #574)

Remove XRSessionCreationOptions (GitHub #566)

Changes:

Decribe the required clear behavior of an XRWebGLLayer (GitHub #866)

Specified that XRWebGLLayer framebuffers always use premultiplied alpha (GitHub #840)

Clarify the transform direction for the reset event (GitHub #843)

Define how feature requirements are satisfied (GitHub #839)

Check whether a session is inline rather than immersive when appropriate (GitHub #834)

Disallow stereo inline sessions for now (GitHub #829)

Handle detached buffers in projectionMatrix (GitHub #830)

Ensure an immersive device is selected in makeXRCompatible() (GitHub #809)

Change features to a sequence of \'any\' (GitHub #807)

Link to \'fire an input source\' algorithm, explicitly construct frame (GitHub #797)

Remove Environment blend mode from spec and explainer (GitHub #804)

Provide descriptions for each method (GitHub #798)

Require UAs to show manual device activation steps (GitHub #799)

Clarify the compositor a bit (GitHub #805)

Clarify matrix math for obtaining matrices for rigid transforms (GitHub #806)

Allow UA to constrain clip planes (GitHub #802)

Forbid using stale XRViews in getViewport() (GitHub #796)

Explicitly mention how depth/alpha/stencil values get used (GitHub #800)

Fire input source events when profiles changes (GitHub #795)

Clarify when the reset event gets fired (GitHub #637)

Explicitly spec out when requestReferenceSpace() can reject queries (GitHub #651)

Make XRRay.matrix unique, add steps for obtaining it (GitHub #655)

Use TAG recommendations for returning promises (GitHub #700)

Move racy parts of requestSession() to the main thread (GitHub #706)

Clarify that small overlay UIs are allowed in exclusive access (GitHub #709)

Merge \'end the session\' with \'shut down the session\', clarify, add onend event (GitHub #710)

Don’t check XR compat flag for inline sessions (GitHub #705)

Validate position DOMPointInit (GitHub #568)

Explicitly spec out native origins (GitHub #621)

Remove buttonIndex (GitHub #741)

Removes references to "immersive-ar" and XRRay (GitHub #784)

Removes references to XRInputSource.gamepad from explainer and index.bs (GitHub #782)

getViewport with an invalid view throws an error (GitHub #771)

Block mid-session consent requests (GitHub #767)

Spec XRPresentationContext creation (GitHub #501)

Change inputSources getter from method to attrib (GitHub #624)

Change required gamepad index to -1 (GitHub #690)

Handle detached arrays (GitHub #684)

Require that sensitive UI hides WebXR content (GitHub #742)

Made the xr-standard gamepad mapping more rigid (GitHub #735)

Fix algorithm to compute XRRay.matrix (GitHub #728)

Fix detached array in XRRay.matrix algorithm (GitHub #716)

Simplify handling of unsupported modes in requestSession() (GitHub #714)

Some XRRenderState clarifications (GitHub #703)

Replace \'list of pending render states\' with \'pending render state\' (GitHub #701)

Better define gamepad placeholder buttons and axes (GitHub #661)

Clarify what value a touchpad should report when not being touched (GitHub #660)

Rename getPose arg referenceSpace->baseSpace (GitHub #659)

Fix multiplication order for transforms (GitHub #649)

Clarify assumptions for local and local-floor tracking (GitHub #648)

Simplify available spaces (GitHub #626)

requestSession: Check for user activation first (GitHub #685)

Make boundsGeometry work relative to the effective origin (GitHub #613)

Explicitly specify how the views array is populated (GitHub #614)

Identify cases where the Gamepad id should be unknown (GitHub #615)

Overhaul XRSpace, get(Viewer)Pose definitions (GitHub #609)

Rename supportsSessionMode to supportsSession (GitHub #595)

Consolidate reference space types and interfaces (GitHub #587)

inverse attribute always returns the same object (GitHub #586)

Reject outstanding promises on session shut down (GitHub #585)

Specify that projection matrices may include shear (GitHub #575)

Describe exceptions that updateRenderState may throw (GitHub #511)

Edit requestSession() and Initialize the session (GitHub #601)

Change XRRigidTransform inverse from a method to an attribute (GitHub #560)

Indicate when compositing is using depth values (GitHub #563)

Stationary subtype support is all-or-nothing (GitHub #537)

Move outputContext to XRRenderState (GitHub #536)

Specify that getViewerPose throws an error for non-rAF XRFrames (GitHub #535)

Remove viewMatrix and add XRTransform.inverse() (GitHub #531)

Changed XRHandedness enum to use \'none\' instead of \'\' (GitHub #526)

Indicate the preferred ergonomics of a tracked-pointer ray (GitHub #524)

Clarify XRRay constructor and define normalization (GitHub #521)

Spec text for the identity reference space (GitHub #520)

Clarified when immersive sessions are rejected (GitHub #360)

Specify that frame callbacks are not called without a base layer (GitHub #512)

15. Acknowledgements
Thank you to the following individuals for their contributions the WebXR Device API specification:

Chris Van Wiemeersch (Mozilla)

Kearwood Gilbert (Mozilla)

Rafael Cintron (Microsoft)

Sebastian Sylvan (Formerly Microsoft)

Alex Turner (Microsoft)

Lachlan Ford (Microsoft)

Blair MacIntyre (Mozilla)

John Pallett (Google)

Takahiro Aoyagi (Mozilla)

Nicholas Butko (8th Wall)

Artem Bolgar (Facebook, Inc.)

Chris Wilson (Google)

Alan Smithson (MetaVRse)

Josh Marinacci (Mozilla)

Loc Dao (National Film Board of Canada)

Ningxin Hu (Intel)

Jared Cheshier (PlutoVR)

Tony Hodgson (Brainwaive LLC)

Christopher P. La Torres (Exokit)

Alexis Menard (Intel Corporation)

Klaus Weidner (Google)

Alan Jeffrey (Mozilla)

Diane Hosfelt (Mozilla)

Kyungsuk (AT&T Xandr)

David Dorwin (Google)

Trevor F. Smith (Transmutable)

Ada Rose Cannon (Samsung)

Mounir Lamouri (Google)

Stewart Smith (Moar Technologies Corp)

Leonard Daly (Daly Realism)

And a special thanks to Vladimir Vukicevic (Unity) for kick-starting this whole adventure!

Conformance
Document conventions
Conformance requirements are expressed with a combination of descriptive assertions and RFC 2119 terminology. The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in the normative parts of this document are to be interpreted as described in RFC 2119. However, for readability, these words do not appear in all uppercase letters in this specification.

All of the text of this specification is normative except sections explicitly marked as non-normative, examples, and notes. [RFC2119]

Examples in this specification are introduced with the words “for example” or are set apart from the normative text with class="example", like this:

This is an example of an informative example.

Informative notes begin with the word “Note” and are set apart from the normative text with class="note", like this:

Note, this is an informative note.

Conformant Algorithms
Requirements phrased in the imperative as part of algorithms (such as "strip any leading space characters" or "return false and abort these steps") are to be interpreted with the meaning of the key word ("must", "should", "may", etc) used in introducing the algorithm.

Conformance requirements phrased as algorithms or specific steps can be implemented in any manner, so long as the end result is equivalent. In particular, the algorithms defined in this specification are intended to be easy to understand and are not intended to be performant. Implementers are encouraged to optimize.

Index
Terms defined by this specification
3DoF, in § 1.1
6DoF, in § 1.1
active
dfn for XRFrame, in § 5.1
dfn for view, in § 7.1
active immersive session, in § 3.2
active render state, in § 4.1
added
attribute for XRInputSourcesChangeEvent, in § 12.3
dict-member for XRInputSourcesChangeEventInit, in § 12.3
add input source, in § 4.1
alpha, in § 11.2
angularVelocity, in § 9.1
animation frame, in § 4.1
animationFrame, in § 5.1
animation frame callback identifier, in § 4.3
antialias
attribute for XRWebGLLayer, in § 11.2
dict-member for XRWebGLLayerInit, in § 11.2
apply frame updates, in § 5.1
apply the nominal frame rate, in § 4.1
apply the pending render state, in § 4.1
auxiliary action, in § 10.2
baseLayer
attribute for XRRenderState, in § 4.2
dict-member for XRRenderStateInit, in § 4.2
"bounded-floor", in § 6.2
bounded-floor, in § 6.2
bounded reference spaces are supported, in § 6.3
boundsGeometry, in § 6.3
cancelAnimationFrame(handle), in § 4.3
cancelled, in § 4.3
capable of supporting, in § 3.4
change input source, in § 4.1
check the layers state, in § 4.3
compatible graphics adapter, in § 11.3
composition enabled
dfn for XRRenderState, in § 4.2
dfn for XRWebGLLayer, in § 11.2
computed offset, in § 9.1
constructor(), in § 8.3
constructor(position), in § 8.3
constructor(position, orientation), in § 8.3
constructor(session, context), in § 11.2
constructor(session, context, layerInit), in § 11.2
constructor(type, eventInitDict)
constructor for XRInputSourceEvent, in § 12.2
constructor for XRInputSourcesChangeEvent, in § 12.3
constructor for XRReferenceSpaceEvent, in § 12.4
constructor for XRSessionEvent, in § 12.1
context
attribute for XRWebGLLayer, in § 11.2
dfn for XRWebGLLayer, in § 11.2
coordinate system, in § 6.1
create a reference space, in § 6.2
current viewport scale, in § 7.1
data adjustment, in § 13.4
default features, in § 3.4
default inline XR device, in § 2.1
depth, in § 11.2
depthFar
attribute for XRRenderState, in § 4.2
dict-member for XRRenderStateInit, in § 4.2
depthNear
attribute for XRRenderState, in § 4.2
dict-member for XRRenderStateInit, in § 4.2
devicechange, in § 12.5
display frame rate, in § 4.1
effective frame rate, in § 4.1
effective origin, in § 6.1
emulatedPosition, in § 9.1
enabledFeatures, in § 4.1
end, in § 12.5
end(), in § 4.1
ended, in § 4.1
ensure an immersive XR device is selected, in § 3.2
enumerate immersive XR devices, in § 3.2
estimated floor level, in § 6.2
exclusive access, in § 3.3
Explicit consent, in § 13.2.3
eye
attribute for XRView, in § 7.1
dfn for view, in § 7.1
feature descriptor, in § 3.4
feature requirements, in § 3.4
fire an input source event, in § 12.2
fixedFoveation, in § 11.2
frame
attribute for XRInputSourceEvent, in § 12.2
dfn for XRView, in § 7.1
dict-member for XRInputSourceEventInit, in § 12.2
framebuffer, in § 11.2
framebufferHeight, in § 11.2
framebufferScaleFactor, in § 11.2
framebufferWidth, in § 11.2
frameRate, in § 4.1
frameratechange, in § 12.5
frame update, in § 5.1
"gaze", in § 10.1
gaze, in § 10.1
getNativeFramebufferScaleFactor(session), in § 11.2
getOffsetReferenceSpace(originOffset), in § 6.2
getPose(space, baseSpace), in § 5.1
getViewerPose(referenceSpace), in § 5.1
getViewport(view), in § 11.2
granted, in § 14.2
gripSpace, in § 10.1
handedness, in § 10.1
height, in § 7.3
"hidden", in § 4.1
hidden, in § 4.1
identity transform, in § 8.3
ignoreDepthValues
attribute for XRWebGLLayer, in § 11.2
dict-member for XRWebGLLayerInit, in § 11.2
"immersive-ar", in § 3.3
immersive-ar, in § 3.3
immersive session, in § 3.3
immersive session request is allowed, in § 13.5.1
"immersive-vr", in § 3.3
immersive-vr, in § 3.3
immersive XR device, in § 2.1
Implicit consent, in § 13.2.3
indexed property getter, in § 10.3
indistinguishable by user agent string, in § 13.8.2
initialize the render state, in § 4.2
initialize the session, in § 4.1
"inline", in § 3.3
inline, in § 3.3
inline session, in § 3.3
inline session request is allowed, in § 13.5.1
inlineVerticalFieldOfView
attribute for XRRenderState, in § 4.2
dict-member for XRRenderStateInit, in § 4.2
inline XR device, in § 2.1
input profile name, in § 10.1
inputSource
attribute for XRInputSourceEvent, in § 12.2
dict-member for XRInputSourceEventInit, in § 12.2
inputSources, in § 4.1
inputsourceschange, in § 12.5
internal matrix, in § 8.3
internal nominal frameRate, in § 4.1
internal projection matrix, in § 7.1
internal target frameRate, in § 4.1
inverse, in § 8.3
isSessionSupported(mode), in § 3.2
isSystemKeyboardSupported, in § 4.1
launching a web application, in § 13.2.2
layers, in § 4.2
"left"
enum-value for XREye, in § 7.1
enum-value for XRHandedness, in § 10.1
length, in § 10.3
Limiting, in § 13.4.3
linearVelocity, in § 9.1
list of active XR input sources, in § 4.1
list of active XR tracked sources, in § 4.1
list of animation frame callbacks, in § 4.3
list of currently running animation frame callbacks, in § 4.3
list of frame updates, in § 5.1
list of full-sized viewports, in § 11.2
list of immersive XR devices, in § 2.1
list of inline sessions, in § 3.2
list of supported modes, in § 2.1
list of viewport objects, in § 11.2
list of views, in § 4.1
"local", in § 6.2
local, in § 6.2
"local-floor", in § 6.2
local-floor, in § 6.2
makeXRCompatible(), in § 11.3
matrix
attribute for XRRigidTransform, in § 8.3
definition of, in § 8.1
maximum far clip plane, in § 4.1
maximum inline field of view, in § 4.1
minimum inline field of view, in § 4.1
minimum near clip plane, in § 4.1
mode
dfn for XRSession, in § 4.1
dict-member for XRPermissionDescriptor, in § 14.2
dict-member for XRSessionSupportedPermissionDescriptor, in § 13.8.1
multiply transforms, in § 8.3
native bounds geometry, in § 6.3
native origin, in § 6.1
native WebGL framebuffer resolution, in § 11.2
never support, in § 13.8.2
nominal frame rate, in § 4.1
"none"
enum-value for XREye, in § 7.1
enum-value for XRHandedness, in § 10.1
normalize, in § 8.2
obtain a scaled viewport, in § 7.1
obtain the current device, in § 3.2
obtain the matrix, in § 8.3
obtain the projection matrix, in § 7.1
ondevicechange, in § 3.2
onend, in § 4.1
onframeratechange, in § 4.1
oninputsourceschange, in § 4.1
onreset, in § 6.2
onselect, in § 4.1
onselectend, in § 4.1
onselectstart, in § 4.1
onsqueeze, in § 4.1
onsqueezeend, in § 4.1
onsqueezestart, in § 4.1
onvisibilitychange, in § 4.1
opaque framebuffer, in § 11.2
Optional features, in § 3.4
optionalFeatures
dict-member for XRPermissionDescriptor, in § 14.2
dict-member for XRSessionInit, in § 3.4
orientation, in § 8.3
origin offset, in § 6.1
output canvas, in § 4.2
pending immersive session, in § 3.2
pending render state, in § 4.1
populate the pose, in § 6.1
poses may be reported, in § 13.5.2
poses must be limited, in § 13.5.3
position, in § 8.3
predictedDisplayTime, in § 5.1
primary action, in § 10.1
primary input source, in § 10.1
primary squeeze action, in § 10.1
primary view, in § 7.2
profiles, in § 10.1
projection matrix, in § 7.1
projectionMatrix, in § 7.1
promise resolved, in § 4.1
Quantization, in § 13.4.2
recommendedViewportScale, in § 7.1
recommended WebGL framebuffer resolution, in § 11.2
referenceSpace
attribute for XRReferenceSpaceEvent, in § 12.4
dict-member for XRReferenceSpaceEventInit, in § 12.4
reference space is supported, in § 6.2
removed
attribute for XRInputSourcesChangeEvent, in § 12.3
dict-member for XRInputSourcesChangeEventInit, in § 12.3
remove input source, in § 4.1
renderState, in § 4.1
requestAnimationFrame(callback), in § 4.3
requested features, in § 3.4
requested viewport scale, in § 7.1
requestReferenceSpace(type), in § 4.1
requestSession(mode), in § 3.2
requestSession(mode, options), in § 3.2
request the xr permission, in § 14.2
requestViewportScale(scale), in § 7.1
required features, in § 3.4
requiredFeatures
dict-member for XRPermissionDescriptor, in § 14.2
dict-member for XRSessionInit, in § 3.4
reset, in § 12.5
resolve the requested features, in § 14.2
"right"
enum-value for XREye, in § 7.1
enum-value for XRHandedness, in § 10.1
Rounding, in § 13.4.2
"screen", in § 10.1
screen, in § 10.1
secondary view, in § 7.2
secondary-views, in § 7.2
select, in § 12.5
select an immersive XR device, in § 3.2
selectend, in § 12.5
selectstart, in § 12.5
sensitive information, in § 13.1
session
attribute for XRFrame, in § 5.1
attribute for XRInputSourcesChangeEvent, in § 12.3
attribute for XRSessionEvent, in § 12.1
dfn for XRSpace, in § 6.1
dfn for XRView, in § 7.1
dfn for XRWebGLLayer, in § 11.2
dfn for opaque framebuffer, in § 11.2
dict-member for XRInputSourcesChangeEventInit, in § 12.3
dict-member for XRSessionEventInit, in § 12.1
set of granted features
dfn for XR device, in § 2.1
dfn for XRSession, in § 4.1
should be rendered, in § 4.3
SHOULD NOT initialize device tracking, in § 4.1
shut down the session, in § 4.1
skipRendering, in § 10.1
squeeze, in § 12.5
squeezeend, in § 12.5
squeezestart, in § 12.5
stencil, in § 11.2
supportedFrameRates, in § 4.1
target framebuffer, in § 11.2
target frame rate, in § 4.1
targetRayMode, in § 10.1
targetRaySpace, in § 10.1
Throttling, in § 13.4.1
time, in § 5.1
tracked input source, in § 10.1
"tracked-pointer", in § 10.1
tracked-pointer, in § 10.1
trackedSources, in § 4.1
trackedsourceschange, in § 12.5
transform
attribute for XRPose, in § 9.1
attribute for XRReferenceSpaceEvent, in § 12.4
attribute for XRView, in § 7.1
dict-member for XRReferenceSpaceEventInit, in § 12.4
transient action, in § 10.2
transient input sources, in § 10.2
"transient-pointer", in § 10.1
transient-pointer, in § 10.1
trusted immersive UI, in § 13.6
Trusted UI, in § 13.6
type, in § 6.2
"unbounded", in § 6.2
unbounded, in § 6.2
underlying view, in § 7.1
updateRenderState(), in § 4.1
updateRenderState(newState), in § 4.1
updateRenderState(state), in § 4.1
updateTargetFrameRate(rate), in § 4.1
update the pending layers state, in § 4.1
update the viewports, in § 7.1
User intent, in § 13.2
usually support, in § 13.8.2
view, in § 7.1
"viewer", in § 6.2
viewer
definition of, in § 9.2
enum-value for XRReferenceSpaceType, in § 6.2
viewer reference space, in § 4.1
view offset, in § 7.1
viewport modifiable, in § 7.1
views, in § 9.2
visibilitychange, in § 12.5
visibility state, in § 4.1
visibilityState, in § 4.1
"visible", in § 4.1
visible, in § 4.1
"visible-blurred", in § 4.1
visible-blurred, in § 4.1
width, in § 7.3
x, in § 7.3
"xr", in § 14.2
xr, in § 3.1
XR animation frame, in § 4.3
XRBoundedReferenceSpace, in § 6.3
XR compatible, in § 11.3
xrCompatible, in § 11.3
XR Compositor, in § 4.4
XR device
dfn for , in § 2.1
dfn for XRSession, in § 4.1
XREye, in § 7.1
XRFrame, in § 5.1
XRFrameRequestCallback, in § 4.3
XRHandedness, in § 10.1
XR input source, in § 10.1
XRInputSource, in § 10.1
XRInputSourceArray, in § 10.3
XRInputSourceEvent, in § 12.2
XRInputSourceEventInit, in § 12.2
XRInputSourceEvent(type, eventInitDict), in § 12.2
XRInputSourcesChangeEvent, in § 12.3
XRInputSourcesChangeEventInit, in § 12.3
XRInputSourcesChangeEvent(type, eventInitDict), in § 12.3
XRLayer, in § 11.1
XRPermissionDescriptor, in § 14.2
XRPermissionStatus, in § 14.2
XRPose, in § 9.1
XRReferenceSpace, in § 6.2
XRReferenceSpaceEvent, in § 12.4
XRReferenceSpaceEventInit, in § 12.4
XRReferenceSpaceEvent(type, eventInitDict), in § 12.4
XRReferenceSpaceType, in § 6.2
XRRenderState, in § 4.2
XRRenderStateInit, in § 4.2
XRRigidTransform, in § 8.3
XRRigidTransform(), in § 8.3
XRRigidTransform(position), in § 8.3
XRRigidTransform(position, orientation), in § 8.3
XRSession, in § 4.1
XRSessionEvent, in § 12.1
XRSessionEventInit, in § 12.1
XRSessionEvent(type, eventInitDict), in § 12.1
XRSessionInit, in § 3.4
XRSessionMode, in § 3.3
"xr-session-supported", in § 13.8.1
XRSessionSupportedPermissionDescriptor, in § 13.8.1
XRSpace, in § 6.1
XRSystem, in § 3.2
XRTargetRayMode, in § 10.1
XR task source, in § 12
XRView, in § 7.1
XRViewerPose, in § 9.2
XRViewport, in § 7.3
XRVisibilityState, in § 4.1
XRWebGLLayer, in § 11.2
XRWebGLLayerInit, in § 11.2
XRWebGLLayer(session, context), in § 11.2
XRWebGLLayer(session, context, layerInit), in § 11.2
XRWebGLRenderingContext, in § 11.2
y, in § 7.3
Terms defined by reference
[DOM] defines the following terms:
Document
Event
EventInit
EventTarget
ancestor
canceled flag
descendant
dispatch
fire an event
type
[ECMASCRIPT] defines the following terms:
IsDetachedBuffer
realm
[GEOMETRY-1] defines the following terms:
DOMMatrix
DOMPointInit
DOMPointReadOnly
w
x
y
z
[HIGH RESOLUTION TIME] defines the following terms:
DOMHighResTimeStamp
[HR-TIME-3] defines the following terms:
current high resolution time
[HTML] defines the following terms:
EventHandler
HTMLCanvasElement
Navigator
Window
active document
appVersion
browsing context
current global object
current realm
currently focused area
event handler idl attribute
focus
in parallel
navigator
origin
permissions policy
queue a task
relevant global object
relevant realm
rendering opportunity
requestAnimationFrame(callback)
same origin
same origin-domain
task source
transient activation
userAgent
visibilitystate
[INFRA] defines the following terms:
append
contain
continue
extend
is empty
list
remove
set
size
string
tuple
[ORIENTATION SENSOR] defines the following terms:
AbsoluteOrientationSensor
RelativeOrientationSensor
[PERMISSIONS] defines the following terms:
PermissionDescriptor
PermissionStatus
denied
granted
name
permission descriptor type
permission query algorithm
permission result type
permission state
powerful feature
prompt
request permission to use
state
[PERMISSIONS-POLICY-1] defines the following terms:
default allowlist
policy-controlled feature
[POINTEREVENTS] defines the following terms:
primary pointer
[REQUESTIDLECALLBACK] defines the following terms:
requestIdleCallback()
[WEBGL 2.0] defines the following terms:
SRGB8
SRGB8_ALPHA8
WebGL2RenderingContext
[WEBGL-2] defines the following terms:
FRAMEBUFFER_UNSUPPORTED
INVALID_FRAMEBUFFER_OPERATION
INVALID_OPERATION
RGB
RGBA
WebGLContextAttributes
WebGLFramebuffer
WebGLObject
WebGLRenderingContext
WebGLRenderingContextBase
actual context parameters
canvas
checkFramebufferStatus
clear
create a drawing buffer
create the webgl context
default framebuffer
deleteFramebuffer
drawArrays
drawElements
fire a webgl context event
framebufferRenderbuffer
framebufferTexture2D
getFramebufferAttachmentParameter
handle the context loss
invalidated
restore the context
statusMessage
uniformMatrix4fv
webgl context lost flag
webgl context lost flag (for WebGLRenderingContext)
webgl task source
webgl viewport
[WEBIDL] defines the following terms:
AbortError
DOMException
DOMString
Exposed
Float32Array
FrozenArray
InvalidStateError
NewObject
NotSupportedError
OperationError
Promise
SameObject
SecureContext
SecurityError
TypeError
a new promise
boolean
double
float
frozen array type
indexed property getter
invoke the web idl callback function
long
new
reject
resolve
sequence
this
undefined
unsigned long
[WEBXR-AR-MODULE-1] defines the following terms:
first-person observer view
[WEBXRLAYERS-1] defines the following terms:
colorFormat
layers
References
Normative References
[DOM]
Anne van Kesteren. DOM Standard. Living Standard. URL: https://dom.spec.whatwg.org/
[ECMASCRIPT]
ECMAScript Language Specification. URL: https://tc39.es/ecma262/multipage/
[GEOMETRY-1]
Simon Pieters; Chris Harrelson. Geometry Interfaces Module Level 1. 4 December 2018. CR. URL: https://www.w3.org/TR/geometry-1/
[HR-TIME-3]
Yoav Weiss. High Resolution Time. 19 July 2023. WD. URL: https://www.w3.org/TR/hr-time-3/
[HTML]
Anne van Kesteren; et al. HTML Standard. Living Standard. URL: https://html.spec.whatwg.org/multipage/
[INFRA]
Anne van Kesteren; Domenic Denicola. Infra Standard. Living Standard. URL: https://infra.spec.whatwg.org/
[PERMISSIONS]
Marcos Caceres; Mike Taylor. Permissions. 19 March 2024. WD. URL: https://www.w3.org/TR/permissions/
[PERMISSIONS-POLICY-1]
Ian Clelland. Permissions Policy. 25 September 2024. WD. URL: https://www.w3.org/TR/permissions-policy-1/
[POINTEREVENTS]
Jacob Rossi; Matt Brubeck. Pointer Events. 4 April 2019. REC. URL: https://www.w3.org/TR/pointerevents/
[POINTERLOCK]
Vincent Scheib. Pointer Lock. 27 October 2016. REC. URL: https://www.w3.org/TR/pointerlock/
[REQUESTIDLECALLBACK]
Ross McIlroy; Ilya Grigorik. requestIdleCallback() Cooperative Scheduling of Background Tasks. 28 June 2022. WD. URL: https://www.w3.org/TR/requestidlecallback/
[RFC2119]
S. Bradner. Key words for use in RFCs to Indicate Requirement Levels. March 1997. Best Current Practice. URL: https://datatracker.ietf.org/doc/html/rfc2119
[WEBGL-2]
Dean Jackson; Jeff Gilbert. WebGL 2.0 Specification. 12 August 2017. URL: https://www.khronos.org/registry/webgl/specs/latest/2.0/
[WEBIDL]
Edgar Chen; Timothy Gu. Web IDL Standard. Living Standard. URL: https://webidl.spec.whatwg.org/
[WEBXRLAYERS-1]
Rik Cabanier. WebXR Layers API Level 1. 10 May 2024. WD. URL: https://www.w3.org/TR/webxrlayers-1/
Informative References
[DEVICE-ORIENTATION]
Reilly Grant; Raphael Kubo da Costa; Marcos Caceres. Device Orientation and Motion. 14 May 2024. WD. URL: https://www.w3.org/TR/orientation-event/
[WEBXR-AR-MODULE-1]
Brandon Jones; Manish Goregaokar; Rik Cabanier. WebXR Augmented Reality Module - Level 1. 2 November 2022. CR. URL: https://www.w3.org/TR/webxr-ar-module-1/
IDL Index
partial interface Navigator {
  [SecureContext, SameObject] readonly attribute XRSystem xr;
};

[SecureContext, Exposed=Window] interface XRSystem : EventTarget {
  // Methods
  Promise<boolean> isSessionSupported(XRSessionMode mode);
  [NewObject] Promise<XRSession> requestSession(XRSessionMode mode, optional XRSessionInit options = {});

  // Events
  attribute EventHandler ondevicechange;
};

enum XRSessionMode {
  "inline",
  "immersive-vr",
  "immersive-ar"
};

dictionary XRSessionInit {
  sequence<DOMString> requiredFeatures;
  sequence<DOMString> optionalFeatures;
};

enum XRVisibilityState {
  "visible",
  "visible-blurred",
  "hidden",
};

[SecureContext, Exposed=Window] interface XRSession : EventTarget {
  // Attributes
  readonly attribute XRVisibilityState visibilityState;
  readonly attribute float? frameRate;
  readonly attribute Float32Array? supportedFrameRates;
  [SameObject] readonly attribute XRRenderState renderState;
  [SameObject] readonly attribute XRInputSourceArray inputSources;
  [SameObject] readonly attribute XRInputSourceArray trackedSources;
  readonly attribute FrozenArray<DOMString> enabledFeatures;
  readonly attribute boolean isSystemKeyboardSupported;

  // Methods
  undefined updateRenderState(optional XRRenderStateInit state = {});
  Promise<undefined> updateTargetFrameRate(float rate);
  [NewObject] Promise<XRReferenceSpace> requestReferenceSpace(XRReferenceSpaceType type);

  unsigned long requestAnimationFrame(XRFrameRequestCallback callback);
  undefined cancelAnimationFrame(unsigned long handle);

  Promise<undefined> end();

  // Events
  attribute EventHandler onend;
  attribute EventHandler oninputsourceschange;
  attribute EventHandler onselect;
  attribute EventHandler onselectstart;
  attribute EventHandler onselectend;
  attribute EventHandler onsqueeze;
  attribute EventHandler onsqueezestart;
  attribute EventHandler onsqueezeend;
  attribute EventHandler onvisibilitychange;
  attribute EventHandler onframeratechange;
};

dictionary XRRenderStateInit {
  double depthNear;
  double depthFar;
  double inlineVerticalFieldOfView;
  XRWebGLLayer? baseLayer;
  sequence<XRLayer>? layers;
};

[SecureContext, Exposed=Window] interface XRRenderState {
  readonly attribute double depthNear;
  readonly attribute double depthFar;
  readonly attribute double? inlineVerticalFieldOfView;
  readonly attribute XRWebGLLayer? baseLayer;
};

callback XRFrameRequestCallback = undefined (DOMHighResTimeStamp time, XRFrame frame);

[SecureContext, Exposed=Window] interface XRFrame {
  [SameObject] readonly attribute XRSession session;
  readonly attribute DOMHighResTimeStamp predictedDisplayTime;

  XRViewerPose? getViewerPose(XRReferenceSpace referenceSpace);
  XRPose? getPose(XRSpace space, XRSpace baseSpace);
};

[SecureContext, Exposed=Window] interface XRSpace : EventTarget {

};

enum XRReferenceSpaceType {
  "viewer",
  "local",
  "local-floor",
  "bounded-floor",
  "unbounded"
};

[SecureContext, Exposed=Window]
interface XRReferenceSpace : XRSpace {
  [NewObject] XRReferenceSpace getOffsetReferenceSpace(XRRigidTransform originOffset);

  attribute EventHandler onreset;
};

[SecureContext, Exposed=Window]
interface XRBoundedReferenceSpace : XRReferenceSpace {
  readonly attribute FrozenArray<DOMPointReadOnly> boundsGeometry;
};

enum XREye {
  "none",
  "left",
  "right"
};

[SecureContext, Exposed=Window] interface XRView {
  readonly attribute XREye eye;
  readonly attribute Float32Array projectionMatrix;
  [SameObject] readonly attribute XRRigidTransform transform;
  readonly attribute double? recommendedViewportScale;

  undefined requestViewportScale(double? scale);
};

[SecureContext, Exposed=Window] interface XRViewport {
  readonly attribute long x;
  readonly attribute long y;
  readonly attribute long width;
  readonly attribute long height;
};

[SecureContext, Exposed=Window]
interface XRRigidTransform {
  constructor(optional DOMPointInit position = {}, optional DOMPointInit orientation = {});
  [SameObject] readonly attribute DOMPointReadOnly position;
  [SameObject] readonly attribute DOMPointReadOnly orientation;
  readonly attribute Float32Array matrix;
  [SameObject] readonly attribute XRRigidTransform inverse;
};

[SecureContext, Exposed=Window] interface XRPose {
  [SameObject] readonly attribute XRRigidTransform transform;
  [SameObject] readonly attribute DOMPointReadOnly? linearVelocity;
  [SameObject] readonly attribute DOMPointReadOnly? angularVelocity;

  readonly attribute boolean emulatedPosition;
};

[SecureContext, Exposed=Window] interface XRViewerPose : XRPose {
  [SameObject] readonly attribute FrozenArray<XRView> views;
};

enum XRHandedness {
  "none",
  "left",
  "right"
};

enum XRTargetRayMode {
  "gaze",
  "tracked-pointer",
  "screen",
  "transient-pointer"
};

[SecureContext, Exposed=Window]
interface XRInputSource {
  readonly attribute XRHandedness handedness;
  readonly attribute XRTargetRayMode targetRayMode;
  [SameObject] readonly attribute XRSpace targetRaySpace;
  [SameObject] readonly attribute XRSpace? gripSpace;
  [SameObject] readonly attribute FrozenArray<DOMString> profiles;
  readonly attribute boolean skipRendering;
};

[SecureContext, Exposed=Window]
interface XRInputSourceArray {
  iterable<XRInputSource>;
  readonly attribute unsigned long length;
  getter XRInputSource(unsigned long index);
};

[SecureContext, Exposed=Window]
interface XRLayer : EventTarget {};


typedef (WebGLRenderingContext or
         WebGL2RenderingContext) XRWebGLRenderingContext;

dictionary XRWebGLLayerInit {
  boolean antialias = true;
  boolean depth = true;
  boolean stencil = false;
  boolean alpha = true;
  boolean ignoreDepthValues = false;
  double framebufferScaleFactor = 1.0;
};

[SecureContext, Exposed=Window]
interface XRWebGLLayer: XRLayer {
  constructor(XRSession session,
             XRWebGLRenderingContext context,
             optional XRWebGLLayerInit layerInit = {});
  // Attributes
  readonly attribute boolean antialias;
  readonly attribute boolean ignoreDepthValues;
  attribute float? fixedFoveation;

  [SameObject] readonly attribute WebGLFramebuffer? framebuffer;
  readonly attribute unsigned long framebufferWidth;
  readonly attribute unsigned long framebufferHeight;

  // Methods
  XRViewport? getViewport(XRView view);

  // Static Methods
  static double getNativeFramebufferScaleFactor(XRSession session);
};

partial dictionary WebGLContextAttributes {
    boolean xrCompatible = false;
};

partial interface mixin WebGLRenderingContextBase {
    [NewObject] Promise<undefined> makeXRCompatible();
};

[SecureContext, Exposed=Window]
interface XRSessionEvent : Event {
  constructor(DOMString type, XRSessionEventInit eventInitDict);
  [SameObject] readonly attribute XRSession session;
};

dictionary XRSessionEventInit : EventInit {
  required XRSession session;
};

[SecureContext, Exposed=Window]
interface XRInputSourceEvent : Event {
  constructor(DOMString type, XRInputSourceEventInit eventInitDict);
  [SameObject] readonly attribute XRFrame frame;
  [SameObject] readonly attribute XRInputSource inputSource;
};

dictionary XRInputSourceEventInit : EventInit {
  required XRFrame frame;
  required XRInputSource inputSource;
};

[SecureContext, Exposed=Window]
interface XRInputSourcesChangeEvent : Event {
  constructor(DOMString type, XRInputSourcesChangeEventInit eventInitDict);
  [SameObject] readonly attribute XRSession session;
  [SameObject] readonly attribute FrozenArray<XRInputSource> added;
  [SameObject] readonly attribute FrozenArray<XRInputSource> removed;
};

dictionary XRInputSourcesChangeEventInit : EventInit {
  required XRSession session;
  required sequence<XRInputSource> added;
  required sequence<XRInputSource> removed;

};

[SecureContext, Exposed=Window]
interface XRReferenceSpaceEvent : Event {
  constructor(DOMString type, XRReferenceSpaceEventInit eventInitDict);
  [SameObject] readonly attribute XRReferenceSpace referenceSpace;
  [SameObject] readonly attribute XRRigidTransform? transform;
};

dictionary XRReferenceSpaceEventInit : EventInit {
  required XRReferenceSpace referenceSpace;
  XRRigidTransform? transform = null;
};

dictionary XRSessionSupportedPermissionDescriptor: PermissionDescriptor {
  XRSessionMode mode;
};

dictionary XRPermissionDescriptor: PermissionDescriptor {
  XRSessionMode mode;
  sequence<DOMString> requiredFeatures;
  sequence<DOMString> optionalFeatures;
};

[Exposed=Window]
interface XRPermissionStatus: PermissionStatus {
  attribute FrozenArray<DOMString> granted;
};