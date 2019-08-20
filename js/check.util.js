// check object is null or undefined. if string check empty string
function checkIsEmpty(obj) {
	if (obj == null)
		return true;
	else if (obj === undefined)
		return true;
	else if (checkIsString(obj)) {
	    if (obj.trim().length == 0)
	        return true;
	}
	else if (checkIsArray(obj)) {
	    if (obj.length <= 0)
	        return true;
	}
	else if (checkIsFile(obj)) {
		if (obj.length <= 0)
			return true;
	}
	else if (checkIsObject(obj)) {
	    if (obj.length != undefined) {
	        if (obj.length <= 0)
	            return true;
	    }
	    else if (Object.keys(obj).length <= 0)
	        return true;
	}
	else if (checkIsDateObj(obj)) {
	    return false;
	}
	else if (checkIsDom(obj)) { // dom element. length is undefined, object keys is 0
	    return false;
	}
	else if (checkIsWindow(obj)) {
		return false;
    }
    else if (checkIsNodeList(obj)) {
        return false;
    }
    else if (checkIsHtmlCollection(obj)) {
        return false;
    }    
	else if (typeof (obj) == "object") {
	    console.warn("Unknown prototype " + Object.prototype.toString.call(obj));
	    if (Object.keys(obj).length <= 0)
	        return true;
	    else if (obj.length <= 0)
	        return true;
	}
	return false;
}

// check is Date object
function checkIsDateObj(item) {
    if (Object.prototype.toString.call(item) == "[object Date]") {
		if (isNaN(item.getTime()))
			return false;
        return true;
	}
    return false;
}

// check is valid Date string
function checkIsDateString(item) {
	var sMonth = [ "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec" ];
	//var lMonth = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	
	//var regxDatePattern = "^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}[T| ][0-9]{1,2}:[0-9]{1,2}(:[0-9]){0,2}(.[0-9]{1,5})?[Z]?$"; // should be date+time
	var regxDatePattern = "^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}([T| ][0-9]{1,2}:[0-9]{1,2}(:[0-9]){0,2}(.[0-9]{1,5})?[Z]?)?$"; // date or date+time
	
    if (checkIsString(item)) {
		// step1. return true if string match regex
		if (item.trim().match(new RegExp(regxDatePattern, "g")) != null)
			return true;
		// step2. return false if non-number string (except the month string)
		var arr = item.split(" ");
        if (arr.length > 7)
			return false; // max parts of date string is 7. yyyy, MM, dd, hh, mm, ss, ms 
		for (var i=0; i<arr.length; i++) {
			var tmpStr = arr[i].toLowerCase();
			if (isNaN(tmpStr)) { // check if is not number string
				var bIsMonthStr = false;
				for (var j=0; j<sMonth.length; j++) {
					if (tmpStr.contains(sMonth[j])) {
						bIsMonthStr = true;
						break;
					}
				}
				if (bIsMonthStr)
					return false;
			}
		}
		
		// step3. use Date.parse() to check
		if (isNaN(item) &&				// should not be a integer
			!isNaN(Date.parse(item)))	// can be parsed by Date.parse
			return true;
	}
    return false;
}

// check is Function object
function checkIsFunction(item) {
    if (Object.prototype.toString.call(item) == "[object Function]")
        return true;
    return false;
}

// check is Number
function checkIsNumber(item) {
    if (Object.prototype.toString.call(item) === "[object Number]" && !isNaN(Number(item)))
        return true;
    return false;
}

// check is String object
function checkIsString(item) {
    if (Object.prototype.toString.call(item) === "[object String]")
        return true;
    return false;
}

// check is Object object
function checkIsObject(item) {
    if (Object.prototype.toString.call(item) === "[object Object]")
        return true;
    return false;
}

// check is Object object
function checkIsWindow(item) {
    if (Object.prototype.toString.call(item) === "[object Window]")
        return true;
    return false;
}

// check is Array object
function checkIsArray(item) {
    if (Object.prototype.toString.call(item) === "[object Array]")
        return true;
    return false;
}

// check is Dom object
function checkIsDom(item) {
    //if (Object.prototype.toString.call(item) === "[object HTMLTableCellElement]")
    var itemPrototypeName = Object.prototype.toString.call(item);
    var re = new RegExp("\[object HtML[\S]*Element\]", "i");
    if (itemPrototypeName.match(re) != null)
        return true;
    return false;
}

// check is file
function checkIsFile(item) {
    if (Object.prototype.toString.call(item) === "[object FileList]")
        return true;
    return false;
}

function checkIsNodeList(item) {
    if (Object.prototype.toString.call(item) === "[object NodeList]")
        return true;
    return false;
}

function checkIsHtmlCollection(item) {
    if (Object.prototype.toString.call(item) === "[object HTMLCollection]")
        return true;
    return false;
}

function checkIsFormData(item) {
    if (Object.prototype.toString.call(item) === "[object FormData]")
        return true;
    return false;
}

