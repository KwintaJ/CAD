const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

class Marker {
    constructor(t, x, y, f) {
        // typ markera (int)
        this.t = t

        // wspolrzedne
        this.x = x
        this.y = y

        // kat obrotu w radianach
        this.f = f
    }
}

class Square {
    constructor(x, y, a, f) {
        // wspolrzedne srodka
        this.x = x
        this.y = y

        // dlugosc boku
        this.a = a

        // kat obrotu (wokolo srodka) w radianach
        this.f = f
    }

    // funkcja rysujaca kwadrat
    draw() {
        // wyliczenie punktow nieobroconego kwadratu
        const points = [
            [ (this.a / 2) * -1 , (this.a / 2) * -1], // lewy górny
            [ (this.a / 2)      , (this.a / 2) * -1], // prawy górny
            [ (this.a / 2)      , (this.a / 2)],      // prawy dolny
            [ (this.a / 2) * -1 , (this.a / 2)]       // lewy dolny
        ];

        const rotated = points.map(([px, py]) => {
            const rx = this.x + px * Math.cos(this.f) - py * Math.sin(this.f);
            const ry = this.y + px * Math.sin(this.f) + py * Math.cos(this.f);
            return [rx, ry];
        });

        // rysowanie
        ctx.beginPath();
        ctx.moveTo(rotated[0][0], rotated[0][1]);
        ctx.lineTo(rotated[1][0], rotated[1][1]);
        ctx.lineTo(rotated[2][0], rotated[2][1]);
        ctx.lineTo(rotated[3][0], rotated[3][1]);
        ctx.closePath();

        ctx.strokeStyle = "#1f3b73";
        ctx.lineWidth = 3;
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
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
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
                        if(r.right[j] instanceof Square) {
                            let newSquare = new Square(
                                (this.elements[i].x + r.right[j].x),
                                (this.elements[i].y + r.right[j].y),
                                r.right[j].a,
                                (this.elements[i].f + r.right[j].f)
                            );

                            this.elements.push(newSquare);
                        }
                        if(r.right[j] instanceof Marker) {
                            this.elements.push(new Marker(
                                r.right[j].t,
                                (this.elements[i].x + r.right[j].x),
                                (this.elements[i].y + r.right[j].y),
                                (this.elements[i].f + r.right[j].f)
                                )
                            );
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

drawing = new Drawing([startingSquare, startingMarker]);
drawing.draw();

canvas.addEventListener("click", (event) => {
    drawing.generate(rule1);
    drawing.draw();
});

