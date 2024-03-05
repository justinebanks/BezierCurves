const WIDTH = window.innerWidth-20;
const HEIGHT = window.innerHeight-50;
const SPEED = 0.002;

const canvas = document.getElementById("cnvs");
const c = canvas.getContext("2d");

canvas.width = WIDTH;
canvas.height = HEIGHT;

let mouse = { x: 0, y: 0, clicked: false };
let nextBezierCurve;

document.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener("mousedown", e => {
    mouse.clicked = true;
})


function isBetween(n, min, max) {
    return n > min && n < max;
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}