import { toPng } from 'html-to-image';

function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

export async function exportPosterAsPng() {
    const canvasNode = document.querySelector('[data-export-target="poster-canvas"]') as HTMLElement | null;
    if (!canvasNode) {
        throw new Error('Poster canvas not found');
    }

    const width = canvasNode.offsetWidth;
    const height = canvasNode.offsetHeight;
    const fileName = `poster-${Date.now()}.png`;

    const dataUrl = await toPng(canvasNode, {
        cacheBust: true,
        pixelRatio: 2,
        canvasWidth: width * 2,
        canvasHeight: height * 2,
        style: {
            border: 'none',
            boxShadow: 'none',
        },
    });

    downloadDataUrl(dataUrl, fileName);
}
