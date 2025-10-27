const canvas1 = document.getElementById("canvas1");
const ctx1 = canvas1.getContext("2d");

const canvas2 = document.getElementById("canvas2");
const ctxR = canvas2.getContext("2d");

// obrot punktu p wzgleddem punktu o o kat f
function rotate(p, o, f) {
    const dx = p[0] - o[0];
    const dy = p[1] - o[1];

    const xNew = dx * Math.cos(f) - dy * Math.sin(f) + o[0];
    const yNew = dx * Math.sin(f) + dy * Math.cos(f) + o[1];

    return [xNew, yNew];
}

class Marker {
    constructor(t, p, f) {
        // typ markera (int)
        this.t = t;

        // wspolrzedne
        this.p = p;

        // kat obrotu w radianach
        this.f = f;
    }

    draw(ctx) {
        const points = [
            this.p,
            rotate([this.p[0] , this.p[1] - 10], this.p, this.f),
            rotate([this.p[0] + 5 , this.p[1] - 6], this.p, this.f),
        ];

        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        ctx.lineTo(points[1][0], points[1][1]);
        ctx.lineTo(points[2][0], points[2][1]);

        ctx.strokeStyle = "#ffa45c";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class Square {
    constructor(p, a, f) {
        // wspolrzedne srodka
        this.p = p;
        
        // dlugosc boku
        this.a = a;

        // kat obrotu (wokolo srodka) w radianach
        this.f = f;
    }

    // funkcja rysujaca kwadrat
    draw(ctx) {
        // wyliczenie punktow kwadratu
        const points = [
            rotate([this.p[0] - (this.a / 2) , this.p[1] - (this.a / 2)], this.p, this.f), // lewy górny
            rotate([this.p[0] + (this.a / 2) , this.p[1] - (this.a / 2)], this.p, this.f), // prawy górny
            rotate([this.p[0] + (this.a / 2) , this.p[1] + (this.a / 2)], this.p, this.f), // prawy dolny
            rotate([this.p[0] - (this.a / 2) , this.p[1] + (this.a / 2)], this.p, this.f)  // lewy dolny
        ];

        // rysowanie
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        ctx.lineTo(points[1][0], points[1][1]);
        ctx.lineTo(points[2][0], points[2][1]);
        ctx.lineTo(points[3][0], points[3][1]);
        ctx.closePath();

        ctx.fillStyle = "rgba(126, 182, 255, 0.25)";
        ctx.fill();

        ctx.strokeStyle = "#2c5aa0";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

class ProductionRule {
    constructor(l, R) {
        this.left = l; // marker po lewej stronie reguly produkcji
                       // lewa strona ma zawsze wspolrzedne i obrot na zero
        this.right = R; // lista kwadratow i markerow po prawej stronie reguly produkcji 
                        // przesuniecie i obrot oznaczony jest na elementach z prawej strony
    }

    draw() {
        ctxR.clearRect(0, 0, ctxR.canvas.width, ctxR.canvas.height);

        const w = ctxR.canvas.width;
        const h = ctxR.canvas.height;
        const centerY = h / 2;

        // punkt odniesienia dla lewej i prawej strony
        const leftOrigin = [w * 0.25, centerY];
        const rightOrigin = [w * 0.65, centerY];

        // rysowanie lewej strony (tylko marker)
        ctxR.save();
        const leftMarker = new Marker(
            this.left.t,
            leftOrigin,
            this.left.f
        );
        leftMarker.draw(ctxR);
        ctxR.restore();

        // strzałka 
        ctxR.beginPath();
        ctxR.strokeStyle = "#222";
        ctxR.lineWidth = 1.5;
        ctxR.moveTo(leftOrigin[0] + 50, centerY);
        ctxR.lineTo(rightOrigin[0] - 50, centerY);
        ctxR.stroke();

        ctxR.beginPath();
        ctxR.moveTo(rightOrigin[0] - 50, centerY);
        ctxR.lineTo(rightOrigin[0] - 58, centerY - 5);
        ctxR.lineTo(rightOrigin[0] - 58, centerY + 5);
        ctxR.closePath();
        ctxR.fillStyle = "#222";
        ctxR.fill();

        // rysowanie prawej strony reguły (markery i kwadraty)
        ctxR.save();
        ctxR.translate(rightOrigin[0], rightOrigin[1]);

        for (let i = 0; i < this.right.length; i++) {
            if (this.right[i] instanceof Square) {
                const s = new Square([this.right[i].p[0] + 20, this.right[i].p[1]], this.right[i].a, this.right[i].f);
                s.draw(ctxR);
            } else if (this.right[i] instanceof Marker) {
                const m = new Marker(this.right[i].t, [this.right[i].p[0] + 20, this.right[i].p[1]], this.right[i].f);
                m.draw(ctxR);
            }
        }
    }
}

class Drawing {
    constructor(E) {
        this.elements = E; // lista kwadratow i markerow
    }

    // przedstawianie rysunka na kanwie
    draw() {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        for(let i = 0; i < this.elements.length; i++) {
            this.elements[i].draw(ctx1);
        }
    }

    // generowanie kolejnego rysunka stosujac regule produkcji r
    generate(r) {
        let numOfElements = this.elements.length;
        for(let i = 0; i < numOfElements; i++) {
            if(this.elements[i] instanceof Marker && r.left instanceof Marker) {
                if(this.elements[i].t == r.left?.t) {
                    for(let j = 0; j < r.right.length ; j++) {
                        const newPoints = rotate([(this.elements[i].p[0] + r.right[j].p[0]),
                                                  (this.elements[i].p[1] + r.right[j].p[1])],
                                                 this.elements[i].p,
                                                 this.elements[i].f
                            );
                        
                        if(r.right[j] instanceof Square) {
                            let newSquare = new Square(
                                newPoints,
                                r.right[j].a,
                                (this.elements[i].f + r.right[j].f)
                            );

                            this.elements.push(newSquare);
                        }
                        if(r.right[j] instanceof Marker) {
                            let newMarker = new Marker(
                                r.right[j].t,
                                newPoints,
                                (this.elements[i].f + r.right[j].f)
                            );

                            this.elements.push(newMarker);
                        }
                    }
                    this.elements.splice(i, 1);
                    i--;
                    numOfElements--;
                }
            }
        }
    }

    // debug
    print() {
        for(let i = 0; i < this.elements.length; i++) {
            console.log(this.elements[i]);
        }
    }
}

// zdefiniowanie reguly produkcji
ruleMarkerLeft = new Marker(1, [0,  0], 0);
ruleMarkerRight = new Marker(1, [60, -60], 0);
ruleSquareRight = new Square([0, 0], 100, 0);
rule1 = new ProductionRule(ruleMarkerLeft, [ruleMarkerRight, ruleSquareRight]);
rule1.draw()

// zdefiniowanie obrazka startowego
startingSquare = new Square([250, 250], 100, 0);
startingMarker1 = new Marker(1, [(250 + 60), (250 - 60)], 0);
startingMarker2 = new Marker(1, [(250 - 60), (250 + 60)], Math.PI);

// rozpoczecie rysowania
drawing = new Drawing([startingSquare, startingMarker1, startingMarker2]);
drawing.draw();

// za kazdym kliknieciem myszka stosujemy regule produkcji w kazdym
// miejscu gdzie znajdziemy dopasowanie i rysujemy nowy rysunek
canvas1.addEventListener("click", (event) => {
    drawing.generate(rule1);
    drawing.draw();
});
