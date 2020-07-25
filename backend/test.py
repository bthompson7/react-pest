import base64
#test the image decoding because js was giving us shitty data and making my life 10x harder thx javascript 
img_data = b'data:image/jpeg;base64,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'
with open("imageToSave.jpeg", "wb") as fh:
    fh.write(base64.decodebytes(img_data))