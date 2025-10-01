export function downloadSvgChartPng(svgEl: SVGSVGElement, filename: string) {
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = svgEl.clientWidth || 800;
        canvas.height = svgEl.clientHeight || 400;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
            if (!blob) return;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
            a.click();
        });
    };
    img.src = url;
}