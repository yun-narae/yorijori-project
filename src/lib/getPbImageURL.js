export default function getPbImageURL(item,fileName = 'images'){
    return `${import.meta.env.VITE_PB_API}/files/${item.collectionId}/${item.id}/${item.images}`
}
