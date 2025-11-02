//=========================================================
// SILNIK GRAMATYK KSZTALTU

export class ProductionRule {
    constructor(L, R, c) {
        this.left = L; // lista ksztaltow i markerow po lewej stronie reguly produkcji 
        this.right = R; // lista ksztaltow i markerow po prawej stronie reguly produkcji 
                        // przesuniecie, obrot i skala oznaczony jest na elementach z prawej strony
                        // strony reguly produkcji sa rownane do lewego gornego rogu
        this.context = c;
    }
}

export class Drawing {
    constructor(e, c) {
        this.elements = e; // lista kwadratow i markerow
        this.context = c;
    }

    // przedstawianie rysunka na kanwie
    draw() {
        this.context.clearRect(0, 0, canvas1.width, canvas1.height);
        for(let i = 0; i < this.elements.length; i++) {
            this.elements[i].draw(this.context);
        }
    }

    // generowanie kolejnego rysunka stosujac regule produkcji r
    generate(r) {
        
    }

    // debug
    print() {
        for(let i = 0; i < this.elements.length; i++) {
            console.log(this.elements[i]);
        }
    }
}