// Check the string endWith special word.
String.prototype.endsWith = function (a) {
    var isExp = a.constructor.name === "RegExp",
    val = this;
    if (isExp === false) {
        a = escape(a);
        val = escape(val);
    } else
        a = a.toString().replace(/(^\/)|(\/$)/g, "");
    return eval("/" + a + "$/.test(val)");
}

// remove string from begin to end-1
String.prototype.removeAt = function (begin, end) {
	if (begin > end)
		return "";
	var ret = this.substring(0, begin);
	if (end <= this.length - 1)
		ret += this.substring(end);
    return ret;
}

// find nth appear string
String.prototype.nthIndexOf = function (pattern, n) {
    var i = -1;

    while (n-- && i++ < this.length) {
        i = this.indexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}

// find nth appear string
String.prototype.nthLastIndexOf = function (pattern, n) {
    var i = this.length;

    while (n-- && i-- > 0) {
        i = this.lastIndexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}

String.prototype.contains = function (pattern) {
	var i = -1;
	i = this.indexOf(pattern);
	return i >= 0;
}

// Convert space to Upper case if word use upper case to identify as a word
// double space maybe occur
// ex. "AddSpaceOnUpperCase" ==> "Add Space On Upper Case"
//     "AddSpace OnUpperCase" ==> "Add Space  On Upper Case"
String.prototype.AddSpaceOnUpperCase = function () {
	return this.split(/(?=[A-Z])/).join(" ").trim();
}

// Replace double space as single
String.prototype.replaceDoubleSpaceAsSingle = function () {
	return this.replace(/\s{2,}/g, ' ');
}

// Check string is undefined / null / empty string
String.isNullOrEmpty = function (value) {
	return value == null || value === undefined || value.toString().length == 0;
}

// Check string is undefined / null / empty string / white space only
String.isNullOrWhiteSpace = function (value) {
	return value == null || value === undefined || value.toString().trim().length == 0;
}

//Pad left 
String.prototype.padleft = function (length, val) {
    var str = this.toString();
    return str.length < length ? padleft(val + str, length, val) : str;
}

//Pad left 
function padleft(str, length, val) {
    str = str.toString();
    return str.length < length ? padleft(val + str, length, val) : str;
}

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}
