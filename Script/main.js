let inputElement = document.getElementById('fileinput');
let ShowImg = document.getElementById('imageSrc');
let RedSlider = document.getElementById('Rval');
let RedInput = document.getElementById('RLval');
let GreenSlider = document.getElementById('Gval');
let GreenInput = document.getElementById('GLval');
let BlueSlider = document.getElementById('Bval');
let BlueInput = document.getElementById('BLval');
let RedSliderlow = document.getElementById('Rvallow');
let RedInputlow = document.getElementById('RLvallow');
let GreenSliderlow = document.getElementById('Gvallow');
let GreenInputlow = document.getElementById('GLvallow');
let BlueSliderlow = document.getElementById('Bvallow');
let BlueInputlow = document.getElementById('BLvallow');
let A_Red = document.getElementById('A_Red');
let A_Green = document.getElementById('A_Green');
let A_Blue = document.getElementById('A_Blue');


let mat;
let ImageURL;
inputElement.addEventListener('change', (e) => {
  ImageURL=URL.createObjectURL(e.target.files[0]);
  ShowImg.src = ImageURL;
  updateInputFromSlider();
   }, false);


function updateSliderFromInput() {
  RedSlider.value = RedInput.value;
  GreenSlider.value=GreenInput.value;
  BlueSlider.value=BlueInput.value;
  RedSliderlow.value=RedInputlow.value;
  GreenSliderlow.value=GreenInputlow.value;
  BlueSliderlow.value=BlueInputlow.value;
  updateInputFromSlider();
  // mat = cv.imread('imageSrc');
  // console.log(RedSlider.value);
}

function updateInputFromSlider() {
  if (parseInt(RedSlider.value) <= 255) {
    RedInput.value = RedSlider.value;

  } else {
    RedInput.value = 255;
  }
  if (parseInt(GreenSlider.value) <= 255) {
    GreenInput.value = GreenSlider.value;

  } else {
    GreenInput.value = 255;
  }
  if (parseInt(BlueSlider.value) <= 255) {
    BlueInput.value = BlueSlider.value;

  } else {
    BlueInput.value = 255;
  }
  if (parseInt(RedSliderlow.value) <= 255) {
    RedInputlow.value = RedSliderlow.value;

  } else {
    RedInputlow.value = 255;
  }
  if (parseInt(GreenSliderlow.value) <= 255) {
    GreenInputlow.value = GreenSliderlow.value;

  } else {
    GreenInputlow.value = 255;
  }
  if (parseInt(BlueSliderlow.value) <= 255) {
    BlueInputlow.value = BlueSliderlow.value;

  } else {
    BlueInputlow.value = 255;
  }
  maskedimg(parseInt(RedSlider.value),parseInt(GreenInput.value),parseInt(BlueSlider.value),parseInt(RedSliderlow.value),parseInt(GreenInputlow.value),parseInt(BlueSliderlow.value));
}

RedSlider.addEventListener('input', updateInputFromSlider);
RedInput.addEventListener('input', updateSliderFromInput);
GreenSlider.addEventListener('input', updateInputFromSlider);
GreenInput.addEventListener('input', updateSliderFromInput);
BlueSlider.addEventListener('input', updateInputFromSlider);
BlueInput.addEventListener('input', updateSliderFromInput);
RedSliderlow.addEventListener('input', updateInputFromSlider);
RedInputlow.addEventListener('input', updateSliderFromInput);
GreenSliderlow.addEventListener('input', updateInputFromSlider);
GreenInputlow.addEventListener('input', updateSliderFromInput);
BlueSliderlow.addEventListener('input', updateInputFromSlider);
BlueInputlow.addEventListener('input', updateSliderFromInput);


function maskedimg(Red,Green,Blue,Redlow,Greenlow,Bluelow){
    mat = cv.imread('imageSrc');
    let dst = new cv.Mat();
    
    
    let low = new cv.Mat(mat.rows, mat.cols, mat.type(), [Redlow, Greenlow, Bluelow, 0]);
    let high = new cv.Mat(mat.rows, mat.cols, mat.type(), [Red, Green, Blue, 255]);

    cv.inRange(mat, low, high, dst);
    // let M = cv.Mat.ones(8, 8, cv.CV_8U);
    // let anchor = new cv.Point(-1, -1);
    // let ksize = new cv.Size(3, 3);
    // cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
    // You can try more different parameters
    // cv.morphologyEx(dst, dst, cv.MORPH_OPEN, M, anchor, 2,cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    
    if(document.getElementById("invert").checked==true){
      let indst = new cv.Mat();
      cv.bitwise_not(dst,indst);
      cv.imshow('imgcancas', indst);
      indst.delete();

    }else{
      cv.imshow('imgcancas', dst);
    }
    mat.delete(); dst.delete(); low.delete(); high.delete();
    // M.delete();
    cropImg();

}
function cropImg(){
  let src = cv.imread('imageSrc');
  let mask = cv.imread('imgcancas');
  let croped = new cv.Mat();
  let maskdouble = new cv.Mat();
  let channels = new cv.MatVector();
  let RGBA = new cv.Mat();
  let BnW=new cv.Mat();
  const segR = new cv.Mat();
  const segG = new cv.Mat();
  const segB = new cv.Mat();

  cv.bitwise_and(src, mask, croped);
  cv.imshow('cropedimg', croped);
  //mask.convertTo(maskdouble, cv.CV_64FC1);
  cv.cvtColor(mask,maskdouble,cv.COLOR_BGR2GRAY);
  // cv.imshow('cropedimg2', maskdouble);
  // console.log(typeof maskdouble);
  cv.split(src, channels);
  //multiply
  cv.bitwise_and(channels.get(0),maskdouble,segR);
  cv.bitwise_and(channels.get(1),maskdouble,segG);
  cv.bitwise_and(channels.get(2),maskdouble,segB);

  const maskTotalPxls = cv.countNonZero(maskdouble);
  // console.log(maskTotalPxls);

  // console.log(sumMatrix(segR)/maskTotalPxls);
  A_Red.innerHTML=((sumMatrix(segR)/maskTotalPxls).toFixed(3));
  A_Green.innerHTML=((sumMatrix(segG)/maskTotalPxls).toFixed(3));
  A_Blue.innerHTML=((sumMatrix(segB)/maskTotalPxls).toFixed(3));

  segR.delete();
  segG.delete();
  segB.delete();
  src.delete();
  mask.delete();
  croped.delete();
  maskdouble.delete();
  RGBA.delete();
  BnW.delete();
  channels.delete();
}

function sumMatrix(mat) {
  let sum = 0;
  const type = mat.type();
  const depth = type % 8;
  const channels = Math.floor(type / 8) + 1;
  if (depth === cv.CV_32F) {
      const data = mat.data32F;
      const length = mat.rows * mat.cols * channels;
      for (let i = 0; i < length; i++) {
          sum += data[i];
      }
  } else if (depth === cv.CV_8U) {
      const data = mat.data;
      const length = mat.rows * mat.cols * channels;
      for (let i = 0; i < length; i++) {
          sum += data[i];
      }
  }
  return sum;
}