/**
 * Extract path data from traced paths for programmatic use
 */
export default function getPaths(pathlist) {
    function path(curve) {
        function bezier(i) {
            return {
                type: 'CURVE',
                x1: curve.c[i * 3 + 0].x,
                y1: curve.c[i * 3 + 0].y,
                x2: curve.c[i * 3 + 1].x,
                y2: curve.c[i * 3 + 1].y,
                x: curve.c[i * 3 + 2].x,
                y: curve.c[i * 3 + 2].y,
            };
        }
        function segment(i) {
            return [
                {
                    type: 'POINT',
                    x: curve.c[i * 3 + 1].x,
                    y: curve.c[i * 3 + 1].y
                },
                {
                    type: 'POINT',
                    x: curve.c[i * 3 + 2].x,
                    y: curve.c[i * 3 + 2].y
                }
            ];
        }
        const p = [];
        const n = curve.n;
        const x = curve.c[(n - 1) * 3 + 2].x;
        const y = curve.c[(n - 1) * 3 + 2].y;
        p.push({
            type: 'POINT',
            x: x,
            y: y
        });
        for (let i = 0; i < n; i++) {
            if (curve.tag[i] === 'CURVE') {
                p.push(bezier(i));
            }
            else if (curve.tag[i] === 'CORNER') {
                const s = segment(i);
                p.push(s[0], s[1]);
            }
        }
        return p;
    }
    const paths = [];
    for (const pathItem of pathlist) {
        paths.push(path(pathItem.curve));
    }
    return paths;
}
