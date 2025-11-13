//=========================================================
// SILNIK GRAMATYK KSZTALTU

import {Point, Marker, Line, Shape} from './geometry.js';

const POINT_ZERO = new Point(0, 0);

export class ProductionRule {
    constructor(L, R, c, d) {
        this.left = L; // lista ksztaltow i markerow po lewej stronie reguly produkcji 
        this.right = R; // lista ksztaltow i markerow po prawej stronie reguly produkcji 
                        // przesuniecie, obrot i skala oznaczony jest na elementach z prawej strony
                        // strony reguly produkcji sa rownane do lewego gornego rogu
        this.context = c;
        this.dimensions = d;
    }

    draw() {
        // punkty do ktorych przesuwamy rysunek reguly
        let middle = [this.dimensions[0] / 2, this.dimensions[1] / 2];
        let quarterLeft = [this.dimensions[0] / 4, this.dimensions[1] / 2];
        let quarterRight = [3 * this.dimensions[0] / 4, this.dimensions[1] / 2];

        // rysowanie lewej strony
        for(let i = 0; i < this.left.length; i++) {
            this.left[i].translate(quarterLeft[0], quarterLeft[1]).draw(this.context);
        }

        // rysowanie prawej strony
        for(let i = 0; i < this.right.length; i++) {
            this.right[i].translate(quarterRight[0], quarterRight[1]).draw(this.context);
        }

        // rysowanie strzalki
        this.context.beginPath();
        this.context.moveTo(middle[0]-20, middle[1]);
        this.context.lineTo(middle[0]+20, middle[1]);
        this.context.lineTo(middle[0]+18, middle[1]-2);
        this.context.moveTo(middle[0]+20, middle[1]);
        this.context.lineTo(middle[0]+18, middle[1]+2);

        this.context.strokeStyle = "#111111";
        this.context.lineWidth = 1;
        this.context.stroke();
    }
}

// funkcja zwraca wszystkie permutacje tablicy
function permute(arr) {
    if (arr.length <= 1) return [arr.slice()];
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        const el = arr[i];
        const rest = arr.slice(0, i).concat(arr.slice(i + 1));
        const restPerms = permute(rest);
        for (const p of restPerms) {
            res.push([el].concat(p));
        }
    }
    return res;
}


// funkcja zwraca odwzorowanie lub [-1, ...] jesli nie sa tego samego typu
function checkMarkers(mkA, mkB) {
    if(mkA.t != mkB.t) return [-1, -1, -1, -1];

    // wyliczenie kata obrotu
    let f = ((mkB.f - mkA.f)) % (2 * Math.PI);

    mkA = mkA.rotateAround(POINT_ZERO, f);

    // wyliczenie skali
    let s = (mkB.s / mkA.s);

    mkA = mkA.scaleAround(POINT_ZERO, s);

    // wyliczenie wektora przesuniecia
    let dx = (mkB.p.x - mkA.p.x);
    let dy = (mkB.p.y - mkA.p.y);

    return [f, dx, dy, s];
}

// funkcja sprawdza czy dwa ksztalty sa podobne
// zwraca odwzorowanie lub [-1, ...] jesli nie sa podobne
function checkSimilarity(shA, shB) {
    if (shA.lines.length !== shB.lines.length) return [-1, -1, -1, -1];

    console.log(".");
    console.log(shA);
    console.log(shB);

    // wyliczenie kata obrotu
    let f = shB.getNormalAngle() - shA.getNormalAngle() % (2 * Math.PI);

    shA = shA.rotateAround(POINT_ZERO, f);

    // wyliczenie skali
    let s = shB.circumference / shA.circumference;

    shA = shA.scaleAround(POINT_ZERO, s);

    // wyliczenie wektora przesuniecia
    let dx = shB.centerOfMass.x - shA.centerOfMass.x;
    let dy = shB.centerOfMass.y - shA.centerOfMass.y;

    shA = shA.translate(dx, dy);

    if(shA.equals(shB)) {
        console.log([f, dx, dy, s])
        return [f, dx, dy, s];
    }

    return [-1, -1, -1, -1];
}

