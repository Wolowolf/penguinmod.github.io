// PenguinMod Desktop (patch section 83): uploading a big bitmap costume (a photo) with a much shorter pause.
// BitmapAdapter.importBitmap turns the whole file into a base64 text address (data: URI), the image is
// decoded when it is first drawn, and the result is encoded to PNG with toDataURL, all at once on
// the page's only thread: a 10-30 MB photo froze the editor for 0.2-0.5 s. Here, for files from 1 MB:
//   - the image gets a blob address instead (the same bytes, without the base64 text);
//   - when every pixel of the resized picture is opaque (photos), the PNG is encoded with toBlob, which
//     the browser does in the background; the file is byte for byte the one toDataURL gives (an opaque
//     pixel is stored the same either way; with see-through pixels toBlob rounds a few colours by 1-2 of
//     255, so those pictures still use toDataURL).
// The decoding and resizing are BitmapAdapter's own, so the costume is the same as before. (Measured and
// not used, as the costume came out different: decoding first with img.decode(), which makes a shrunk
// JPEG's colours differ by 1 of 255, and a worker, whose canvas also rounds see-through pixels and JPEG
// colours differently.) Smaller files take BitmapAdapter's own way, which is as quick for them. Only
// the editor's uploads use this; BitmapAdapter itself (also used by the VM and by extensions) is unchanged.
import {BitmapAdapter} from 'scratch-svg-renderer';

const MIN_BYTES = 1024 * 1024;
const MIN_PIXELS_FOR_BLOB = 1000000; // smaller pictures: the opacity check costs about what it saves

class PMBitmapAdapter extends BitmapAdapter {
    importBitmap (fileData, fileType) {
        if (!(fileData instanceof ArrayBuffer) || fileData.byteLength < MIN_BYTES ||
            typeof URL.createObjectURL !== 'function') {
            return super.importBitmap(fileData, fileType);
        }
        const url = URL.createObjectURL(new Blob([fileData], {type: fileType}));
        const image = this._makeImage();
        return new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = url;
        })
            .then(() => {
                const newSize = this.getResizedWidthHeight(image.width, image.height);
                const canvas = this.resize(image, newSize.width, newSize.height);
                if (canvas.width * canvas.height >= MIN_PIXELS_FOR_BLOB && typeof canvas.toBlob === 'function' &&
                    this.isOpaque(canvas)) {
                    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
                        .then(blob => (blob ? blob.arrayBuffer().then(b => new Uint8Array(b)) :
                            this.convertDataURIToBinary(canvas.toDataURL())));
                }
                return this.convertDataURIToBinary(canvas.toDataURL());
            }, () => super.importBitmap(fileData, fileType)) // could not load: the original way
            .finally(() => URL.revokeObjectURL(url));
    }
    isOpaque (canvas) {
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] !== 255) return false;
        }
        return true;
    }
}

export default PMBitmapAdapter;
