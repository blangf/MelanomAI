<html>

<head>
	<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0/dist/tf.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis@1.0.2/dist/tfjs-vis.umd.min.js"></script>
	<script>
	var filenames = <?php echo(json_encode(scandir("./img"))); ?>;
	filenames.splice(0,2) //get rid of "." and ".." from scandir
	</script>
</head>

<body>

	<h1>MelanomAI</h1>
	<p>This Web App uses Neural Networks to detect possible skin diseases</p>
	<br>
	<button onclick="run()">import from localhost(need e.g. XAMPP)</button>

	<form>
		<div class="custom-file">
			<label class="custom-file-label" for="customFile">Choose file</label>
			<input type="file" class="custom-file-input" id="customFile" onchange="loadCanvasWithInputFile(event)">
		</div>
		<!--<input type="submit"> -->
	</form>

	<h2 id="content">
		<p id="imageName"></p>
		<canvas id="currentImage"></canvas>
	</h2>
	<script src="imageLoader.js"></script>

</body>

</html>
