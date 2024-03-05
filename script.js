const cp = new ControlPoint(10, HEIGHT-10);
const cp2 = new ControlPoint(WIDTH/2, HEIGHT-10);
const cp3 = new ControlPoint(WIDTH/2, 10);
const cp4 = new ControlPoint(WIDTH-10, 10);

let controlPoints = [cp, cp2, cp3, cp4];
let visibleControlPoints = true;
let bc = new BezierCurve(controlPoints, SPEED);

let curves = [bc];


function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, WIDTH, HEIGHT);

    for (let curve of curves) {
        curve.update();
    }

    if (nextBezierCurve) {
        controlPoints = nextBezierCurve.controlPoints;
        curves.push(nextBezierCurve);
        nextBezierCurve = null;

        curves[curves.length-2].verbose = false;
        curves[curves.length-2].showConsecutiveLines = false;
        curves[curves.length-2].updateControlPoints = false;
    }

    mouse.clicked = false;
}


function addControlPoint(array_position) {
    const newCp = new ControlPoint(WIDTH/2, HEIGHT/2);

    if (array_position == "start") {
        curves[curves.length-1].controlPoints.unshift(newCp);
    }
    if (array_position == "end") {
        curves[curves.length-1].controlPoints.push(newCp);
    }
    
    newCp.isSelected = true;
}

// Current Unused and Not Working (In Progress)
function addNewCurve() {
    let points = [];
    let pointCount = 3;

    for (let i = 0; i < pointCount; i++) {
        const p = new ControlPoint(WIDTH/pointCount*i, HEIGHT-20);
        points.push(p);
    }

    const newCurve = new BezierCurve(points, SPEED);

    nextBezierCurve = newCurve;
}


function resetProgram() {
    let pointCount = document.getElementById("pointCount").value;

    controlPoints = [];
    curves = [];

    for (let i = 0; i < pointCount; i++) {
        const p = new ControlPoint(WIDTH/pointCount*i, HEIGHT-20);
        controlPoints.push(p);
    }

    curves[0] = new BezierCurve(controlPoints, SPEED);
}


function toggleVerbose() {
    curves[curves.length-1].verbose = !curves[curves.length-1].verbose;

    if (curves[curves.length-1].verbose) {
        curves[curves.length-1].showConsecutiveLines = true;
    }
}

function toggleConsecutiveLines() {
    curves[curves.length-1].showConsecutiveLines = !curves[curves.length-1].showConsecutiveLines;
}


function toggleControls(action) {
    const controlPanel = document.querySelector(".controls");
    if (action == "x") {
        controlPanel.style.display = "none";
    }
    else if (action == "+") {
        controlPanel.style.display = "flex";
    }
}


function toggleControlPoints() {
    curves[curves.length-1].updateControlPoints = !curves[curves.length-1].updateControlPoints;
}


function saveCurve() {
    curves[curves.length-1].toJSON();
}


async function loadCurve() {
    BezierCurve.fromJSON();
}

animate();
