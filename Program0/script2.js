const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

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
    draw() {
        // wyliczenie punktow kwadratu
        const points = [
            rotate([this.p[0] - (this.a / 2) , this.p[1] - (this.a / 2)], this.p, this.f), // lewy górny
            rotate([this.p[0] + (this.a / 2) , this.p[1] - (this.a / 2)], this.p, this.f), // prawy górny
            rotate([this.p[0] + (this.a / 2) , this.p[1] + (this.a / 2)], this.p, this.f), // prawy dolny
            rotate([this.p[0] - (this.a / 2) , this.p[1] + (this.a / 2)], this.p, this.f)  // lewy dolny
        ];

        // rysowanie
        ctx.moveTo(points[0][0], points[0][1]);
        ctx.lineTo(points[1][0], points[1][1]);
        ctx.lineTo(points[2][0], points[2][1]);
        ctx.lineTo(points[3][0], points[3][1]);
        ctx.closePath();

        ctx.strokeStyle = "#1f3b73";
        ctx.lineWidth = 4;
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
}

class Drawing {
    constructor(E) {
        this.elements = E; // lista kwadratow i markerow
    }

    // przedstawianie rysunka na kanwie
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < this.elements.length; i++) {
            if(this.elements[i] instanceof Square) {
                this.elements[i].draw();
            }
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

ruleMarkerLeft = new Marker(1, 0, 0, 0);
ruleMarkerRight = new Marker(1, 60, -60, Math.PI/4);
ruleSquareRight = new Square(0, 0, 100, 0);
rule1 = new ProductionRule(ruleMarkerLeft, [ruleMarkerRight, ruleSquareRight]);

startingSquare = new Square(75, 425, 100, 0);
startingMarker = new Marker(1, (75 + 60), (425 - 60), Math.PI/4);

// zdefiniowanie reguly produkcji
ruleMarkerLeft = new Marker(1, [0,  0], 0);
ruleMarkerRight = new Marker(1, [45, -45], Math.PI/8.2);
ruleSquareRight = new Square([0, 0], 80, 0);
rule1 = new ProductionRule(ruleMarkerLeft, [ruleMarkerRight, ruleSquareRight]);

// zdefiniowanie obrazka startowego
startingSquare = new Square([115, 170], 80, 0);
startingMarker = new Marker(1, [(115 + 45), (170 - 45)], Math.PI/8.2);

// rozpoczecie rysowania
drawing = new Drawing([startingSquare, startingMarker]);
drawing.draw();

// za kazdym kliknieciem myszka stosujemy regule produkcji w kazdym
// miejscu gdzie znajdziemy dopasowanie i rysujemy nowy rysunek
canvas.addEventListener("click", (event) => {
    drawing.generate(rule1);
    drawing.draw();
});
