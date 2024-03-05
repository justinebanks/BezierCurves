// Created from the knowledge taught in this article on bezier curves: 
// https://javascript.info/bezier-curve

let colors = [];
let blacks = [];

for (let i = 0; i < 100; i++) {
    blacks.push("black");

    let randHue = randRange(160, 290);
    let randLit = randRange(50, 100);
    let randSat = randRange(30, 60);
    colors.push(`hsl(${randHue}, ${randLit}%, ${randSat}%)`);
}

// A line that is characterized by the at() function, which allows you to get a certain position on the line between 0 and 1 (Ex. 0.5 is half way)
class Line {
    constructor(startX, startY, endX, endY, color="white") {
        this.start = { x: startX, y: startY };
        this.end = { x: endX, y: endY };
        this.color = color;
    }

    draw() {
        c.strokeStyle = this.color;
        c.beginPath();
        c.moveTo(this.start.x, this.start.y);
        c.lineTo(this.end.x, this.end.y);
        c.closePath();
        c.stroke();
    }

    at(n, draw=false, color="blue") {
        let lengthX = this.end.x-this.start.x;
        let lengthY = this.end.y-this.start.y;
        let newPoint = { x: 0, y: 0 };

        newPoint.x = this.start.x + lengthX*n;
        newPoint.y = this.start.y + lengthY*n;

        if (draw) {
            c.beginPath();
            c.arc(newPoint.x, newPoint.y, 7.5, 0, Math.PI*2);
            c.fillStyle = color;
            c.fill();
            c.closePath();
        }

        return newPoint;
    }

    static drawLine(startX, startY, endX, endY, color="white") {
        const l = new Line(startX, startY, endX, endY, color);
        l.draw();
    }
}

// A draggable point that's meant to passed to the BezierCurve constructor
class ControlPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.diameter = 15;
        this.color = "red";
        this.isSelected = false;
    }

    isClicked() {
        const xIntersect = isBetween(mouse.x, this.x-this.diameter/2, this.x+this.diameter/2);
        const yIntersect = isBetween(mouse.y, this.y-this.diameter/2, this.y+this.diameter/2);

        if (mouse.clicked && xIntersect && yIntersect) {
            return true;
        }
        else {
            return false;
        }
    }

    draw() {
        c.fillStyle = this.color;
        c.strokeStyle = "white";
        c.beginPath();
        c.arc(this.x, this.y, this.diameter/2, 0, Math.PI*2);
        c.fill();
        c.closePath();
        c.beginPath();
        c.arc(this.x, this.y, this.diameter/2, 0, Math.PI*2);
        c.stroke();
        c.closePath();
    }

    update() {
        if (this.isSelected) {
            this.color = "green";
            this.x = mouse.x;
            this.y = mouse.y;
        }
        else {
            this.color = "red";
        }

        if (this.isClicked()) {
            this.isSelected = !this.isSelected;
        }

        this.draw();
    }
}

// This class is an implementation of De Casteljau’s algorithm as described in the article linked at the top
class BezierCurve {
    constructor(points, speed) {
        this.controlPoints = points;
        this.speed = speed;
        this.lineColor =  `hsl(${randRange(0, 30)}, 100%, 50%)`; //"red";

        this.availableColors = colors
        this.t = 0;
        this.consecutiveLines = [];

        this.verbose = true;
        this.showConsecutiveLines = true;
        this.updateControlPoints = true;

        this.curvePoints = [];
    }


    static async fromJSON() {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [
                {
                description: "JSON Files",
                accept: { "application/json": [".json"] },
                }
            ]
        });

        const file = await fileHandle.getFile();
        const fr = new FileReader();
        
        fr.addEventListener("load", () => {
            console.log(fr.result);
            
            let obj = JSON.parse(fr.result);
            let newPoints = obj.controlPoints.map(point => new ControlPoint(point.x, point.y));

            nextBezierCurve = new BezierCurve(newPoints, obj.speed);

            nextBezierCurve.verbose = obj.verbose;
            nextBezierCurve.showConsecutiveLines = obj.showConsecutiveLines;
            nextBezierCurve.updateControlPoints = obj.updateControlPoints;
        })

        fr.readAsText(file);
    }


    async toJSON() {
        let obj = {
            controlPoints: this.controlPoints, 
            speed: this.speed, 
            verbose: this.verbose,
            showConsecutiveLines: this.showConsecutiveLines,
            updateControlPoints: this.updateControlPoints
        };

        let string = JSON.stringify(obj, null, 4);

        const newHandle = await window.showSaveFilePicker({
            types: [
                {
                    description: "JSON File",
                    accept: { "application/json": [".json"] },
                },
            ],
        });

        const writableStream = await newHandle.createWritable();
        
        await writableStream.write(string);
        await writableStream.close();
    }


    next(lines, n) {
        if (lines.length == 2) {
            let p1 = lines[0].at(this.t, this.verbose, this.verbose ? "blue" : "black");
            let p2 = lines[1].at(this.t, this.verbose, this.verbose ? "blue" : "black");
    
            let finalLine = new Line(p1.x, p1.y, p2.x, p2.y, this.verbose ? "red" : "black");
            
            if (this.verbose) {
                finalLine.draw();
            }
    
            let selected = false;
            for (let i = 0; i < this.controlPoints.length; i++) {
                if (this.controlPoints[i].isSelected) {
                    selected = true;
                }
            }

            const finalPoint = finalLine.at(this.t, true, "red");

            if (!selected) {
                this.curvePoints.push( finalPoint );
            }
            else {
                this.curvePoints = [];
            }

            return;
        }

        let tPoints = [];

        for (let line of lines) {
            let p = line.at(this.t, this.verbose, this.availableColors[n]);
            tPoints.push(p);
        }

        let newLines = [];

        for (let i = 0; i < tPoints.length-1; i++) {
            let newLine = new Line(tPoints[i].x, tPoints[i].y, tPoints[i+1].x, tPoints[i+1].y, this.availableColors[n]);
            
            if (this.verbose) {
                newLine.draw();
            }
            
            newLines.push(newLine);
        }

        this.next(newLines, n+1);
    }


    update() {
        this.consecutiveLines = [];
        this.t += this.speed;

        if (this.t >= 1 || this.t <= 0) {
            this.t += -this.speed;
            this.speed *= -1;
        }

        // Determines position of all consecutive points of the bezier curve
        for (let i = 0; i < this.controlPoints.length-1; i++) {
            const line = new Line(this.controlPoints[i].x, this.controlPoints[i].y, this.controlPoints[i+1].x, this.controlPoints[i+1].y, "orange");
            
            if (this.showConsecutiveLines) {
                line.draw();
            }
            
            this.consecutiveLines.push(line);
        }

        // Run Recursive Function to Handle the narrowing down of lines
        this.next(this.consecutiveLines, 0);

        // Update Control Points
        if (this.updateControlPoints) {
            for (let point of this.controlPoints) {
                point.update();
            } 
        }

        // Draw All Official Points of the Bezier Curve
        for (let i = 0; i < this.curvePoints.length; i++) {
            c.fillStyle = this.lineColor;
            c.beginPath();
            c.fillRect(this.curvePoints[i].x, this.curvePoints[i].y, 8, 8);
            //c.arc(this.curvePoints[i].x, this.curvePoints[i].y, 4, 0, Math.PI*2);
            c.fill();
            c.closePath();
        }
    }
}
