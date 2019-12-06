var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d");

function loadCanvasWithInputFile(evt) {
	var files = evt.target.files; // FileList object
	var file = files[0];

	if (file.type.match('image.*')) {
		var reader = new FileReader();
		// Read in the image file as a data URL.
		var image = new Image();
		reader.onload = function (event) {
			image.onload = function () {
				canvas.width = 100;
				canvas.height = 100;
				resize(image, context);
			}
			image.src = event.target.result;
		}
		reader.readAsDataURL(file);

	} else {
		alert("not an image");
	}
}

function loadFromLocalHost()
{
	var image = new Image();
	image.src = "./img/test.jpg";
	resize(image, context)
}

function resize(img, cont) {
	cont.drawImage(img, 0, 0, 100, 100);
	var imgPixels = cont.getImageData(0, 0, 100, 100)
	var outputArray = new Array(100);

	//https://stackoverflow.com/questions/37174616/js-how-to-turn-image-object-into-grayscale-and-display-it
	for (var y = 0; y < 100; y++) {
		outputArray[y] = new Array(100)
		for (var x = 0; x < 100; x++) {
			var i = (y * 4) * 100 + x * 4;
			var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
			imgPixels.data[i] = avg;
			imgPixels.data[i + 1] = avg;
			imgPixels.data[i + 2] = avg;
			outputArray[y][x] = avg;
		}
	}
	cont.putImageData(imgPixels, 0, 0)
}