const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// funkcja rysujaca kwadrat
// o srodku (x, y) i dlugosci boku A
function drawSquare(x, y, A) 
{
    let B = Math.floor(A/2)
    ctx.beginPath();
    ctx.moveTo((x - B), (y - B));
    ctx.lineTo((x + B), (y - B));
    ctx.lineTo((x + B), (y + B));
    ctx.lineTo((x - B), (y + B));
    ctx.closePath();

    ctx.strokeStyle = "#1f3b73";
    ctx.lineWidth = 3;
    ctx.stroke();
}

drawSquare(100, 200, 150)
