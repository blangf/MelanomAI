var canvas = document.getElementById("currentImage")
canvas.width = 100;
canvas.height = 100;
var context = canvas.getContext("2d");
var Iterator = 0;
var dataPromise = {}

async function loadCanvasWithInputFile(evt) {
	var ret = {};
	var files = evt.target.files; // FileList object
	var file = files[0];
	var reader = new FileReader();

	var image = new Image();
	var outputArray = [[]];

	var model = "";
	try {
		model = await tf.loadLayersModel('./my-model.json');
	}
	catch
	{
		model = getModel();
	}

	document.getElementById("imageName").innerHTML = "";

	if (file.type.match('image.*')) {
		// Read in the image file as a data URL.
		reader.onload = function (event) {
			image.onload = function () {
				outputArray[0] = resize(image, context);
				ret.xs = tf.tensor2d(outputArray, [1, 10000])
				ret.labels = tf.tensor2d([[0, 1]], [1, 2])

				let pred = "";

				showAccuracy(model, 1, ret).then(function () {
					pred = arguments;
					var predOut = pred[0][1].accuracy == 0 ? "Melanom" : "No Melanom";
					document.getElementById("Diagnosis").innerHTML = "Diagnosis: " + predOut;
					document.getElementById("tfjs-visor-container").style.display = "none";
				})

			}
			image.src = event.target.result;
		}
		reader.readAsDataURL(file);

	} else {
		alert("not an image");
	}


}

async function showExamples(examples) {

	const surface =
		tfvis.visor().surface({ name: 'Input Data Examples', tab: 'Input Data' });

	// Get the examples
	if (!examples) {
		examples = getNextImages(10)
	}
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
		canvas.width = 10;
		canvas.height = 10;
		canvas.style = 'margin: 4px;';
		await tf.browser.toPixels(imageTensor, canvas);
		surface.drawArea.appendChild(canvas);

		imageTensor.dispose();
	}

}

function resize(img, cont) {
	cont.drawImage(img, 0, 0, 100, 100);
	var imgPixels = cont.getImageData(0, 0, 100, 100)
	var outputArray = [];

	//https://stackoverflow.com/questions/37174616/js-how-to-turn-image-object-into-grayscale-and-display-it
	for (var y = 0; y < 100; y++) {
		for (var x = 0; x < 100; x++) {
			var i = (y * 4) * 100 + x * 4;
			var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
			imgPixels.data[i] = avg;
			imgPixels.data[i + 1] = avg;
			imgPixels.data[i + 2] = avg;
			outputArray[y * 100 + x] = avg / 256;
		}
	}
	cont.putImageData(imgPixels, 0, 0)
	context.putImageData(imgPixels, 0, 0)

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

function getNextImages(batch_size) {
	if (!batch_size) { batch_size = 1 }
	var image = new Image();
	var src = "";
	var metadata = [];
	var isMalicious = false;
	var maliciousLabels = [[]];
	var outputArray = [[]];
	var ret = {};
	var cont = {};

	dataPromise = new Promise(function () {
		for (var i = 0; i < batch_size; i++) {
			do {
				src = filenames[Iterator];
				if (!src.includes(".json")) {
					cont = document.createElement("canvas").getContext("2d")
					document.getElementById("imageName").innerHTML = src;
					src = "./img/" + src;

					image.src = src;
					outputArray[i] = resize(image, cont)

					metadata = loadJson(src.replace(/\..{3}$/, ".json")) //replace file ending
					if (metadata) {
						isMalicious = metadata.meta.clinical.benign_malignant == "malignant" ? 1 : 0;
						maliciousLabels[i] = [isMalicious, !isMalicious]
					}
				}
				Iterator++;
			} while (!src.includes(".json"))
			if (Iterator >= filenames.length) Iterator = 0
		}

		ret.xs = tf.tensor2d(outputArray, [batch_size, 10000])
		ret.labels = tf.tensor2d(maliciousLabels, [batch_size, 2])
	})

	return ret;
}