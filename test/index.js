'use strict';

var test = require('prova');
var trigger = require('tiny-trigger');
var Lethargy = require('../lethargy.js').Lethargy;
var $ = require('jquery');

// Get a wheel event
var wheelEvent = 'onwheel' in document ?
    'onwheel' : 'onmousewheel' in document ? 'onmousewhell' : 'scroll';

// If we fallback on scroll event, make the body scrollable
if (wheelEvent === 'scroll') {
    document.body.style.height = '101%';
}

test('native "' + wheelEvent + '" event', function(assert) {
    var lethargy = new Lethargy();
    window.addEventListener(wheelEvent, function onWheel(event) {
        window.removeEventListener(wheelEvent, onWheel);
        assert.ok(lethargy.check(event));
        assert.end();
    });
    trigger(window, wheelEvent);
});

test('jQuery "' + wheelEvent + '" event', function(assert) {
    var lethargy = new Lethargy();
    $(window).on(wheelEvent, function onWheel(event) {
        $(window).off(wheelEvent, onWheel);
        assert.ok(lethargy.check(event));
        assert.end();
    });
    trigger(window, wheelEvent);
});