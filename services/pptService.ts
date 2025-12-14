import PptxGenJS from 'pptxgenjs';
import { Project, Store, CapturedImage } from '../types';

export const generateProjectPPT = (project: Project, store: Store) => {
  const pres = new PptxGenJS();

  // --- Slide 1: Title Slide ---
  const slide1 = pres.addSlide();
  slide1.addText('Kiosk Installation Report', { x: 1, y: 1.5, w: '80%', fontSize: 24, bold: true, color: '363636' });
  slide1.addText(`Store Name: ${store.storeName}`, { x: 1, y: 2.5, w: '80%', fontSize: 18 });
  slide1.addText(`Store #: ${store.storeNumber}`, { x: 1, y: 3.0, w: '80%', fontSize: 18 });
  slide1.addText(`Address: ${store.address}`, { x: 1, y: 3.5, w: '80%', fontSize: 14, color: '808080' });
  slide1.addText(`Date: ${new Date(project.startedAt).toLocaleDateString()}`, { x: 1, y: 4.5, fontSize: 12 });

  // Helper to add image grid
  const addImageSlide = (title: string, images: CapturedImage[]) => {
    if (images.length === 0) return;
    
    const slide = pres.addSlide();
    slide.addText(title, { x: 0.5, y: 0.5, fontSize: 18, bold: true, color: '0078D7' });

    // 3 Images per slide layout
    // Grid: 1x3 (Horizontal) or tailored for 16:9
    // Let's do 3 side-by-side if portrait, or clustered
    
    const imgY = 1.5;
    const imgW = 3.0;
    const imgH = 4.0;
    const margin = 0.2;

    images.forEach((img, idx) => {
        const xPos = 0.5 + (idx * (imgW + margin));
        
        slide.addImage({
            data: img.dataUrl,
            x: xPos,
            y: imgY,
            w: imgW,
            h: imgH,
        });

        // Add caption/timestamp
        slide.addText(`${img.timestamp}\nLat: ${img.location.lat.toFixed(4)}, Lng: ${img.location.lng.toFixed(4)}`, {
            x: xPos,
            y: imgY + imgH + 0.1,
            w: imgW,
            h: 0.5,
            fontSize: 9,
            color: '666666'
        });
    });
  };

  // --- Slides 2-3: Before Images (6 total, 3 per slide) ---
  const beforeChunks = chunkArray(project.images.before, 3);
  beforeChunks.forEach((chunk, i) => addImageSlide(`Before Installation (Part ${i + 1})`, chunk));

  // --- Slides 4-6: After Images (9 total, 3 per slide) ---
  const afterChunks = chunkArray(project.images.after, 3);
  afterChunks.forEach((chunk, i) => addImageSlide(`After Execution (Part ${i + 1})`, chunk));

  // --- Last Slide: Receiving Document (2 images) ---
  addImageSlide('Receiving / Handover Documents', project.images.receiving);

  // Save
  pres.writeFile({ fileName: `Kiosk_Report_${store.storeNumber}_${new Date().toISOString().split('T')[0]}.pptx` });
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunked_arr: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunked_arr.push(array.slice(i, i + size));
  }
  return chunked_arr;
}