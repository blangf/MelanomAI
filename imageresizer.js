function loadCanvasWithInputFile(){
	// canvas
    var canvas = document.createElement("CANVAS")
    document.getElementById("content").appendChild(canvas)
	var context = canvas.getContext("2d"); 
	var fileinput = document.getElementById("customFile"); // input file
	var img = new Image();

	fileinput.onchange = function(evt) {
	    var files = evt.target.files; // FileList object
	    var file = files[0];
	    if(file.type.match('image.*')) {
	        var reader = new FileReader();
	        // Read in the image file as a data URL.
	        reader.readAsDataURL(file);
	    	reader.onload = function(evt){
	    		if( evt.target.readyState == FileReader.DONE) {
	    			img.src = evt.target.result;
				context.drawImage(img,100,100);
			}
	    	}    

	    } else {
	        alert("not an image");
	    }
	};
}