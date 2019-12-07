var canvas = document.getElementById("currentImage")
var context = canvas.getContext("2d");
var Iterator = 0;
var dataPromise = {}

function loadCanvasWithInputFile(evt) {
	var files = evt.target.files; // FileList object
	var file = files[0];
	var reader = new FileReader();

	var image = new Image();
	var outputArray = [[]];

	document.getElementById("imageName").innerHTML = "";

	if (file.type.match('image.*')) {
		// Read in the image file as a data URL.
		reader.onload = function (event) {
			image.onload = function () {
				canvas.width = 100;
				canvas.height = 100;
				outputArray = resize(image, context);
			}
			image.src = event.target.result;
		}
		reader.readAsDataURL(file);

		console.log(outputArray[0][0])

	} else {
		alert("not an image");
	}
}

async function showExamples() {

	const surface =
		tfvis.visor().surface({ name: 'Input Data Examples', tab: 'Input Data' });

	// Get the examples
	const examples = await getNextImage();
	const numExamples = examples.xs.shape[0];

	// Create a canvas element to render each example
	for (let i = 0; i < numExamples; i++) {
		const imageTensor = tf.tidy(() => {
			// Reshape the image to 28x28 px
			return examples.xs
				.slice([i, 0], [1, examples.xs.shape[1]])
				.reshape([100, 100, 1]);
		});

		const canvas = document.createElement('canvas');
		canvas.width = 100;
		canvas.height = 100;
		canvas.style = 'margin: 4px;';
		await tf.browser.toPixels(imageTensor, canvas);
		surface.drawArea.appendChild(canvas);

		imageTensor.dispose();
	}

}

async function run() {

	await showExamples();

}

function resize(img, cont) {
	cont.drawImage(img, 0, 0, 100, 100);
	var imgPixels = cont.getImageData(0, 0, 100, 100)
	var outputArray = [];
	outputArray[0] = new Array(100)

	//https://stackoverflow.com/questions/37174616/js-how-to-turn-image-object-into-grayscale-and-display-it
	for (var y = 0; y < 100; y++) {
		for (var x = 0; x < 100; x++) {
			var i = (y * 4) * 100 + x * 4;
			var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
			imgPixels.data[i] = avg;
			imgPixels.data[i + 1] = avg;
			imgPixels.data[i + 2] = avg;
			outputArray[0][y * 100 + x] = avg / 256;
		}
	}
	cont.putImageData(imgPixels, 0, 0)

	return outputArray;
}

function loadJson(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if (xmlhttp.status == 200) {
		result = xmlhttp.responseText;
	}
	return JSON.parse(result);
}

function getNextImage() {
	var image = new Image();
	var src = "";
	var metadata = [];
	var isMalicious = false;
	var maliciousLabel = [];
	var outputArray = [[]];
	var ret = {};

	do {
		src = filenames[Iterator];
		if (!src.includes(".json")) {
			document.getElementById("imageName").innerHTML = src;
			src = "./img/" + src;
			image.src = src;
			dataPromise = new Promise(function () {
				metadata = loadJson(src.replace(/\..{3}$/, ".json")) //replace file ending
				if (metadata) {
					isMalicious = [] + metadata.meta.clinical.benign_malignant == "malignant" ? 1 : 0;
					maliciousLabel[0] = [isMalicious]
				}
				outputArray = resize(image, context)
				ret.xs = tf.tensor2d(outputArray, [1, 10000])
				ret.labels = tf.tensor2d(maliciousLabel, [1, 1])
				return ret;
			})
		}
		Iterator++;
	} while (!src.includes(".json"))

	return ret;
}