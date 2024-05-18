console.clear();
const wheel = document.querySelector("#wheel");
const pointer = document.querySelector(".pointer");
const pressBtn = document.querySelector(".pointer span");
const banner = document.querySelector(".banner");
const infoText = document.querySelector(".info-text");
const iconGroup = document.querySelector(".icon-group");
const selectedPresent = document.querySelector("#selected-present");
const btn_reset = document.querySelector("#btn-reset");

let data = [];
let game = null;
const types = {
  presents: {
    data: [
      { label: "25₹" },
      { label: "50₹" },
      { label: "😔" },
      { label: "25₹" },
      { label: "50₹" },
      { label: "😔" },
      { label: "25₹" },
      { label: "50₹" },
      { label: "😔" },
    ],
  },
};
const gradientColors = {
  "25₹": ["#F7819F", "#FFA07A"],
  "50₹": ["#5EB5F6", "#87CEFA"],
  "😔": ["#FF6F61", "#FFD700"],
};
const colors = {
  blueDark: "#1F1172",
};

// init canvas setting
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const radius = 380;
const PI2 = Math.PI * 2;
canvas.width = radius * 2;
canvas.height = radius * 2;

// Create and load the audio element
const spinAudio = new Audio("wheel-audio.mp3");

// draw sectors with gradient
ctx.fillPie = function (x, y, r, start, qty, gradient) {
  let angle = PI2 / qty;
  let startAngle = start * angle;
  let endAngle = (start + 1) * angle;
  let gradientFill = ctx.createLinearGradient(
    radius + Math.cos(startAngle) * r,
    radius + Math.sin(startAngle) * r,
    radius + Math.cos(endAngle) * r,
    radius + Math.sin(endAngle) * r
  );
  gradientFill.addColorStop(0, gradient[0]);
  gradientFill.addColorStop(1, gradient[1]);
  this.beginPath();
  ctx.lineTo(radius, radius);
  this.arc(x, y, r, startAngle, endAngle);
  ctx.lineTo(radius, radius);
  this.fillStyle = gradientFill;
  this.fill();
  this.closePath();
};

function insertContent(data, qty) {
  let rotate = 360 / qty;
  iconGroup.innerHTML = "";
  data.forEach((item, index) => {
    let html = `
    <h5 style="font-size: 60px; position: absolute; left: 60px; bottom: 200px;">${item.label}</h5>
  `;
    let newContent = document.createElement("li");
    newContent.innerHTML = html;
    iconGroup.append(newContent);
    newContent.style.transform = `rotate(${index * rotate}deg)`;
  });
}

function drawButton() {
  ctx.beginPath();
  ctx.fillStyle = colors.blueDark;
  ctx.arc(radius, radius, 55, 0, PI2);
  ctx.closePath();
  ctx.fill();
}

function drawSectors(data, qty) {
  for (let i = 0; i < qty; i++) {
    let gradient;
    if (data[i].label === "25₹") {
      gradient = gradientColors["25₹"];
    } else if (data[i].label === "50₹") {
      gradient = gradientColors["50₹"];
    } else {
      gradient = gradientColors["😔"];
    }
    ctx.fillPie(radius, radius, radius, i, qty, gradient);
  }
}

function draw(data, qty) {
  drawSectors(data, qty);
  // draw press button
  drawButton();
  insertContent(data, qty);
}

function init() {
  data = [...types.presents.data];
  draw(data, data.length);
  game = new Game(data);
}

function resetStyle() {
  banner.style.display = "none";
  pointer.style.transform = "rotate(0deg)";
}

// Event Listeners
window.addEventListener("load", () => {
  resetStyle();
  init();
  wheel.classList.remove("new");
  iconGroup.classList.remove("new");
});

pressBtn.addEventListener("click", () => {
  if (!game.isTurning) {
    game.spinWheel();
    game.isTurning = true;
    spinAudio.play();
  }
});

pointer.addEventListener("transitionend", () => {
  pointer.style.transition = "none";
  let actualDeg = game.deg % 360;
  pointer.style.transform = `rotate(${actualDeg}deg)`;
  game.isTurning = false;
  game.showResult();
  spinAudio.pause();
  spinAudio.currentTime = 0; // Reset the audio for the next spin
});

const Game = function (dataBase) {
  this.pool = [...dataBase];
  this.presentQty = dataBase.length;
  this.isTurning = false;
  this.deg = 0;
  this.currentResult = {
    index: null,
    label: null,
  };
};

Game.prototype.spinWheel = function () {
  this.getPresent();
  let randomDeg = 360 * 5 + (360 / this.pool.length) * this.currentResult.index;
  this.deg = randomDeg;
  pointer.style.transition = "transform 5s ease-out";
  pointer.style.transform = `rotate(${randomDeg}deg)`;
};

Game.prototype.showResult = function () {
  let segmentAngle = 360 / this.presentQty;
  let segmentIndex = Math.floor((this.deg % 360) / segmentAngle);
  let resultLabel = this.pool[segmentIndex].label;

  banner.style.display = "block";
  if (resultLabel === "😔") {
    infoText.innerText = "Better luck next time!";
    selectedPresent.innerText = "";
  } else {
    infoText.innerText = "Congratulations!";
    selectedPresent.innerText = resultLabel;

    confetti({
      particleCount: 700,
      spread: 200,
      origin: { y: 0.2 },
      shapes: ["star", "circle", "square"],
    });
  }
};

Game.prototype.getPresent = function () {
  let index = Math.floor(Math.random() * this.pool.length);
  this.currentResult.label = this.pool[index].label;
  this.currentResult.index = index;
};

function closeBanner() {
  var banner = document.querySelector(".banner");
  banner.style.display = "none";
}
