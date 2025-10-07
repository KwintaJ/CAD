const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// Punkty kwadratu
const x1 = 200, y1 = 50;   // góra
const x2 = 100, y2 = 300;  // lewy dół
const x3 = 300, y3 = 300;  // prawy dół

// Rysowanie sciezki
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.lineTo(x3, y3);
ctx.closePath();

// Obrysowanie
ctx.strokeStyle = "#1f3b73";
ctx.lineWidth = 3;
ctx.stroke();
