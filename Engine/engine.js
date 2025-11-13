//=========================================================
// SILNIK GRAMATYK KSZTALTU

import {Point, Marker, Line, Shape} from './geometry.js';

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
        let middle = [this.dimensions[0] / 2, this.dimensions[1] / 2];
        let quarterLeft = [this.dimensions[0] / 4, this.dimensions[1] / 2];
        let quarterRight = [3 * this.dimensions[0] / 4, this.dimensions[1] / 2];

        for(let i = 0; i < this.left.length; i++) {
            this.left[i].translate(quarterLeft[0], quarterLeft[1]).draw(this.context);
        }

        for(let i = 0; i < this.right.length; i++) {
            this.right[i].translate(quarterRight[0], quarterRight[1]).draw(this.context);
        }

        // strzalka
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
    let f = mkB.f - mkA.f;

    mkA = mkA.rotateAround(new Point(0, 0), f);

    // wyliczenie wektora przesuniecia
    let dx = mkB.p.x - mkA.p.x;
    let dy = mkB.p.y - mkA.p.y;;

    // TODO skalowanie

    return [f, dx, dy, 1];
}

// funkcja sprawdza czy dwa ksztalty sa podobne
// zwraca odwzorowanie lub [-1, ...] jesli nie sa podobne
function checkSimilarity(shA, shB) {
    if (shA.lines.length !== shB.lines.length) return [-1, -1, -1, -1];
    
    // wyliczenie kata obrotu
    let f = shB.getNormalAngle() - shA.getNormalAngle();

    shA = shA.rotateAround(new Point(0, 0), f);

    // wyliczenie wektora przesuniecia
    let dx = shB.centerOfMass.x - shA.centerOfMass.x;
    let dy = shB.centerOfMass.y - shA.centerOfMass.y;

    // TODO skalowanie

    if(shA.translate(dx, dy).equals(shB)) {
        return [f, dx, dy, 1];
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
            let transformation = []
            for(let m = 0; m < p_oneMarkers.length; m++) {
                let trn = checkMarkers(p_oneMarkers[m], twoMarkers[m]);
                if(trn[0] == -1) continue outer;
                transformation.push(trn);
            }
            for(let m = 0; m < p_oneShapes.length; m++) {
                let trn = checkSimilarity(p_oneShapes[m], twoShapes[m]);
                if(trn[0] == -1) continue outer;
                transformation.push(trn);
            }
            let areAllEqual = transformation.every(v => JSON.stringify(v) === JSON.stringify(transformation[0]));
            if(areAllEqual){
                return transformation[0];
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

    // "odchudzanie" i mieszanie zbioru elementow - usuwamy duplikaty, elementy poza canvas i losowo mieszamy
    thinAndShuffle() {
        this.elements = this.elements.filter((p, i, arr) => arr.findIndex(q => q.equals(p)) === i);
        this.elements.sort(() => Math.random() - 0.5);

        for(let i = 0; i < this.elements.length; i++) {
            if(this.elements[i] instanceof Marker) {
                if(this.elements[i].p.outside(this.dimensions)) {
                    this.elements.splice(i, 1);
                }
            }
            if(this.elements[i] instanceof Shape) {
                if(this.elements[i].centerOfMass.outside(this.dimensions)) {
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

                for(let l = N - 1; l >= 0; l--) {
                    let idx = this.subset[l];
                    this.elements.splice(idx, 1);
                }

                for(let l = 0; l < rule.right.length; l++) {
                    this.elements.push(rule.right[l].rotateAround(new Point(0, 0), transformation[0]).translate(transformation[1], transformation[2]))
                }

                this.thinAndShuffle();

                if(expectedDrawingSize != this.elements.length) {
                    this.generate(rule, tries-1);
                }
                
                return;
            }
        } while(this.stepSubset(N))
    }

    // debug
    print() {
        for(let i = 0; i < this.elements.length; i++) {
            console.log(this.elements[i]);
        }
    }
}