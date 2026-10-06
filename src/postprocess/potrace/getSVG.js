/**
 * Generate SVG string from a path list
 */
export default function getSVG(pathList, size = 1, optType) {
    function pathToSvg(curve) {
        function bezier(i) {
            let b = 'C ' + (curve.c[i * 3 + 0].x * size).toFixed(3) + ' ' +
                (curve.c[i * 3 + 0].y * size).toFixed(3) + ',';
            b += (curve.c[i * 3 + 1].x * size).toFixed(3) + ' ' +
                (curve.c[i * 3 + 1].y * size).toFixed(3) + ',';
            b += (curve.c[i * 3 + 2].x * size).toFixed(3) + ' ' +
                (curve.c[i * 3 + 2].y * size).toFixed(3) + ' ';
            return b;
        }
        function segment(i) {
            let s = 'L ' + (curve.c[i * 3 + 1].x * size).toFixed(3) + ' ' +
                (curve.c[i * 3 + 1].y * size).toFixed(3) + ' ';
            s += (curve.c[i * 3 + 2].x * size).toFixed(3) + ' ' +
                (curve.c[i * 3 + 2].y * size).toFixed(3) + ' ';
            return s;
        }
        const n = curve.n;
        let p = 'M' + (curve.c[(n - 1) * 3 + 2].x * size).toFixed(3) +
            ' ' + (curve.c[(n - 1) * 3 + 2].y * size).toFixed(3) + ' ';
        for (let i = 0; i < n; i++) {
            if (curve.tag[i] === 'CURVE') {
                p += bezier(i);
            }
            else if (curve.tag[i] === 'CORNER') {
                p += segment(i);
            }
        }
        return p;
    }
    // Calculate bounding box from paths
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const path of pathList) {
        minX = Math.min(minX, path.minX);
        minY = Math.min(minY, path.minY);
        maxX = Math.max(maxX, path.maxX);
        maxY = Math.max(maxY, path.maxY);
    }
    const w = Math.ceil((maxX - minX) * size);
    const h = Math.ceil((maxY - minY) * size);
    let svg = '<svg id="svg" version="1.1" width="' + w + '" height="' + h +
        '" xmlns="http://www.w3.org/2000/svg">';
    svg += '<path d="';
    for (const path of pathList) {
        svg += pathToSvg(path.curve);
    }
    let strokec, fillc, fillrule;
    if (optType === 'curve') {
        strokec = 'black';
        fillc = 'none';
        fillrule = '';
    }
    else {
        strokec = 'none';
        fillc = 'black';
        fillrule = ' fill-rule="evenodd"';
    }
    svg += '" stroke="' + strokec + '" fill="' + fillc + '"' + fillrule + '/></svg>';
    return svg;
}
