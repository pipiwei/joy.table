//// to extent function of Date object
// Format the Date as indicated string. ex: yyyy/MM/dd. (author: meizz)
Date.prototype.format = function (format) {
	if (!checkIsDateObj(this))
		return "";
	var weekStr = ["Sunday", "Monday", "Tuesday.", "Wednesday", "Thursday", "Friday", "Saturday"];
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(),    // day
        "h+": this.getHours(),   // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3),  // quarter
        "S": this.getMilliseconds(), // millisecond
        "DDDD": weekStr[this.getDay()], // day of week, sunday 0 ~ saturday 6
        "DDD": weekStr[this.getDay()].substr(0, 3) + ".", // day of week, sunday 0 ~ saturday 6
        "D": this.getDay(), // day of week, sunday 0 ~ saturday 6
    }

    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format)) {
			if (RegExp.$1 == "DDDD" || RegExp.$1 == "DDD")
				format = format.replace(RegExp.$1, o[k]);
			else
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
    return format;
}

// Add year
Date.prototype.addYear = function (val) {
    return new Date(new Date(this).setYear(new Date(this).getFullYear() + val));
}

// Add month
Date.prototype.addMonth = function (val) {
    return new Date(new Date(this).setMonth(new Date(this).getMonth() + val));
}

// Add day
Date.prototype.addDay = function (val) {
    return new Date(new Date(this).setDate(new Date(this).getDate() + val));
}

// Add hour
Date.prototype.addHour = function (val) {
	var decimalStrs = val.toString().split(".");
	var intPart = decimalStrs[0];
	var floatPart = decimalStrs.length > 1? ("." + decimalStrs[1]): 0;
	intPart = parseInt(intPart);
	floatPart = parseFloat(floatPart) * 60;

	return new Date((new Date(new Date(this).setHours((new Date(this)).getHours() + intPart))).setMinutes((new Date(this)).getMinutes() + floatPart))
}

// Add minute
Date.prototype.addMinute = function (val) {
	var decimalStrs = val.toString().split(".");
	var intPart = decimalStrs[0];
	var floatPart = decimalStrs.length > 1? ("." + decimalStrs[1]): 0;
	intPart = parseInt(intPart);
	floatPart = parseFloat(floatPart) * 60;
	
    return new Date(new Date(this).setMinutes(new Date(this).getMinutes() + val));
	return new Date((new Date(new Date(this).setMinutes((new Date(this)).getMinutes() + intPart))).setSeconds((new Date(this)).getSeconds() + floatPart))
}

// Add second
Date.prototype.addSecond = function (val) {
    return new Date(new Date(this).setSeconds(new Date(this).getSeconds() + val));
}

Date.prototype.getAge = function (d2) {
    d2 = d2 || new Date();

    birthDate = new Date(this);
    otherDate = d2 || new Date();

    var years = (otherDate.getFullYear() - birthDate.getFullYear());

    if (otherDate.getMonth() < birthDate.getMonth() ||
        otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
        years--;
    }
    return years;
}

// Get timezone of client browser
function GetClientTimeZone() {
	return -(new Date().getTimezoneOffset())/60;
}
// create a Date object with UTC from a string/number 
// The created time object is the time as input, no more convert to client timezone deponds on different browser
// if number. convert to Date directly
// if string. do parse time string and convert to Date object
function NewUtcDate(val) {
	var dateNumber;
	
	if (!isNaN(val)) {
	    dateNumber = val;
	}
	else {
	    var newVal = val.replace(/\s+/g, ' '); // remove multiple space
	    newVal = newVal.trim().replace(" ", "T").toUpperCase();
	    if (newVal[newVal.length - 1] == "Z")
	        newVal = newVal.substring(0, newVal.length - 1);
	    if (newVal.indexOf("T") < 0)
	        newVal += "T00:00:00";
	    var lsDatePart = newVal.split("T")[0].split("-");
	    var lsTimePart = newVal.split("T")[1].split(":");
	    for (var i = 0; i < lsDatePart.length; i++) { // pad zero
	        if (i == 0) {
	            var lossZero = 4 - lsDatePart[i].length;
	            while (lossZero-- > 0) lsDatePart[i] = "0" + lsDatePart[i];
	        }
	        else if (lsDatePart[i].length == 1)
	            lsDatePart[i] = "0" + lsDatePart[i];
	    }
	    for (var i = 0; i < lsTimePart.length; i++) // pad zero
	        if (lsTimePart[i].length == 1)
	            lsTimePart[i] = "0" + lsTimePart[i];
	    newVal = lsDatePart.join("-") + "T" + lsTimePart.join(":") + "Z";

	    dateNumber = Date.parse(newVal);
	    if (isNaN(dateNumber)) {
	        console.debug("NewUtcDate failed. Input param:[" + val + "]");
	        return null;
	    }
	}
	
	newDate = new Date(dateNumber); // create local time with param
	newUtc = newDate.addHour(-GetClientTimeZone()); // restore to UTC
	return newUtc;
}

// get now UTC time
function NewUtcNow() {
    var result = new Date();
    return result.addHour(-GetClientTimeZone());
}

// return 1: t1 > t2
// return -1: t1 < t2
// return 0: t1 = t2
// return NaN: one of time invalid
function DateCompare(t1, t2) {
	var timeDiff = (new Date(t1)) - (new Date(t2));
	if (timeDiff > 0)
		return 1;
	else if (timeDiff < 0)
		return -1;
	else if (isNaN(timeDiff))
		return NaN;
	else
		return 0;
}

function DateInRange(t, tFrom, tEnd) {
	var tc1 = DateCompare(t, tFrom);
	if (tc1 < 0)
		return false;
	var tc2 = DateCompare(t, tEnd);
	if (tc2 > 0)
		return false;
	return true;
	
}

