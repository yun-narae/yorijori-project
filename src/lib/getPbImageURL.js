// lib/getPbImageURL.js
export default function getPbImageURL(item, fileName = "images", opts = {}) {
    // opts: { pick: 'first' | number | string, thumb: '80x80' | undefined }
    const { pick = "first", thumb } = opts;

    const baseURL = import.meta.env.VITE_PB_URL || "https://y-narae.pockethost.io";
    const collection = item.collectionId || item.collectionName;
    const id = item.id;

    const value = item[fileName];
    const list = Array.isArray(value) ? value : (value ? [value] : []);

    // 어떤 파일을 고를지
    let filename = null;
    if (typeof pick === "number") filename = list[pick] ?? null;
    else if (typeof pick === "string" && pick !== "first") filename = pick;
    else filename = list[0] ?? null;

    if (!collection || !id || !filename) return "";

    const core = `${baseURL}/api/files/${collection}/${id}/${filename}`;
    return thumb ? `${core}?thumb=${thumb}` : core;
}
