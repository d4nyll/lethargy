(function() {

	$(window).bind('mousewheel DOMMouseScroll wheel MozMousePixelScroll', function(e){
		e.preventDefault()
		e.stopPropagation();
		console.log(e.originalEvent.wheelDelta);
		console.log(e.originalEvent.detail);
		if(e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
            // scrollUp();
        }
        else {
        	// scrollDown();
        }
		return false;
	});
	// var runFunction = function() {
 //        var div = document.createElement('div');
 //        div.innerHTML = Date.now();
 //        $('#messageBox').append(div);
 //    }
    
 //    setInterval(runFunction, 1000);
})();


