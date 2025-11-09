//=========================================================
// SILNIK GRAMATYK KSZTALTU

import {Point, Marker, Line, Shape} from './geometry.js';

export class ProductionRule {
    constructor(L, R, c) {
        this.left = L; // lista ksztaltow i markerow po lewej stronie reguly produkcji 
        this.right = R; // lista ksztaltow i markerow po prawej stronie reguly produkcji 
                        // przesuniecie, obrot i skala oznaczony jest na elementach z prawej strony
                        // strony reguly produkcji sa rownane do lewego gornego rogu
        this.context = c;
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
    constructor(e, c) {
        this.elements = e; // lista kwadratow i markerow
        this.context = c;
        this.subset = [];
    }

    // "odchudzanie" i mieszanie zbioru elementow - usuwamy duplikaty i losowo mieszamy
    thinAndShuffle() {
        this.elements = this.elements.filter((p, i, arr) => arr.findIndex(q => q.equals(p)) === i);
        this.elements.sort(() => Math.random() - 0.5);
        console.log(this.elements.length);
    }

    // przedstawianie rysunka na kanwie
    draw() {
        this.thinAndShuffle();

        this.context.clearRect(0, 0, canvas1.width, canvas1.height);
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
    generate(rule) {
        let N = rule.left.length; // liczba elementow lewej strony reguly
        if(N > this.elements.length) {
            return;
        }

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
                    // TO DO
                    // dopisac, jezeli rysunek sie nie zmienia
                    // generacja w innym miejscu
                    this.elements.push(rule.right[l].rotateAround(new Point(0, 0), transformation[0]).translate(transformation[1], transformation[2]))
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