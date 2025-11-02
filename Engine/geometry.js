//=========================================================
// KLASY GEOMETRYCZNE

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // przesuniecie punktu o wektor [x, y]; zwraca new Point()
    translate(x, y) {
        return new Point(this.x + x, this.y + y);
    }

    // obrot punktu wzgledem punktu g o kat f; zwraca new Point()
    rotate(g, f) {
        return new Point((this.x - g.x) * Math.cos(f) - (this.y - g.y) * Math.sin(f) + g.x,
                         (this.x - g.x) * Math.sin(f) + (this.y - g.y) * Math.cos(f) + g.y);
    }
}


export class Marker {
    constructor(p, f, t) {
        // wspolrzedne
        this.p = p;

        // kat obrotu w radianach
        this.f = f;
        
        // typ markera (int)
        this.t = t;

    }

    draw(ctx) {
        let b = this.p.translate(0, -10).rotate(this.p, this.f);
        let c = this.p.translate(5, -6).rotate(this.p, this.f);

        ctx.beginPath();
        ctx.moveTo(this.p.x, this.p.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);

        ctx.strokeStyle = "#ffa45c";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    translate(x, y) {
        return new Marker(this.p.translate(x, y), this.f, this.t);
    }

    rotate(f) {
        return new Marker(this.p.rotate(this.p, f), this.f + f, this.t);
    }
}

export class Line {
    constructor(a, b) {
        // wspolrzedne koncow odcinka
        this.a = a;
        this.b = b;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.b.x, this.b.y);

        ctx.strokeStyle = "#2c5aa0";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    translate(x, y) {
        return new Line(this.a.translate(x, y), this.b.translate(x, y));
    }

    rotate(g, f) {
        return new Line(this.a.rotate(g, f), this.b.rotate(g, f));
    }
}

export class Shape {
    constructor(e) {
        this.lines = e;
        this.centerOfMass = this.calculateCenterOfMass()
    }
    
    calculateCenterOfMass() {
        let points = [];

        for (let line of this.lines) {
            points.push(line.a);
            points.push(line.b);
        }

        let uniquePoints = [];
        for (let p of points) {
            if (!uniquePoints.some(q => Math.abs(q.x - p.x) < 0.001 && Math.abs(q.y - p.y) < 0.001)) {
                uniquePoints.push(p);
            }
        }

        let sumX = 0, sumY = 0;
        for (let p of uniquePoints) {
            sumX += p.x;
            sumY += p.y;
        }

        return new Point(sumX / uniquePoints.length, sumY / uniquePoints.length);
    }

    draw(ctx) {
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].draw(ctx)
        }
    }

    translate(x, y) {
        let newLines = [];
        for (let i = 0; i < this.lines.length; i++) {
            newLines.push(this.lines[i].translate(x, y));
        }
        return new Shape(newLines);
    }

    rotate(f) {
        let newLines = [];
        for (let i = 0; i < this.lines.length; i++) {
            newLines.push(this.lines[i].rotate(this.centerOfMass, f));
        }
        return new Shape(newLines);
    }
}