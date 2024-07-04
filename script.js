
/**
 * Convert a number from numbers range to a number within a percentile range
 * @param number desiredNumber - Specify the desired number within the range
 * @param number minNumber 
 * @param number maxNumber 
 * @param number minPercentile 
 * @param number maxPercentile 
 */
function findNumberInPercentileRange(desiredNumber, minNumber, maxNumber, minPercentile, maxPercentile) {
  let range = maxNumber - minNumber;
  let percentileRange = maxPercentile - minPercentile;
  let desiredPercentile = minPercentile + ((desiredNumber - minNumber) / range) * percentileRange;
  return desiredPercentile;
}

/**
 * Convert a number from a percentile range to a number within a normal range
 * @param number desiredPercentile - Specify the desired percentile within the range
 * @param number minNumber 
 * @param number maxNumber 
 * @param number minPercentile 
 * @param number maxPercentile 
 */
function findPercentileRangeInNumber(desiredPercentile, minNumber, maxNumber, minPercentile, maxPercentile) {
  let range = maxNumber - minNumber;
  let percentileRange = maxPercentile - minPercentile;
  let desiredNumber = minNumber + ((desiredPercentile - minPercentile) / percentileRange) * range;
  return desiredNumber;
}

/**
 * calculate ideal weight
 * @param number age
 * @param string sex -> "male", "female", "non-binary"
 * @param number height -> Metre
 */
function idealWeight(age, sex, height) {
  let ideal_bmi_range = { min: 18, max: 25 };

  if (age > 20) {
    var ideal_bpn_range = { min: 5, max: 80 };
    ideal_bmi_range = {
      min: findPercentileRangeInNumber(ideal_bpn_range.min, 18, 25, 5, 95),
      max: findPercentileRangeInNumber(ideal_bpn_range.max, 18, 25, 5, 95)
    };
  }
  
  var gender_coeff = {"male": 1, "female": 1.07, "non-binary": 1.03}[sex];

  return /* Weight */ {
    min: (ideal_bmi_range.min * (height * height)) / gender_coeff,
    max: (ideal_bmi_range.max * (height * height)) / gender_coeff
  };
}

/**
 * calculate [Body mass index]
 * @param number age 
 * @param string sex -> "male", "female", "non-binary"
 * @param number weight -> Kilogram
 * @param number height -> Metre
 */
function calculateBMI(age, sex, weight, height) {

  var bmi = weight / (height * height);

  var gender_coeff = {"male": 1, "female": 1.07, "non-binary": 1.03}[sex];
  var main_bmi = bmi * gender_coeff;


  // BMI Percentile Numbers
  let bpn;

  if (age > 20) {
    bpn = findNumberInPercentileRange(main_bmi, 16, 40, 5, 95);
  } else {
    bpn = findNumberInPercentileRange(main_bmi, 16, 30, 5, 95);
  }

  return {
    BMI: bmi,
    mainBMI: main_bmi,
    BPN: bpn > 100 ? 100 : bpn,
    idealWeight: idealWeight(age, sex, height)
  }
}

function getElementDimensions(element) {
  var rect = element.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

document.addEventListener('DOMContentLoaded', ev => {

  // set the body to full width and height
  document.body.style.setProperty("--height", `${innerHeight}px`);
  document.body.style.setProperty("--width", `${innerWidth}px`);

  const close_model = (ev) => document.querySelector("#result").classList.remove('is-active');
  const modelBackground = document.querySelector("#result > div.modal-background");
  const modelClose = document.querySelector("#result > button.modal-close");
  
  modelBackground.addEventListener('click', close_model);
  modelClose.addEventListener('click', close_model);

  const age_input = document.getElementById("age_field");
  const gender_options = document.querySelectorAll("select#gender_field option")
  const gender_option = Object.values(gender_options).map(option => { if (option.selected) return option; }).filter(Boolean)[0];
  const weight_input = document.getElementById("weight_field");
  const height_input = document.getElementById("height_field");
  const calculate_btn = document.getElementById("calculate");

  calculate_btn.onclick = ev => {
    ev.preventDefault();

    var age = age_input.value;
    var gender = gender_option.value;
    var weight = weight_input.value;
    var height = height_input.value;

    document.getElementById("your_height").innerText = (height / 1).toFixed(1);

    // Convert height from centimeters to meters
    height = height / 100;

    var data = calculateBMI(age, gender, weight, height);

    document.getElementById("suggested_weight").innerText = `${data.idealWeight.min.toFixed(1)} ~ ${data.idealWeight.max.toFixed(1)}`;

    document.querySelector("#bmi > h2").innerText = data.BMI.toFixed(1);

    var bpn_bar = data.BPN > 96 ? 96 : data.BPN;
    document.querySelector("#chart-box .bar").style.setProperty('--level', `${bpn_bar}%`);

    let weight_status = "Unknown";

    if (age >= 20) {
      if (data.mainBMI < 16) weight_status = "Severe Thinness";
      else if (data.mainBMI <= 17) weight_status = "Moderate Thinness";
      else if (data.mainBMI <= 18.5) weight_status = "Mild Thinness";
      else if (data.mainBMI <= 25) weight_status = "Normal";
      else if (data.mainBMI <= 30) weight_status = "Overweight";
      else if (data.mainBMI <= 35) weight_status = "Obese Class I";
      else if (data.mainBMI <= 40) weight_status = "Obese Class II";
      else if (data.mainBMI > 40) weight_status = "Obese Class III";
    } else {
      if (data.BPN < 5) weight_status = "Underweight";
      else if (data.BPN <= 85) weight_status = "Healthy weight";
      else if (data.BPN <= 95) weight_status = "At risk of overweight";
      else if (data.BPN > 95) weight_status = "Overweight";
    }

    document.getElementById("weight_status").innerText = weight_status;

    document.querySelector("#result").classList.add('is-active');

    var capture = document.querySelector("#capture");
    capture.classList.add('active');
    html2canvas(capture).then(canvas => {
      capture.classList.remove('active');
      var url = canvas.toDataURL();
      document.querySelector("a#download").href = url;
    });

  };

});

// Just for Debug :
// window.onresize = ev => window.location.reload();
