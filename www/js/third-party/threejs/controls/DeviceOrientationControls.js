// www\js\third-party\threejs\controls\DeviceOrientationControls.js
/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function ( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );
	if ( typeof socket !== 'undefined' ) {
		socket.emit('client-log', '[DEBUG] DeviceOrientationControls: Constructor called. Object rotation reordered.');
	}

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	var onDeviceOrientationChangeEvent = function ( event ) {

		scope.deviceOrientation = event;
		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: onDeviceOrientationChangeEvent: ' + JSON.stringify(event));
		}

	};

	var onScreenOrientationChangeEvent = function () {

		scope.screenOrientation = window.orientation || 0;
		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: onScreenOrientationChangeEvent: orientation=' + (window.orientation || 0));
		}

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis
		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: setObjectQuaternion: q1 initialized: ' + JSON.stringify(q1));
		}

		return function ( quaternion, alpha, beta, gamma, orient ) {

			if ( typeof socket !== 'undefined' ) {
				socket.emit('client-log', '[DEBUG] DeviceOrientationControls: setObjectQuaternion called with alpha=' + alpha + ', beta=' + beta + ', gamma=' + gamma + ', orient=' + orient);
			}
			euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us
			if ( typeof socket !== 'undefined' ) {
				socket.emit('client-log', '[DEBUG] DeviceOrientationControls: Euler set to: ' + JSON.stringify(euler));
			}
			quaternion.setFromEuler( euler );                               // orient the device
			if ( typeof socket !== 'undefined' ) {
				socket.emit('client-log', '[DEBUG] DeviceOrientationControls: Quaternion after setFromEuler: ' + JSON.stringify(quaternion));
			}
			quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top
			if ( typeof socket !== 'undefined' ) {
				socket.emit('client-log', '[DEBUG] DeviceOrientationControls: Quaternion after multiply q1: ' + JSON.stringify(quaternion));
			}
			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation
			if ( typeof socket !== 'undefined' ) {
				socket.emit('client-log', '[DEBUG] DeviceOrientationControls: Quaternion after multiply q0: ' + JSON.stringify(quaternion));
			}

		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load
		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: onScreenOrientationChangeEvent executed in connect.');
		}

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;
		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: connect called. Event listeners added.');
		}

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;
		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: disconnect called. Event listeners removed.');
		}

	};

	this.update = function () {

		if ( scope.enabled === false ) return;

		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: update called.');
		}
		var alpha  = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) : 0; // Z
		var beta   = scope.deviceOrientation.beta  ? THREE.Math.degToRad( scope.deviceOrientation.beta  ) : 0; // X'
		var gamma  = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation       ? THREE.Math.degToRad( scope.screenOrientation       ) : 0; // O

		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: update: computed angles: alpha=' + alpha + ', beta=' + beta + ', gamma=' + gamma + ', orient=' + orient);
		}

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
		if ( typeof socket !== 'undefined' ) {
			socket.emit('client-log', '[DEBUG] DeviceOrientationControls: update: final quaternion: ' + JSON.stringify(scope.object.quaternion));
		}

	};

	this.connect();

};
