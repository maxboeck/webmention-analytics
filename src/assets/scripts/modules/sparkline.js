/* Canvas-Sparkline by Jeremy Keith */
/* https://github.com/adactio/Canvas-Sparkline */

const SELECTORS = {
    sparkline: '.js-sparkline'
}

function drawSparkline(canvasElement, data, endpoint, color, style) {
    if (window.HTMLCanvasElement) {
        var c = canvasElement,
            ctx = c.getContext('2d'),
            color = color ? color : 'rgba(0,0,0,0.5)',
            style = style == 'bar' ? 'bar' : 'line',
            height = c.height - 6,
            width = c.width,
            total = data.length,
            max = Math.max.apply(Math, data),
            xstep = width / total,
            ystep = max / height,
            x = 0,
            y = height - data[0] / ystep,
            i
        if (window.devicePixelRatio) {
            c.width = c.width * window.devicePixelRatio
            c.height = c.height * window.devicePixelRatio
            c.style.width = c.width / window.devicePixelRatio + 'px'
            c.style.height = c.height / window.devicePixelRatio + 'px'
            c.style.display = 'inline-block'
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }
        ctx.clearRect(0, 0, width, height)
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.moveTo(x, y)
        for (i = 1; i < total; i = i + 1) {
            x = x + xstep
            y = height - data[i] / ystep + 2
            if (style == 'bar') {
                ctx.moveTo(x, height)
            }
            ctx.lineTo(x, y)
        }
        ctx.stroke()
        if (endpoint && style == 'line') {
            ctx.beginPath()
            ctx.fillStyle = '#00bff8'
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fill()
        }
    }
}

function getColor() {
    let lineColor = getComputedStyle(document.body).getPropertyValue('--line-color');
    console.log(lineColor);
    return lineColor;
}

function drawSparklines() {
    const containers = document.querySelectorAll(SELECTORS.sparkline)
    if (containers) {
        containers.forEach((container) => {
            const canvas = container.querySelector('canvas')
            const values = container.dataset.values
    
            if (canvas && values) {
                const data = values.split(',').map((i) => parseInt(i, 10))
                drawSparkline(canvas, data, true, getColor())
            }
        })
    }
}

window.addEventListener('load', function() {
    drawSparklines();
});