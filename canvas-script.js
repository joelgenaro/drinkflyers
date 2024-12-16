var sepodCanvas = canvas
var customFabricFields = [
    'ktype', 'background-image', 'parentX', 'parentY',
    'parentWidth', 'parentHight', 'sepod_id', 'sepod_box_id',
    'formFixLength', 'formLabel', 'formRequired', 'formDefaultText',
    'formMaxSize', 'formAllowType','lib_file_id'
]

initSepodCanvas = function() {
    sepodCanvas.getObjects().forEach(function(item, index) {
        item.selectable = false
        if(item.ktype === 'print-area') {
            sepodCanvas.remove(item)
        }
    });

    sepodCanvas.renderAll()
}

SEPOD_InputHandler = function(dbId, sepodId, mainImageId) {
    const item = document.getElementById(`sepod_${dbId}_field`)
    const canvasItem = getObjectBySepodId(sepodId) //id shold be taken from variable
    canvasItem.set('text', item.value)
    sepodCanvas.renderAll()
    updateCanvas(mainImageId)
}

SEPOD_ImageHandler = async function (item, dbId, sepodId, mainImageId) {
    if(item.files && item.files.length > 0) {
        const imgFile = item.files[0]
        const oldImg = getObjectBySepodId(sepodId)
        const newImg = fabric.util.object.clone(oldImg)
        const imgBase64 = await toBase64(imgFile)
        
        newImg.setSrc(imgBase64, function() {
            newImg.set('scaleX', oldImg.getScaledWidth()/newImg.width)
            newImg.set('scaleY', oldImg.getScaledHeight()/newImg.height)

            sepodCanvas.remove(oldImg)
            sepodCanvas.add(newImg)
            newImg.setCoords()
            sepodCanvas.renderAll()
            updateCanvas(mainImageId)
        })

        document.getElementById(`sepod_${dbId}_image`).value = imgBase64;
    }
}

updateCanvas = function(mainImageId) {
    const can = JSON.stringify(sepodCanvas.toJSON(customFabricFields))
    document.querySelector(`div[data-image-id="${mainImageId}"]`).setAttribute('onclick', `loadFromJSON(${can}, ${mainImageId})`)
}

getObjectBySepodId = function(sepodId) {
    const data = sepodCanvas.getObjects().filter(function(item) {
        return item.sepod_id == sepodId
    });
    
    return data.length == 1 ? data[0] : data
}

toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

document.addEventListener("DOMContentLoaded", function() {
    initSepodCanvas()
});