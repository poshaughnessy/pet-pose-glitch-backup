const canvas = document.getElementById('canvas');
const dropTarget = document.getElementById('dropTarget');
const imageElement = document.getElementById('image');
const resetButton = document.getElementById('reset');

const imageScaleFactor = 0.5;
const outputStride = 16;
const flipHorizontal = false;
const maxWidth = window.innerWidth - 45;
const maxHeight = window.innerHeight;

const dropTargetText = 'Drop a photo of your pet here';
const loadingText = 'Loading...';

// Initialise
dropTarget.addEventListener('filedrop', onFileDropEvent);
resetButton.addEventListener('click', onClickReset);
dropTarget.innerText = dropTargetText;
resetButton.disabled = true;

function onFileDropEvent(event) {
  console.log('Dropped file with name', event.file.name);
  
  dropTarget.innerText = loadingText;
  
  const reader = new FileReader();

  reader.onload = loadEvent => {
    console.log('onload file', loadEvent);
    imageElement.src = loadEvent.target.result;
    doPose();
  };

  reader.readAsDataURL(event.file);
  
};

function onClickReset() {
  dropTarget.innerText = dropTargetText;
  dropTarget.style.display = 'block';
  canvas.style.display = 'none';
  resetButton.disabled = true;
}

function drawResults(canvas, poses, minPartConfidence, minPoseConfidence) {

  console.log('drawResults');

  renderImageToCanvas(imageElement, [imageElement.width, imageElement.height], canvas);
  
  canvas.style.display = 'block';

  console.log('Rendered image to canvas');

  poses.forEach((pose) => {
    if (pose.score >= minPoseConfidence) {
        drawKeypoints(
            pose.keypoints, minPartConfidence, canvas.getContext('2d'));
        drawSkeleton(
            pose.keypoints, minPartConfidence, canvas.getContext('2d'));
        drawBoundingBox(pose.keypoints, canvas.getContext('2d'));
    }
  });

}

function drawSinglePoseResults(pose) {

    console.log('drawSinglePoseResults');

    console.log('canvas, pose', canvas, pose);

    dropTarget.style.display = 'none';
    resetButton.disabled = false;
  
    drawResults(
        canvas, 
        [pose],
        0.0, // minPartConfidence
        0.0  // minPoseConfidence
    );

}

function doPose() {

  posenet.load().then(function(net){
    return net.estimateSinglePose(imageElement, imageScaleFactor, flipHorizontal, outputStride)
  }).then(function(pose) {

    console.log('Hello', pose);

    return drawSinglePoseResults(pose);

  }).catch(function(err) {
    console.log('Error, error...', err);
  });

}
