export default function getPbImageURL(item, fileName = 'images') {
    const image = Array.isArray(item[fileName]) ? item[fileName][0] : item[fileName];
    const baseURL = import.meta.env.VITE_PB_URL || "https://y-narae.pockethost.io";
    return `${baseURL}/api/files/${item.collectionId || item.collectionName}/${item.id}/${image}`;
}