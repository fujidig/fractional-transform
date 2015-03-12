var SRC_K = 10;
var DEST_K = 10;
var IMG_K = 5;

var CHECKER = location.hash == "#checker";

window.onload = () => {
    var img = new Image();
    img.src = "cat-618470_640.jpg";
    img.onload = main.bind(null, img);
};

function add(x, y) {
    return [x[0] + y[0], x[1] + y[1]];
}

function mul(x, y) {
    return [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
}

function norm2(x) {
    return x[0] * x[0] + x[1] * x[1];
}

function conj(x) {
    return [x[0], -x[1]];
}

function scale(x, c) {
    return [c * x[0], c * x[1]];
}

function inv(x) {
    return scale(conj(x), 1 / norm2(x));
}

function div(x, y) {
    return mul(x, inv(y));
}

function main(img) {
    var canvas1 = <HTMLCanvasElement>document.getElementById("src-canvas");
    var canvas2 = <HTMLCanvasElement>document.getElementById("dest-canvas");
    var circle1 = <HTMLCanvasElement>document.getElementById("alpha-circle");
    var circle2 = <HTMLCanvasElement>document.getElementById("beta-circle");
    var w, h;
    w = h = Math.floor(window.innerHeight / 2);
    canvas1.parentElement.style.width = w + "px";
    canvas1.parentElement.style.height = h + "px";
    var sw = Math.floor(w / 2), sh = Math.floor(h / 2);
    var imgCanvas = imgToCanvas(img, sw, sh);
    var src = imgCanvas.getContext("2d").getImageData(0, 0, sw, sh);
    var alpha = [1, 1];
    var beta = [-2, 0];
    drawSrc(canvas1, src, w, h, sw, sh, alpha, beta);
    drawCircle(circle1, "#f12020");
    drawCircle(circle2, "#2071f1");
    moveCircle(circle1, w, h, alpha);
    moveCircle(circle2, w, h, beta);
    
    enableToDrag(circle1, alpha, w, h, update);
    enableToDrag(circle2, beta, w, h, update);

    update();

    function update() {
        drawDest(canvas2, src, w, h, sw, sh, alpha, beta);
    }
}

function drawCircle(canvas: HTMLCanvasElement, color) {
    var ctx = canvas.getContext("2d");
    var sz = 20;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, sz / 2, 0, 2 * Math.PI);
    ctx.fill();
}

function moveCircle(circle, w, h, pos) {
    circle.style.left = (pos[0] * (w / SRC_K) + w / 2 - circle.width / 2) + "px";
    circle.style.top = (pos[1] * (w / SRC_K) + h / 2 - circle.height / 2) + "px";
}

function enableToDrag(circle, pos, w, h, update) {
    var offX, offY;
    var dragging = false;

    circle.addEventListener("touchstart", (e: any) => {
        e.preventDefault();
        offX = e.touches[0].pageX - circle.offsetLeft;
        offY = e.touches[0].pageY - circle.offsetTop;
    });
    circle.addEventListener("touchmove", (e: any) => {
        e.preventDefault();
        move(e.touches[0].pageX, e.touches[0].pageY);
    });
    circle.addEventListener("touchup", (e: any) => {
        e.preventDefault();
    });
    circle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        offX = e.clientX - circle.offsetLeft;
        offY = e.clientY - circle.offsetTop;
        dragging = true;
    });
    document.body.addEventListener("mousemove", (e) => {
        if (dragging) {
            move(e.clientX, e.clientY);
        }
    });
    document.body.addEventListener("mouseup", (e) => {
        e.preventDefault();
        dragging = false;
    });

    function move(x, y) {
        x -= offX, y -= offY;
        circle.style.left = x + "px";
        circle.style.top = y + "px";
        pos[0] = (x - w / 2) * (SRC_K / w);
        pos[1] = (y - h / 2) * (SRC_K / w);
        update();
    }
}

function drawSrc(canvas: HTMLCanvasElement, src, w, h, sw, sh, alpha, beta) {
    canvas.width = w, canvas.height = h;
    var ctx = canvas.getContext("2d");
    var dest = ctx.createImageData(w, h);
    var k = SRC_K / w;
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var i = (y * w + x) * 4;
            var xx = k * (x - w / 2), yy = k * (y - h / 2);
            var color = getPixel(src, sw, sh, xx, yy);
            dest.data[i] = color[0];
            dest.data[i + 1] = color[1];
            dest.data[i + 2] = color[2];
            dest.data[i + 3] = color[3];
        }
    }
    ctx.putImageData(dest, 0, 0);
    ctx.translate(w / 2, h / 2);
    if (!CHECKER) drawAxis(ctx, w, h);
}

function drawDest(canvas, src, w, h, sw, sh, alpha, beta) {
    canvas.width = w, canvas.height = h;
    var ctx = canvas.getContext("2d");
    var dest = ctx.createImageData(w, h);
    var k = DEST_K / w;
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var i = (y * w + x) * 4;
            var xx = k * (x - w / 2), yy = k * (y - h / 2);
            var z = div(add(scale(alpha, -1), mul([xx, yy], beta)), [xx - 1, yy]);
            var pp = z[0], qq = z[1];
            var color = getPixel(src, sw, sh, pp, qq);
            dest.data[i] = color[0];
            dest.data[i + 1] = color[1];
            dest.data[i + 2] = color[2];
            dest.data[i + 3] = color[3];
        }
    }
    ctx.putImageData(dest, 0, 0);
    ctx.translate(w / 2, h / 2);
    if (!CHECKER) drawAxis(ctx, w, h);
}

function getPixel(src, sw, sh, x, y) {
    if (CHECKER) {
        if ((((Math.floor(x) % 2) & 1) ^ ((Math.floor(y) % 2) & 1)) == 0) {
            return [200, 200, 200, 255];
        } else {
            return [255, 255, 255, 255];
        }
    }
    var p = (x / IMG_K + 0.5) * sw, q = (y / IMG_K + 0.5) * sh;
    if (0 <= p && p < sw && 0 <= q && q < sh) {
        var j = (Math.floor(q) * sw + Math.floor(p)) * 4;
        return [src.data[j], src.data[j + 1], src.data[j + 2], src.data[j + 3]];
    }
    return [0, 0, 0, 0];
}

function drawAxis(ctx, w, h) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.moveTo(0, -w / 2);
    ctx.lineTo(0, w / 2);
    ctx.stroke();
}

function imgToCanvas(img: HTMLImageElement, sw, sh) {
    var canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, sw, sh);
    return canvas;
}