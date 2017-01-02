/*
    log access filter util functions
    author: KaiLiu
*/

function serializeArray(inputArray) {
    var arrayString = "";

    if (!inputArray) return arrayString;

    for (var i = 0; i < inputArray.length; i++) {
        if (typeof(inputArray[i]) == "object") {
            arrayString += escape(serializeArray(inputArray[i])) + "&";
        } else {
            arrayString += escape(inputArray[i]) + "&";
        }
    }
    return arrayString;
}

function deserializeArray(arrayString) {
    var stringArray = arrayString.split("&");
    var elementString;

    stringArray.length -= 1;
    for (var i = 0; i < (stringArray.length); i++) {
        elementString = unescape(stringArray[i]);

        if (elementString.indexOf("&") < 0) {
            stringArray[i] = unescape(elementString);
            if (elementString.indexOf("=") >= 0) {
                var fieldArray = elementString.split("=");
                stringArray[fieldArray[0]] = fieldArray[1];
            }
        } else {
            stringArray[i] = deserializeArray(elementString);
        }
    }
    return stringArray;
}