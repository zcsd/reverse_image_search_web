//========================================================================
// Drag and drop image handling
//========================================================================

var fileDrag = document.getElementById("file-drag");
var fileSelect = document.getElementById("file-upload");

// Add event listeners
fileDrag.addEventListener("dragover", fileDragHover, false);
fileDrag.addEventListener("dragleave", fileDragHover, false);
fileDrag.addEventListener("drop", fileSelectHandler, false);
fileSelect.addEventListener("change", fileSelectHandler, false);

function fileDragHover(e) {
  // prevent default behaviour
  e.preventDefault();
  e.stopPropagation();

  fileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function fileSelectHandler(e) {
  // handle file selecting
  var files = e.target.files || e.dataTransfer.files;
  fileDragHover(e);
  for (var i = 0, f; (f = files[i]); i++) {
    previewFile(f);
  }
}

//========================================================================
// Web page elements for functions to use
//========================================================================

var keyInput = document.getElementById("key-input");
var imageInput = document.getElementById("image-input");
var uploadCaption = document.getElementById("upload-caption");
var textResult = document.getElementById("text-result");
var imageOutput1 = document.getElementById("image-output1");
var imageOutput2 = document.getElementById("image-output2");
var imageOutput3 = document.getElementById("image-output3");
var imageOutput4 = document.getElementById("image-output4");
var imageOutput5 = document.getElementById("image-output5");

//========================================================================
// Main button events
//========================================================================

function submitImage() {
  // action for the submit button
  console.log("submit");

  if (!imageInput.src || !imageInput.src.startsWith("data")) {
    window.alert("请在提交前上传一张图片");
    return;
  }

  if (!keyInput.value) {
    window.alert("请在提交前输入密钥");
    return;
  } 

  if (keyInput.value.length > 10) {
    keyInput.value = "";
    window.alert("密钥长度不能超过10个字符");
    return;
  }

  checkStatus();

  // call the retrieve function of the backend
  retrieveImage(imageInput.src);
  fetch("/api/abc", {method: 'GET'});
}

function clearImage() {
  // reset selected files
  fileSelect.value = "";

  // remove image sources and hide them
  imageInput.src = "";
  textResult.innerHTML = "";
  imageOutput1.src = "";
  imageOutput2.src = "";
  imageOutput3.src = "";
  imageOutput4.src = "";
  imageOutput5.src = "";

  hide(imageInput);
  hide(imageOutput1);
  hide(imageOutput2);
  hide(imageOutput3);
  hide(imageOutput4);
  hide(imageOutput5);
  show(uploadCaption);

  checkStatus();
}

function previewFile(file) {
  // show the preview of the image
  //console.log(file.name);
  //var fileName = encodeURI(file.name);

  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    imageInput.src = URL.createObjectURL(file);

    show(imageInput);
    hide(uploadCaption);

    // reset
    textResult.innerHTML = "";

    displayImage(reader.result, "image-input");
  };
}

//========================================================================
// Helper functions
//========================================================================

function retrieveImage(image) {
  fetch("https://ai.best360.tech/cbir/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({"key": keyInput.value, "image": image})
  })
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        displayResult(data);
      } else {
        textResult.innerHTML = data.result;
        keyInput.value = "";
      }
    })
      .catch(err => {
        console.log("An error occured", err.message);
        window.alert("Oops! Something went wrong.");
      });
}

function displayImage(image, id) {
  // display image on given id <img> element
  let display = document.getElementById(id);
  display.src = image;
  show(display);
}

function displayResult(data) {
  // display the result
  textResult.innerHTML = data.result;

  show(imageOutput1);
  show(imageOutput2);
  show(imageOutput3);
  show(imageOutput4);
  show(imageOutput5);

  imageOutput1.src = data.link1;
  imageOutput2.src = data.link2;
  imageOutput3.src = data.link3;
  imageOutput4.src = data.link4;
  imageOutput5.src = data.link5;
}

function hide(el) {
  // hide an element
  el.classList.add("hidden");
}

function show(el) {
  // show an element
  el.classList.remove("hidden");
}

//========================================================================
// Check AI server status
//========================================================================

checkStatus();

function checkStatus() {
  fetch("https://ai.best360.tech/", {method: "GET"})
  .then(resp => {
    if (resp.ok) {
      document.getElementById("server-status").innerHTML = "<span style='color: #fcda5e;'>AI服务器状态正常</span>";
    } else {
      document.getElementById("server-status").innerHTML = "<span style='color: red;'>AI服务器已下线，请联系管理员</span>";
    }
  })
  .catch(err => {
    console.log("An error occured", err);
    document.getElementById("server-status").innerHTML = "<span style='color: red;'>AI服务器已下线，请联系管理员</span>";
  });
}