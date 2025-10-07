const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// Punkty kwadratu
const x1 = 200, y1 = 200;
const x2 = -200, y2 = 200;
const x3 = 200, y3 = -200;
const x4 = -200, y4 = -200;

// Rysowanie sciezki
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.lineTo(x3, y3);
ctx.lineTo(x4, y4);
ctx.closePath();

// Obrysowanie
ctx.strokeStyle = "#1f3b73";
ctx.lineWidth = 3;
ctx.stroke();
