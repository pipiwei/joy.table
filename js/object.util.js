// Find all occur index in array. Dont extend as prototype. Extend Array prototype will occur error in "foreach" statement
function ArrayFind(array, key) {
    var indexes = [];
    var i = -1;
    while ((i = array.indexOf(key, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

// clear Object key
Object.clean = function (obj) {
	if (obj == null)
		return false;
    for (var i=0; i<Object.keys(obj).length; i++) {
		var key = Object.keys(obj)[i];
        //copy all the fields
        obj[key] = null;
    }

    return true;
}

// copy Object value
Object.copyFromTo = function (srcObj, dstObj) {
	if (srcObj == null || srcObj === undefined)
		return false;
	if (dstObj == null || dstObj === undefined)
		return false;
    for (var i=0; i<Object.keys(srcObj).length; i++) {
		var key = Object.keys(srcObj)[i];
        //copy all the fields
		if (typeof(srcObj[key]) == "object")
			dstObj[key] = Object.clone(srcObj[key]);
		else
			dstObj[key] = srcObj[key];
    }
	
    for (var i=0; i<Object.keys(dstObj).length; i++) {
		var key = Object.keys(dstObj)[i];
        //copy all the fields
        if (srcObj[key] === undefined) {
			delete dstObj[key];
		}
    }
    return true;
}

// clone Object
Object.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj)); // attention: function will miss
}

// Get object value by key path
// ex. getObjectValueByKeyPath(obj, "Prop.SubProp")
//     mean get obj.Prop.SubProp
function getObjectValueByKeyPath(dataObj, keyPath) {
    var result = "";
    try {
        if (keyPath[0] == "[" || keyPath[0] == ".")
            result = eval("dataObj" + keyPath);
        else
            result = eval("dataObj." + keyPath);
    }
    catch (e) {

    }
    return result;
    if (String.isNullOrWhiteSpace(keyPath))
        return undefined;
    if (keyPath.indexOf(".") >= 0) {
        var objPaths = keyPath.split(".");
        var cmd = "dataObj";
        for (var i = 0; i < objPaths.length; i++) {
            var objPath = objPaths[i];
            var objPath2 = ""; // use when objPath is list (not a object)
            if (objPath.indexOf("[") >= 0) {
                objPath2 = "[" + objPath.split("[")[1];
                objPath = objPath.split("[")[0];
            }
            cmd += "['" + objPath + "']" + objPath2;
            if (eval(cmd + "==undefined"))
                return undefined;
        }
        return eval(cmd);
    }
    else
        return dataObj[keyPath];

}

// Search object list by reference key value and get value by indicated key
// ex. [{id:1; name:'A'; nickname:'a'}, {id:2; name:'B'; nickname:'b'}, {}....]
// GetObjectKeyValueByRefKey(list, id, 1, "name") to retrieve "A"
// GetObjectKeyValueByRefKey(list, id, 2, "nickname") to retrieve "b"
function GetObjectKeyValueByRefKey(lsObj, refKey, refVal, wantedKey) {
    var result = null;
    for (var i = 0; i < lsObj.length; i++) {
        if (lsObj[i][refKey] == refVal) {
            result = lsObj[i][wantedKey];
        }
    }
    return result;
}

// Search object list by reference key value and get object by indicated key
// ex. [{id:1; name:'A'; nickname:'a'}, {id:2; name:'B'; nickname:'b'}, {}....]
// GetObjectKeyValueByRefKey(list, id, 1) to retrieve {id:1; name:'A'; nickname:'a'}
// GetObjectKeyValueByRefKey(list, id, 2) to retrieve {id:2; name:'B'; nickname:'b'}
function GetObjectByRefKey(lsObj, refKey, refVal) {
    var result = null;
    for (var i = 0; i < lsObj.length; i++) {
        if (lsObj[i][refKey] == refVal) {
            result = lsObj[i];
        }
    }
    return result;
}