// porownanie czy dwie listy dlugosci N zawierajace markery i ksztalty
// pasuja do siebie (tzn czy istnieje takie jedno odwzorowanie
// ktore przesuwa wszystkie rzeczy z "one" na "two")
// 
// zwraca to odwzorowanie w postaci 
//      [katObrotu, wektorPrzesunieciaX, wektorPrzesunieciaY, wspolczynnikSkali]
// lub [-1, -1, -1, -1] jesli nie istnieje
function compareFitting(one, two, N, C) {
    // rozdzielenie markerow od ksztaltow
    let oneMarkers = [];
    let oneShapes = [];
    let twoMarkers = [];
    let twoShapes = [];

    for(let i = 0; i < N; i++) {
        if(one[i] instanceof Marker) oneMarkers.push(one[i]);
        if(one[i] instanceof Shape) oneShapes.push(one[i]);        
        if(two[i] instanceof Marker) twoMarkers.push(two[i]);
        if(two[i] instanceof Shape) twoShapes.push(two[i]);
    }

    if(oneMarkers.length != twoMarkers.length || oneShapes.length != twoShapes.length) {
        return [-1, -1, -1, -1];
    }

    for(const p_oneMarkers of permute(oneMarkers)) {
        outer: for(const p_oneShapes of permute(oneShapes)) {
            let transformations = [];
            for(let m = 0; m < p_oneMarkers.length; m++) {
                let trn = checkMarkers(p_oneMarkers[m], twoMarkers[m]);
                if(trn[0] == -1) {
                    transformations = [];
                    continue outer;
                }
                transformations.push(trn);
            }
            for(let m = 0; m < p_oneShapes.length; m++) {
                let trn = checkSimilarity(p_oneShapes[m], twoShapes[m]);
                if(trn[0] == -1) {
                    transformations = [];
                    continue outer;
                }
                transformations.push(trn);
            }
            let areAllEqual = true;
            for(let m = 1; m < transformations.length; m++) {
                if(Math.abs(transformations[0][0] - transformations[m][0]) > 0.1) areAllEqual = false;
                if(Math.abs(transformations[0][1] - transformations[m][1]) > 0.1) areAllEqual = false;
                if(Math.abs(transformations[0][2] - transformations[m][2]) > 0.1) areAllEqual = false;
                if(Math.abs(transformations[0][3] - transformations[m][3]) > 0.1) areAllEqual = false;
            }

            if(areAllEqual){
                return transformations[0];
            }
        }
    }

    return [-1, -1, -1, -1];
}

export class Drawing {
    constructor(e, c, d) {
        this.elements = e; // lista kwadratow i markerow
        this.context = c;
        this.subset = [];
        this.dimensions = d;
    }

    // "odchudzanie" i mieszanie zbioru elementow
    // usuwamy duplikaty, elementy poza canvas i elementy za male
    // i losowo mieszamy
    thinAndShuffle() {
        this.elements = this.elements.filter((p, i, arr) => arr.findIndex(q => q.equals(p)) === i);
        this.elements.sort(() => Math.random() - 0.5);

        for(let i = 0; i < this.elements.length; i++) {
            if(this.elements[i] instanceof Marker) {
                if(this.elements[i].p.outside(this.dimensions) || this.elements[i].s < 0.2) {
                    this.elements.splice(i, 1);
                }
            }
            if(this.elements[i] instanceof Shape) {
                if(this.elements[i].centerOfMass.outside(this.dimensions) || this.elements[i].circumference < 10) {
                    this.elements.splice(i, 1);
                }
            }
        }
    }

    // przedstawianie rysunka na kanwie
    draw() {
        this.context.clearRect(0, 0, this.dimensions[0], this.dimensions[1]);
        for(let i = 0; i < this.elements.length; i++) {
            this.elements[i].draw(this.context);
        }
    }

    // wybor pierwszego podzbioru z rysunka
    initSubset(N) {
        this.subset = [];
        for(let i = 0; i < N; i++) {
            this.subset.push(i);
        }
    }

    // kolejny podzbior
    stepSubset(N) {
        let i = N - 1;

        // wybranie pozycji do zwiekszenia
        while (i >= 0 && this.subset[i] === this.elements.length - N + i) {
            i--;
        }

        // nie da sie zwiekszyc - koniec petli
        if (i < 0) {
            return false;
        }

        this.subset[i]++;

        // ustawienie indeksow po kolei
        for (let j = i + 1; j < N; j++) {
            this.subset[j] = this.subset[j - 1] + 1;
        }

        return true;
    }

    // generowanie kolejnego rysunka stosujac regule produkcji r
    generate(rule, tries) {
        if(tries <= 0) return;

        let N = rule.left.length; // liczba elementow lewej strony reguly
        if(N > this.elements.length) {
            return;
        }

        let expectedDrawingSize = (this.elements.length - N) + rule.right.length;

        // znajdywanie dopasowan:
        // wybieramy N-elementowy podzbior elementow rysunka
        // sprawdzamy czy istnieje przeksztalcenie geometryczne, 
        // ktore obraca/przesuwa/skaluje lewa strone reguly na dany podzbior
        this.initSubset(N);
        do {
            let subDrawing = [];
            for(let k = 0; k < N; k++) {
                subDrawing.push(this.elements[this.subset[k]]);
            }

            let transformation = compareFitting(rule.left, subDrawing, N)
            if(transformation[0] != -1) {
                // jesli znalezlismy dopasowanie:
                // trzeba usunac dopasowane elementy i zastapic je wszystkim
                // z prawej strony reguly po przeksztalceniu

                console.log(transformation);

                for(let l = N - 1; l >= 0; l--) {
                    let idx = this.subset[l];
                    this.elements.splice(idx, 1);
                }

                for(let l = 0; l < rule.right.length; l++) {
                    this.elements.push(rule.right[l].scaleAround(POINT_ZERO, transformation[3]).rotateAround(POINT_ZERO, transformation[0]).translate(transformation[1], transformation[2]))
                }

                this.thinAndShuffle();

                if(expectedDrawingSize != this.elements.length) {
                    this.generate(rule, tries-1);
                }

                return;
            }
        } while(this.stepSubset(N))
    }
}