﻿window.onload = function () {
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

var SRC_K = 10;
var DEST_K = 10;

function main(img) {
    var canvas1 = document.getElementById("src-canvas");
    var canvas2 = document.getElementById("dest-canvas");
    var circle1 = document.getElementById("alpha-circle");
    var circle2 = document.getElementById("beta-circle");
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

function drawCircle(canvas, color) {
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
    console.log(circle.style.top, circle.style.left);
}

function enableToDrag(circle, pos, w, h, update) {
    var offX, offY;

    circle.addEventListener("touchstart", function (e) {
        e.preventDefault();
        offX = e.touches[0].pageX - circle.offsetLeft;
        offY = e.touches[0].pageY - circle.offsetTop;
        document.body.style.background = "red";
    });
    circle.addEventListener("touchmove", function (e) {
        e.preventDefault();
        var x = e.touches[0].pageX - offX, y = e.touches[0].pageY - offY;
        circle.style.left = x + "px";
        circle.style.top = y + "px";
        pos[0] = (x - w / 2) * (SRC_K / w);
        pos[1] = (y - h / 2) * (SRC_K / w);
        update();
        document.body.style.background = "yellow";
    });
    circle.addEventListener("touchend", function (e) {
        e.preventDefault();
        document.body.style.background = "blue";
    });
}

// ref: http://stackoverflow.com/questions/7278409/html5-drag-and-drop-to-move-a-div-anywhere-on-the-screen
function enableToDrag2(circles, poses, container, w, h, update) {
    var elem, pos, offX, offY;
    function dragstart(p, event) {
        elem = this;
        pos = p;
        event.dataTransfer.setData("text/plain", "");
        var style = window.getComputedStyle(event.target, null);
        offX = parseInt(style.getPropertyValue("left")) - event.clientX;
        offY = parseInt(style.getPropertyValue("top")) - event.clientY;
    }
    function dragover(event) {
        var x = event.clientX + offX, y = event.clientY + offY;
        pos[0] = x - w / 2;
        pos[1] = y - h / 2;
        update();
        elem.style.display = "none";
        event.preventDefault();
    }
    function drop(event) {
        var x = event.clientX + offX, y = event.clientY + offY;
        pos[0] = x - w / 2;
        pos[1] = y - h / 2;
        update();
        elem.style.display = "";
        elem.style.left = x + "px";
        elem.style.top = y + "px";
        event.preventDefault();
    }
    circles.forEach(function (circle, i) {
        circle.draggable = true;
        circle.addEventListener("dragstart", dragstart.bind(circle, poses[i]), false);
    });
    container.addEventListener("dragover", dragover, false);
    container.addEventListener("drop", drop, false);
}

function drawSrc(canvas, src, w, h, sw, sh, alpha, beta) {
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
    //drawAxis(ctx, w, h);
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

            /*
            var p = pp + sw / 2, q = qq + sh / 2;
            if (0 <= p && p < sw && 0 <= q && q < sh) {
            var j = (Math.floor(q) * sw + Math.floor(p)) * 4;
            dest.data[i] = src.data[j];
            dest.data[i + 1] = src.data[j + 1];
            dest.data[i + 2] = src.data[j + 2];
            dest.data[i + 3] = src.data[j + 3]
            }*/
            var color = getPixel(src, sw, sh, pp, qq);
            dest.data[i] = color[0];
            dest.data[i + 1] = color[1];
            dest.data[i + 2] = color[2];
            dest.data[i + 3] = color[3];
        }
    }
    ctx.putImageData(dest, 0, 0);
    ctx.translate(w / 2, h / 2);
    //drawAxis(ctx, w, h);
}

function getPixel(src, sw, sh, x, y) {
    /*var p = x + sw / 2, q = y + sh / 2;
    if (0 <= p && p < sw && 0 <= q && q < sh) {
    var j = (Math.floor(q) * sw + Math.floor(p)) * 4;
    return [src.data[j], src.data[j + 1], src.data[j + 2], src.data[j + 3]];
    }
    return [0, 0, 0, 0];*/
    if ((((Math.floor(x) % 2) & 1) ^ ((Math.floor(y) % 2) & 1)) == 0) {
        return [200, 200, 200, 255];
    } else {
        return [255, 255, 255, 0];
    }
}

function drawAxis(ctx, w, h) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.moveTo(0, -w / 2);
    ctx.lineTo(0, w / 2);
    ctx.stroke();
}

function imgToCanvas(img, sw, sh) {
    var canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, sw, sh);
    return canvas;
}
//# sourceMappingURL=app.js.map
