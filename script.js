const classNames = ['Melanom', 'No Melanom'];
const BATCH_SIZE = 10;
const TRAIN_DATA_SIZE = 50;
const TEST_DATA_SIZE = 20;
const IMAGE_WIDTH = 100;
const IMAGE_HEIGHT = 100;
const IMAGE_CHANNELS = 1;  

async function run() {

    try
    {
        document.getElementById("tfjs-visor-container").style.display = ""
    }
    catch
    {}
	const model = getModel();
	tfvis.show.modelSummary({ name: 'Model Architecture' }, model);

	await train(model);

	await showAccuracy(model);
    await showConfusion(model);
    
    await model.save('downloads://my-model');

}

//https://codelabs.developers.google.com/codelabs/tfjs-training-classfication/index.html#4
function getModel() {
    const model = tf.sequential();
    
    // In the first layer of our convolutional neural network we have 
    // to specify the input shape. Then we specify some parameters for 
    // the convolution operation that takes place in this layer.
    model.add(tf.layers.conv2d({
      inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
  
    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.  
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    
    // Repeat another conv2d + maxPooling stack. 
    // Note that we have more filters in the convolution.
    model.add(tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    
    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten());
  
    const NUM_OUTPUT_CLASSES = 2;
    model.add(tf.layers.dense({
      units: NUM_OUTPUT_CLASSES,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax'
    }));
  
    
    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  
    return model;
  }

  async function train(model) {
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training', styles: { height: '1000px' }
    };
    const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);
      
    const [trainXs, trainYs] = tf.tidy(() => {
      const d = getNextImages(TRAIN_DATA_SIZE);
      return [
        d.xs.reshape([TRAIN_DATA_SIZE, IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS]),
        d.labels
      ];
    });
  
    const [testXs, testYs] = tf.tidy(() => {
      const d = getNextImages(TEST_DATA_SIZE);
      return [
        d.xs.reshape([TEST_DATA_SIZE, IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS]),
        d.labels
      ];
    });
  
    return model.fit(trainXs, trainYs, {
      batchSize: BATCH_SIZE,
      validationData: [testXs, testYs],
      epochs: 10,
      shuffle: true,
      callbacks: fitCallbacks
    });
  }

function doPrediction(model, testDataSize = 500, data) {
    var testData = "";
    if (data){
        testData = data;
    }
    else {
        testData = getNextImages(testDataSize);
    }
   
  const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS]);
  const labels = testData.labels.argMax([-1]);
  const preds = model.predict(testxs).argMax([-1]);

  testxs.dispose();
  return [preds, labels];
}


async function showAccuracy(model, testDataSize = 500 ,data) {
  const [preds, labels] = doPrediction(model, testDataSize, data);
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  const container = {name: 'Accuracy', tab: 'Evaluation'};
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

  labels.dispose();

  return classAccuracy;
}

async function showConfusion(model) {
  const [preds, labels] = doPrediction(model);
  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  const container = {name: 'Confusion Matrix', tab: 'Evaluation'};
  tfvis.render.confusionMatrix(
      container, {values: confusionMatrix}, classNames);

  labels.dispose();
}