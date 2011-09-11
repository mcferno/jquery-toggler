/**
 * jQuery Toggler plugin.
 * @author Patrick McFern <mcferno AT gmail.com>
 *
 * Allows DOM elements to be toggled on and off following a keyboard sequence 
 * of a single or a set of key strokes.
 *
 * Invoked with default settings:
 *   $('selection criteria').toggle();
 *
 * Invoked with optional parameters:
 *   $('selection criteria').toggle({ option: value });
 *
 * Optional Parameters
 *
 *   - keyCode : the keyCode(s) which triggers the toggling on and off
 *       Can be a number, or an array of keyCodes (forming a sequence)
 *
 *   - duration : the number of milliseconds in which the key code sequence
 *       must be completed. Irrelevant for single key code sequences.
 *
 *   - toggleOn : callback function to trigger when the Object has been toggled on.
 *
 *   - toggleOff : callback function to trigger when the Object has been toggled off.
 *
 *   - toggled : boolean value indicating whether or not the Object is currently 
 *       toggled on. 
 *
 * defaults = {
 *   keyCode  : [192, 192], // Double `
 *   duration : 2000, // 2 seconds
 *   toggled  : object.is(':visible')
 *   toggleOn : object.slideDown();
 *   toggleOff: object.slideUp();
 * }
 */
Toggler = {};

(function($) {

/**
 * Attaches itself to the jQuery object, configuring all settings
 */
Toggler.init = function(options) {
	var settings = options || {}, object = this;
	
	switch(typeof settings.keyCode) {
		// keyCode is a number, compose it into an Array
		case 'number' :
			settings.keyCode = [ settings.keyCode ];
			break;
			
		// intentionally do nothing, keeping keyCode as provided
		case 'object':
			break;
			
		// assign a default keyCode (double `)
		default:
			settings.keyCode = [ 192, 192 ];
	}
		
	// duration in milliseconds by which the key/key-combo must be pressed
	// irrelevant for single key press toggles
	settings.duration = settings.duration || 2000;
	
	// register callbacks for the toggle On & Off events
	settings.toggleOn = settings.toggleOn || Toggler.toggleOn;
	settings.toggleOff = settings.toggleOff || Toggler.toggleOff;
	
	switch(typeof settings.toggled) {
		case 'number' :
			settings.toggled = Boolean(settings.toggled);
			break;
			
		// intentionally do nothing, keeping toggled as provided
		case 'boolean':
			break;
		
		default:
			// use DOM visibilty as a default value
			settings.toggled = object.is(':visible');
	}
	
	// persist configurations
	object.toggler = settings;
	
	// clear sequence variables
	Toggler.reset(object);
	
	$(window).bind('keyup',function(event) {
		Toggler.keyup(event,object);
	});
}

/**
 * Key press callback function. Matches the keypress to the sequence in order to
 * record its progression.
 *
 * {Event object} event Key press event to match to the sequence
 * {jQuery obj} obj Object we'll act on if a sequence is completed
 */
Toggler.keyup = function(event, obj) {
		
	// hit on a key sequence
	if(event.keyCode === obj.toggler.keyCode[obj.toggler.seq]) {
		
		// sequence is multi-keyed
		if(obj.toggler.keyCode.length > 0) {
			var now = new Date().valueOf(); // current timestamp
			
			// if timer has passed, reset before considering the sequence
			if(now - obj.toggler.timer > obj.toggler.duration) {
				Toggler.reset(obj);
			}

			// if first part of sequence, set the timeout tracker
			if(obj.toggler.seq === 0) {
				obj.toggler.timer = new Date().valueOf();
			}
			
			obj.toggler.seq++;
		}
		
		// verify if we've completed a sequence
		if(obj.toggler.seq == obj.toggler.keyCode.length) {
			if(obj.toggler.toggled) {
				obj.toggler.toggled = false;
				obj.toggler.toggleOff(obj);
			} else {
				obj.toggler.toggled = true;
				obj.toggler.toggleOn(obj);
			}
			Toggler.reset(obj);
		}
	
	// key doesn't match current pattern
	} else if(obj.toggler.seq > 0) {
		Toggler.reset(obj);
	}
}

/**
 * Resets the sequence tracking on an object
 *
 * {jQuery object} obj
 */
Toggler.reset = function(obj) {
	obj.toggler.seq = 0; // the iterator over the current key sequence match
	obj.toggler.timer = 0; // timestamp of the beginning of the sequence
}

/**
 * Default callback for toggling on.
 *
 * {jQuery object} obj
 */
Toggler.toggleOn = function(obj) {
	obj.toggler.toggled = true;
	obj.slideDown();
}

/**
 * Default callback for toggling off.
 *
 * {jQuery object} obj
 */
Toggler.toggleOff = function(obj) {
	obj.toggler.toggled = false;
	obj.slideUp();
}

/**
 * Convinience method to output keycode of all keystrokes to the developer
 * console.
 */
Toggler.debugMode = function() {
	$(window).keyup(function(event) {
		console.log('keyCode: '+event.keyCode); 
	});
}

// Attach the plugin to the jQuery object
$.fn.extend({
	"toggler" : Toggler.init
});

})(jQuery);