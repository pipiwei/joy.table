function JoyTable(htmlElement, config) {
    
    //this.PrivateAddRow = null; ///////////// to do
	//this.PostAddRow = null; use OnRowWrote
	this.Debug = false;
	this.JoyTableId = Date.now();

    /* change log
    2019-03-22
    . add FilterConfig to keep user filter config
       . add SetFilterCondition()  for user establish filter config
       . add ApplyFilter(), CancelFilter() for user to switch filter
    . fix minor bug: crash when try to reset modified data (in EditMode)
    . fix minor bug: translate wrong code when set value to embedded text with embeddedContentDomType

    2019-03-05
    . support text_domtype: select/input-text/radio-group
    . use in PlayerMarket

    2019-02-27
    . try support table edit (not complete yet, partial code in PlayerMarket)

    2019-02-22
    . fix callback function when binding event
        . all callback pass with an object param { JoyTable:this }
        . remove PostAddRow
        . add OnRowWrote (for replace the PostAddRow)
        . callback param of OnRowClicked/OnRowChecked should return multiple effect rows

    2018-12-27 joy
    . rename attr "show-collapse" as show_collapse due to dash symbol can't be the key of the object
    . SetUniqueId() check input key is empty
    . ExportConfiguration support unikeys=null and show_collapse=true
    2018-12-07 joy
    . fix format datetime error

    2018-11-30 joy
    . fix show-collapse:false
    . write error in console when use auto key (auto key is necessary when access table data)

    2018-07-18 sean
    . Allow append HTML at Title

    2018-06-20 sean
    . Collapse control minor change
    . Remove border-right when group-column

    2018-05-31 sean
    . fix issue of check all not work when frozen-top-header

     2018-05-16 sean
    . this.SingleSelect default true => false;

    this.SingleSelect = false;
    2018-04-16 sean verserion 2.6.2
    . Add Class for JoyTable Style scope.
    . Upgrade css file
    . Fix  scroll bar issue of group table row
    . Fixd UpdateRows with one data.
    . Add negative attr when dateset not exist.
    
    2018-04-11 sean
    . fixd issue of filter when duplicate unique key
    
    2018-03-14 sean
    . add filter func
    . add current row count for display
    . bind checking on click column

    2018-03-07 kid
    . add allow un focus row. key: AllUnFocus.

    2017-06-19 joy
	. add BindEvent, OnChanged, OnCleared, OnRowChecked, OnRowClicked for support multiple callback on event trigger
	
    2017-05-25 kid
    . add additional setting for rowselectable, SingleSelect 
    . add FixDivHeight, for not auto adjust div's height
    
    2017-02-21 kid  version 2.6
	. add draggable attribute for table
	. this only works on UI only now, the order will NOOOOOT sync with datasource yet.
    . add list_body attr, show-collapse:false to hide collapse arrow.
	
	2016-12-21 joy
	. add ShowHideRowByIndex(), ShowHideRowByRowObj(), ShowAllRows()
	. CheckAllRow avoid check the hidden row
	
    2016-12-13 joy
    . add content_class, content_style

	2016-08.16 joy
	. new frozen method

    2016-0812 kid
    . add collapse control
        . add new attribute in list_title to control the table can be collapse or not, and remove the arrow.

	2016-0812 kid
    . add checkrow
        . when the check box is disabled, then no check it when do check all row.
    

	2016-07-22 joy
	. add panel-collapse attribute
		. set value to false or "off" can collapsed after TableInitial. (default is non-collapse)
		
    2016-07-13
    . add row span counter
    . change row background

    2016-06-30
    . add row span control (copy and search keyword 'row span')

	2016-06-14
	. add black line if use group
	. support title_XXXX in dataset (no need use title_dataset)
	
	2016-06-08
	. support export configuration
	
	2016-06-07
	. support collapse
    . need include joy.table.2.3.css
	
    2016-05-31
	. auto initial
	
	2016-05-30
	. not sign bug

    2016-05-30 version 2.2
    . support auto unikey. ref timestamp as unikey
    . fix bug. allow null content. default replace null as empty string
    
    +++ the layout struct of table +++
    <div class="panel panel-default">                       lev 1
        <div class="list_title panel-heading">              lev 2
            <label name="table_title"></label>
            <span name="table_counter"></span>
            <span name="table_sel_counter></span>
        </div>
		<div class="panel-collapse collapse in">			lev 2 (new)
			<div class="list_body panel-body">              lev 3
				<table>                                     lev 4
					<thead>                                 lev 5
						<th class="group_header"></th>      lev 6
						<th class="list_header"></th>
					</thead>
					<tbody>
						<tr class="list_data template"></tr>
						<tr class="list_data">...</tr>
						<tr class="list_data">...</tr>
						...
					</tbody>
				</table>
			</div>
		</div>
    </div>
	
	after fix header
	...
	    <div class="list_body panel-body">                  lev 2
			<div>											lev 3
				<table>										lev 4
					<thead>                                 lev 5
						<th class="group_header"></th>      lev 6
						<th class="list_header"></th>
					</thead>
				</table>
			</div>
            <table>                                         lev 3
                <tbody>
                    <tr class="list_data template"></tr>
                    <tr class="list_data">...</tr>
                    <tr class="list_data">...</tr>
                    ...
                </tbody>
            </table>
        </div>
	...
    */

    // lev 1
    this.RootObject = null; // div of the overall root (div)
    // lev 2
    this.HeaderRootObject = null; // header div under root. parent of data counter. to show the info of table. i.e total records. (div div.list_title)
	this.CollapseObject = null;
    this.BodyRootObject = null; // body div under root. parent of table. the container of the table element (div div.list_body)

    // original thead container / fake header thead node
    this.TableHeaderDivObject = null;
    this.TableFakeHeaderTheadObject = null;
    this.LeftTableHeaderDivObject = null;
    this.LeftTableFakeHeaderTheadObject = null;

    // lev 3
    this.TableObject = null; // table root. main table element. (div div table)
    // lev 4
    this.TableTheadObject = null;
    this.TableTbodyObject = null;
    // lev 5
    this.TableGroupHeaderObject = null; // root of group header of table (div div table thead tr.group_header)
    this.TableHeaderObject = null; // root of header of table (div div table thead tr.list_header)

    this.DataSource = null; // binding data source. set when AddRows
    this.RecoverSource = []; // when data edit, to keep original data

    this.Configurations = null; // to remember the table initial parameters
    this.FilterConfig = { Checked: false, Conditions: [] }; // config for filter. Checked:filter status. Condition: [{Key:DataProp, Value:DataVal}]
    this.FilterMatchMode = "and"; // and: all keyword must appear (default), or: one of keyword appear
    this.SnColVisible = false; // true: show serial number on row 1st column. set when TableInitial or before AddRows
    this.RowSelectable = false; // true: show checkbox on row 1st column (if serial column not shown). set when TableInitial or before AddRows
    this.TableEditable = false; // true: allow table edit. if editable,  need RowSelectable=true
    this.EditMode = false; // true: open input when double click cell (with editable class), false: lock table. only work when TableEditable=true
    this.Draggable = false;// true: the row support user draggable for reordering the list
    this.SingleSelect = false;// true: the checkbox can only be selected 1 row
    this.FixDivHeight = false;// true: fixed the height of the root object
    this.AllowUnFocus = false;//true: click again can be un focus row
    this.Unikeys = null; // uni-key of data source. set when TableInitial
	this.AutoUnikeys = false;
	this.IsAllowShowingNull = false;
    this.GroupNameList = []; // set when TableInitial
    this.ColumnNameList = []; // set when TableInitial
	this.frozenColIdx = 1;
	this.applyFixedHeader = false;

    this.ReservedColNums = 2; // serial number, checkbox 
    this.IsSorting = false;
    this.ScrollOffset = "";

    this.Events = {};
    this.Events.OnChanged = null;
    this.Events.OnCleared = null;
    this.Events.OnRowClicked = null;
    this.Events.OnRowChecked = null;
    this.Events.OnRowWrote = null;
    if (typeof(htmlElement) != "undefined") {
        this.TableInitial(htmlElement, config);
    }

    this._bindingScrollingEventObj = {
        handleEvent: function (e) {
            this.tableClassObj.OnTableScrolling(e);
        },
        tableClassObj: this,
    };
}

JoyTable.prototype.GetJsPath = function () {
	var scriptObj = $("[src*='joy.table']");
	var fullJsPath = "";
	var partialJsPath = "";
	if (scriptObj.length > 0) {
		fullJsPath = scriptObj[0].src;
		partialJsPath = $(scriptObj[0]).attr("src");
	}
	var path = { absolute_path: fullJsPath,
				 related_path: partialJsPath
	};
	return path;
}

// initial table: create the table html and configure with parameters
JoyTable.prototype.TableInitial = function TableInitial(containObj, parameters) {
    var divHeaderNode = document.createElement("div");
	var divCollapseNode = document.createElement("div");
    var divBodyNode = document.createElement("div");
    var tableNode = document.createElement("table");
    var theadNode = document.createElement("thead");
    var tbodyNode = document.createElement("tbody");
    $(containObj).removeClass("joytable");
    $(containObj).addClass("joytable");

    $(containObj).children().remove(); // remove all children

    $(containObj).append($(divHeaderNode));
    $(containObj).append($(divCollapseNode));
    $(divCollapseNode).append($(divBodyNode));
    $(divBodyNode).append($(tableNode));

    this.RootObject = containObj;
    this.HeaderRootObject = $(divHeaderNode);
	this.CollapseObject = $(divCollapseNode);
    this.BodyRootObject = $(divBodyNode);
    this.TableObject = $(tableNode);
    this.TableObject.attr("id", "table_" + $(containObj).attr("id"));
    this.TableTheadObject = $(theadNode);
    this.TableTbodyObject = $(tbodyNode);
    this.Configurations = parameters;

    var bindingResizeEventObj = {
        handleEvent: function (e) {
            this.tableClassObj.OnResizing(e);
        },
        tableClassObj: this,
    };
    $(window)[0].addEventListener("resize", bindingResizeEventObj, false);

    containObj.removeClass("panel panel-default").addClass("panel panel-default");
    $(divHeaderNode).addClass("list_title");
    $(divHeaderNode).addClass("panel-heading");
    $(divHeaderNode).attr("id", "div_header_" + $(containObj).attr("id"));
	$(divCollapseNode).attr("id", "div_collapse_" + $(containObj).attr("id"));
	$(divCollapseNode).addClass("panel-collapse collapse in");
	//$(divCollapseNode).attr("style", "height:auto !important;");
    $(divBodyNode).addClass("list_body");
    $(divBodyNode).addClass("panel-body");
    $(divBodyNode).attr("id", "div_body_" + $(containObj).attr("id"));

    // div header content
    var spanTitleNode = document.createElement("span");
    //var labelTitleNode = document.createElement("label");
	var titleNode = spanTitleNode;
	var spanCounterNode = document.createElement("span");
    var spanCurrentCountNode = document.createElement("span");
    var spanSelectedCounterNode = document.createElement("span");
    spanTitleNode.setAttribute("name", "table_title");
	$(spanTitleNode).addClass("panel-title");
    //spanTitleNode.setAttribute("style", "font-weight:bold;cursor:pointer"); move to css
    spanTitleNode.setAttribute("data-toggle", "collapse");
    spanTitleNode.setAttribute("data-target", "#" + $(divCollapseNode).attr("id"));
    //labelTitleNode.setAttribute("name", "table_title");
	spanCounterNode.setAttribute("name", "table_counter");
    spanCurrentCountNode.setAttribute("name", "table_current_counter");
    spanSelectedCounterNode.setAttribute("name", "table_sel_counter");
    $(divHeaderNode).append($(spanTitleNode));
    //$(divHeaderNode).append($(labelTitleNode));
    $(divHeaderNode).append("&nbsp;");
    $(divHeaderNode).append($(spanCurrentCountNode));
    $(divHeaderNode).append("&nbsp;");
    $(divHeaderNode).append($(spanCounterNode));
    $(divHeaderNode).append("&nbsp;");
    $(divHeaderNode).append($(spanSelectedCounterNode));
    
    // div body content
    var trGroupHeadersNode = document.createElement("tr"); // group_header
    var trHeadersNode = document.createElement("tr"); // list_header
    var trDataNode = document.createElement("tr"); // list_data

    this.TableGroupHeaderObject = $(trGroupHeadersNode);
    this.TableHeaderObject = $(trHeadersNode);


    //trTitleNode.setAttribute("class", "list_title");
    trGroupHeadersNode.setAttribute("class", "group_header");
    trHeadersNode.setAttribute("class", "list_header");
    trDataNode.setAttribute("class", "list_data template hide");
    trDataNode.setAttribute("id", "data_template_" + $(containObj).attr("id"));
	
    if (parameters!= null && typeof(parameters) != "undefined") {
        if (typeof (parameters["list_title"]) != "undefined") {
            var keys = Object.keys(parameters["list_title"]);
            for (var j = 0; j < keys.length; j++) {
                var attrName = keys[j];
                var attrVal = parameters["list_title"][attrName];
                if (attrName == "text") {
                    $(titleNode)[0].innerHTML= attrVal;
                } else if (attrName == "collapse") {
                    if (!attrVal) {
                        spanTitleNode.removeAttribute("data-toggle");
                        //spanTitleNode.removeAttribute("style");move to css
                        //spanTitleNode.setAttribute("style", "font-weight:bold;");move to css
                        //$(spanTitleNode).addClass("no_collapse");no use
                    }
                }
                else
                    divHeaderNode.setAttribute(attrName, attrVal);
            }
        }
        if (typeof (parameters["list_body"]) != "undefined") {
            var keys = Object.keys(parameters["list_body"]);
            for (var j = 0; j < keys.length; j++) {
                var attrName = keys[j];
                var attrVal = parameters["list_body"][attrName];
                if (attrName == "show_collapse") {
                    if (attrVal == false) {
                        spanTitleNode.removeAttribute("data-toggle");
                        //$(spanTitleNode).addClass("no_collapse"); no use
                    }
                }else if (attrName == "panel-collapse") {
					if (attrVal == false || attrVal == "out") {
						$(divCollapseNode).removeClass("in");
						$(spanTitleNode).addClass("collapsed");
					}
				}  else if (attrName == "fix_height") {
				    this.FixDivHeight = attrVal;
				}
				else
					divBodyNode.setAttribute(attrName, attrVal);
            }
        }
        if (typeof (parameters["table"]) != "undefined") {
            var keys = Object.keys(parameters["table"]);
            for (var j = 0; j < keys.length; j++) {
                var attrName = keys[j];
                var attrVal = parameters["table"][attrName];
                if (attrName == "header_text"){
                    //theNode.setAttribute(attrName, attrVal);
                }
                else if (attrName == "show_sn_column") {
                    this.SnColVisible = attrVal;
                }
                else if (attrName == "selectable") {
                    this.RowSelectable = attrVal;
                }
                else if (attrName == "editable") {
                    this.TableEditable = attrVal;
                }
                else if (attrName == "draggable") {
                    if (attrVal == true) {
                        tbodyNode.setAttribute("id", "draggable_" + tableNode.getAttribute("id"));
                    }
                    this.Draggable = attrVal;
                }
                else if (attrName == "single_select") {
                    this.SingleSelect = attrVal;
                }
                else if (attrName == "allow_un_focus") {
                    this.AllowUnFocus = attrVal;
                }
                else {
                    tableNode.setAttribute(attrName, attrVal);
                }
            }
        }
        if (typeof (parameters["groups"]) != "undefined") {
            var lsItems = parameters["groups"];
            var thSnNode = document.createElement("th");
            thSnNode.setAttribute("class", "sn_col");
            thSnNode.setAttribute("style", this.SingleSelect ? "text-align:center" : "display:none;text-align:center");
            thSnNode.setAttribute("name", "serial_number");
            var thCkNode = document.createElement("th");
            thCkNode.setAttribute("class", "cb_col");
            thCkNode.setAttribute("style", this.RowSelectable ? "text-align:center" : "display:none;text-align:center");
            thCkNode.setAttribute("name", "check_row");
            $(trGroupHeadersNode).append(thSnNode);
            $(trGroupHeadersNode).append(thCkNode);

            for (var i = 0; i < lsItems.length; i++) {
                var thNode = document.createElement("th");
                var keys = Object.keys(lsItems[i]);
                var columnName = "";
                var columnSpan = 0;
                for (var j = 0; j < keys.length; j++) {
                    var attrName = keys[j];
                    var attrVal = lsItems[i][attrName];
                    if (attrName == "number_of_column") {
                        thNode.setAttribute("colspan", attrVal);
                        columnSpan = parseInt(attrVal);
                    }
                    else if (attrName == "text") {
                        thNode.innerHTML = attrVal;
                    }
                    else if (attrName == "name" ){
                        columnName = attrVal;
                        thNode.setAttribute(attrName, attrVal);
                    }
                    else {
                        thNode.setAttribute(attrName, attrVal);
                    }
                }

				// right border set black if group changed
				$(thNode).css("border-top-color", "black");
				// set bottom color
				$(divHeaderNode).css("border-bottom-color", "black");
				for (var j = 0; !isNaN(columnSpan) && j < columnSpan; j++)
                    this.GroupNameList.push(columnName);
                $(trGroupHeadersNode).append(thNode);
            }
        }else
        {
            $(trGroupHeadersNode).css('display', 'none');
        }
        if (typeof (parameters["columns"]) != "undefined") {
            var lsItems = parameters["columns"];
            var thSnNode = document.createElement("th");
            var tdSnNode = document.createElement("td");
            var thCheckNode = document.createElement("th");
            var tdCheckNode = document.createElement("td");
            thSnNode.setAttribute("groups", "SerialNumber");
            thSnNode.setAttribute("groups", "SerialNumber");
            thSnNode.setAttribute("class", "sn_col");
            tdSnNode.setAttribute("class", "sn_col");
            thCheckNode.setAttribute("groups", "Checkbox");
            tdCheckNode.setAttribute("groups", "Checkbox");
            thCheckNode.setAttribute("class", "cb_col");
            tdCheckNode.setAttribute("class", "cb_col");
            thSnNode.setAttribute("style", "display:none;text-align:center");
            tdSnNode.setAttribute("style", "display:none;text-align:center");
            if (this.RowSelectable) {
                thCheckNode.setAttribute("style", "text-align:center;");
                tdCheckNode.setAttribute("style", "text-align:center;");
            }
            else {
                thCheckNode.setAttribute("style", "display:none;text-align:center");
                tdCheckNode.setAttribute("style", "display:none;text-align:center");
            }
            thSnNode.setAttribute("name", "serial_number");
            tdSnNode.setAttribute("name", "serial_number");
            thCheckNode.setAttribute("name", "check_row");
            tdCheckNode.setAttribute("name", "check_row");
            if (this.RowSelectable && !this.SingleSelect) {
                thCheckNode.innerHTML = "<input type='checkbox' />";
            } else {
                thCheckNode.innerHTML = "<input type='checkbox' style='display:none;'/>";
            }
            //thCheckNode.innerHTML = "<input type='checkbox' />";
            tdCheckNode.innerHTML = "<input type='checkbox' />";
            tdSnNode.innerHTML = '<div style="white-space: nowrap"></div>';
            $(trHeadersNode).append(thSnNode);
            $(trHeadersNode).append(thCheckNode);
            $(trDataNode).append(tdSnNode);
            $(trDataNode).append(tdCheckNode);

            var checkObj = $(trHeadersNode).find("input[type='checkbox']");
            var bindingCheckEventObj = {
                handleEvent: function (e) {
                    var isCheck =  $(e.target).prop("checked");
                    this.tableClassObj.CheckAllRow(isCheck);
                },
                tableClassObj: this,
            };
            $(checkObj)[0].addEventListener("click", bindingCheckEventObj, false);

			var lastGroup = "";
			var prevThNode = null;
            for (var i = 0; i < lsItems.length; i++) {
                var thNode = document.createElement("th");
                var tdNode = document.createElement("td");
                var keys = Object.keys(lsItems[i]);
                var bAddSortableIcon = false;
                var groupName = this.GetGroupNameByCellIndex(i + this.ReservedColNums);
                if (!checkIsEmpty(groupName)) {
                    thNode.setAttribute("groups", groupName);
                    tdNode.setAttribute("groups", groupName);
                }

                var columnName = "";
                for (var j = 0; j < keys.length; j++) {
                    var attrName = keys[j];
                    var attrVal = lsItems[i][attrName];
                    if (i==0 && j == 0) {
                        //No use
                        //tdNode.setAttribute("id", "pivot_" + $(containObj).attr("id"));
                    }
                    if (attrName == "header_text") {
                        thNode.innerHTML = attrVal;
                    }
					/*
                    else if (attrName == "name") {
                        columnName = attrVal;
                    }
					*/
                    else if (attrName == "text") {
                        tdNode.innerHTML = attrVal;
                    }
                    else if (attrName.indexOf("data") >= 0 || attrName.indexOf("_format") >= 0 || attrName.indexOf("condition_statement") >= 0 || attrName.indexOf("time_offset") >= 0) {
                        continue;
                    }
                    else if (attrName == "class" || attrName == "style") {
                        if (checkIsEmpty(lsItems[i]["content_" + attrName])) {
                            tdNode.setAttribute(attrName, attrVal);
                            thNode.setAttribute(attrName, attrVal);
                        }
                        else
                            thNode.setAttribute(attrName, lsItems[i][attrName]);

                        if (attrName == "class" && attrVal.indexOf("sortable") >= 0) {
                            bAddSortableIcon = true;
                            $(tdNode).removeClass("sortable");
                        }
                    }
                    else if (attrName == "content_class" || attrName == "content_style") {
                        tdNode.setAttribute(attrName.replace("content_",""), attrVal);
                    }
                    else {
                        // attach attribute to node
                        thNode.setAttribute(attrName, attrVal);
                        tdNode.setAttribute(attrName, attrVal);
                        if (attrName == "name")
                            columnName = attrVal;
                    }
                }
                this.ColumnNameList.push(columnName);
                if (bAddSortableIcon) {
                    var bindingSortEventObj = {
                        handleEvent: function (e) {
                            if (this.tableClassObj.IsSorting)
                                return;

                            this.tableClassObj.IsSorting = true;
                            var bCanBlockUi = !checkIsEmpty($.blockUI) && !checkIsEmpty($.unblockUI);
                            if (bCanBlockUi)
                                $.blockUI({ message: "<span style='font-size: 20px'>Sorting...</span>" });

                            var _this = this;
                            setTimeout(function () {
                                _this.tableClassObj.SortData(_this.colObj);
                                if (bCanBlockUi)
                                    $.unblockUI();
                                _this.tableClassObj.IsSorting = false;
                            }, 1000);
                        },
                        tableClassObj: this,
                        colObj: $(thNode)
                    };
                    thNode.addEventListener("click", bindingSortEventObj, false);
                    thNode.innerHTML += '<img onmouseover="" class="hide" src="/images/sort_az.png" style="width:10px;height:10px;" />';
                }
				
				// right border set black if group changed
				if (!checkIsEmpty(this.TableGroupHeaderObject) &&
					this.TableGroupHeaderObject.children().length > 0) {
				//if (!checkIsEmpty(this.TableGroupHeaderObject)) {
					if (lastGroup != groupName && prevThNode != null) {
						$(prevThNode).css('border-right-color', 'black');
					}
					else if (i == lsItems.length - 1) {
						//$(thNode).css('border-right-color', 'black');
					}
					lastGroup = groupName;
					prevThNode = thNode;
				}
                $(trHeadersNode).append(thNode);
                $(trDataNode).append(tdNode);
            }
        }
        if (typeof (parameters["unikeys"]) != "undefined") {
            this.SetUniqueId(parameters["unikeys"]);
        }
    }

    //$(theadNode).append(trTitleNode);
    $(theadNode).append(trGroupHeadersNode);
    $(theadNode).append(trHeadersNode);
    $(tbodyNode).append(trDataNode);
    $(tableNode).append(theadNode);
    $(tableNode).append(tbodyNode);

    this.SetCounter(0);
    this.SetCurrentCounter(0, true);
    this.SetSelCounter(0);
};

JoyTable.prototype.TableAutoInitial = function(refData) {
	var bDetectValueType = true;
	var tmpConfig = {};
	if (checkIsEmpty(this.Configurations) || checkIsEmpty(this.Configurations.columns)) { // auto initial
		var id = this.TableObject.attr("id");
		tmpConfig["list_title"] = { 
			text: id, 
			style: "padding: 3px 5px" 
		};
		tmpConfig["list_body"] = { 
			show_collapse: true,
			style: "overflow: auto; padding: 0 1px 0 0; height:80vh",
		};
		tmpConfig["table"] = {
		    class: "table table-margin-bottom table-bordered table-hover table-striped small_font",// table-fixed-header ",
			style: "border-style: groove; border-color: transparent",
			show_sn_column: true,
            allow_un_focus: true,
			selectable: false,
            editable: false,
		};
		tmpConfig["unikeys"] = null;
		if (!checkIsEmpty(refData)) {
			var tmpAllCols = [];
			var refRecord = refData[0];
			var objKeys = Object.keys(refRecord);
			for (var i=0; i<objKeys.length; i++) {
				var key = objKeys[i];
				var headerText = key.replace(new RegExp("_", "g"), " ").toUpperCase();
				var tmpCol = {
					header_text: headerText,
					name: key,
					title_data: key,
					__title_dataset: "remove underline before use. output value are multiple",
					data: key,
					__dataset: "remove underline before use. output value are multiple",
					__condition_statement: "remove underline before use. output data when condition_statement satisfy",
					__negative_data: "remove underline before use. output data when condition_statement not satisfy",
					style: "text-align:center",
                    class: null,
                    __content_style: null,
                    __content_class: null,
                    __text: "remove underline before use. this value will apply string format by data/dataset and then convert as html string",
                    __text_domtype: "remove underline before use. indicated the value of 'text' is html string of a dom object. support select/input-text/radio-group",
				};
				
				if (bDetectValueType) {
					// auto detect value type and attach
					var val = refRecord[key];
					if (checkIsDateString(val)) {
						//var tmpDate = NewUtcDate(val).format("yyyy-MM-dd hh:mm:ss");
						tmpCol["data_type"] = "Date";
						tmpCol["time_format"] = "yyyy-MM-dd hh:mm:ss";
						tmpCol["time_offset"] = 0;
						//tmpCol["class"] = "date_col";
					}
				}
				tmpAllCols.push(tmpCol);
			}
			if (!checkIsEmpty(tmpConfig)) {
				tmpConfig["columns"] = tmpAllCols;
			}
		}
		//this.Configurations = tmpConfig;
		this.TableInitial(this.RootObject, tmpConfig);
	}
}

JoyTable.prototype.ExportConfigurations = function () {
    var jsonStr = JSON.stringify(this.Configurations);
	return jsonStr;
}

// sort table data by header column object or column name
JoyTable.prototype.SortData = function SortData(headerColObj, colName) {
    lsData = this.DataSource;
    if (lsData.length <= 0) {
        return;
    }
    
    
    headerCol = headerColObj;

	if (checkIsEmpty(headerCol) && !checkIsEmpty(colName)) {
		var tmpHeaders = this.TableHeaderObject.find("[name=" + colName + "]");
		if (!checkIsEmpty(tmpHeaders))
		    headerCol = $(tmpHeaders[0]);
	}
	if (checkIsEmpty(headerCol))
		return;
	var thisSortIcon = headerCol.children("img");
	if (thisSortIcon.length <= 0) {
	    return;
	}

	var iconVisible = thisSortIcon.is(":visible"); // dom syntax: thisSortIcon[0].offsetParent == null

	var thisSortInc = thisSortIcon.attr("src").indexOf("sort_az") >= 0 && iconVisible ? true : false; // find current sorting state by icon name
	var newSortInc = !thisSortInc;
	var thisShowSnCol = headerColObj.attr("name").indexOf("candidate") >= 0 ? false : true;
	{
	    var cellIdx = headerCol[0].cellIndex;
	    var columnConfigObj = this.Configurations.columns[cellIdx - this.ReservedColNums];
	    var finishSort = false;

	    var sortingPreprocessFunc = function (a) {
	        if (typeof (a) == "boolean")
	            return a;
	        else if (typeof (a) == "number")
	            return a;
	        else if (String.isNullOrWhiteSpace(a))
	            return "";
	        return a.toString().toUpperCase();
	    };

	    if (!checkIsEmpty(columnConfigObj["text_domtype"])) { // sort by field when text_dometype is defined
	        var dataProp = null;
	        if (!checkIsEmpty(columnConfigObj["data"]))
	            dataProp = columnConfigObj["data"];
	        else if (!checkIsEmpty(columnConfigObj["dataset"]) && columnConfigObj["dataset"].length > 0)
	            dataProp = columnConfigObj["dataset"][0]["data"];

	        if (!checkIsEmpty(dataProp)) {
	            lsData.sort(this.SortObjByProp(dataProp, newSortInc, sortingPreprocessFunc));
	            finishSort = true;
	        }
	    }

	    if (!finishSort) { // can't sort by field, sort by output
	        var params = [];
	        params.push(null); // no use param
	        params.push(cellIdx);

	        lsData.sort(this.SortObjByOutput(params, newSortInc, sortingPreprocessFunc));
	    }
		this.Clear();

		//if (this.Events.PrivateAddRow != null && typeof (window[this.Events.PrivateAddRow]) === "function") {
		//    for (var i = 0; i < lsData.length; i++)
		//        window[this.Events.PrivateAddRow](lsData[i], true);
		//}
		//else {
		    //this.WriteRow(lsData, "add");
		    this.AddRows(lsData);
		//}
		this.FinishAdd(thisShowSnCol);
	}
	
	// update sort icon
	if (newSortInc) {
		thisSortIcon.attr("src", "/images/sort_az.png");
		thisSortIcon.removeClass("hide");
	}
	else {
		thisSortIcon.attr("src", "/images/sort_za.png");
		thisSortIcon.removeClass("hide");
	}

}

// sort list object by key
// field: key of object
// reverse: true: ascending
// premier: pre-process function before compare value
JoyTable.prototype.SortObjByProp = function (field, reverse, preprocessFunc) {

    var getVal = preprocessFunc ?
			function(data) {
				if (field.indexOf(".") >= 0) {
					var objPaths = field.split(".");
					var cmd = "data";
					for (var i=0; i<objPaths.length; i++) {
						cmd += "['" + objPaths[i] + "']";
						if (eval(cmd + "==undefined"))
							return "";
					}
					return eval("preprocessFunc(" + cmd + ")");
				}
				else
				    return preprocessFunc(data[field]);
			} : 
			function (data) {
				if (field.indexOf(".") >= 0) {
					var objPaths = field.split(".");
					var cmd = "data";
					for (var i=0; i<objPaths.length; i++) {
						cmd += "['" + objPaths[i] + "']";
						if (eval(cmd + "==undefined"))
							return "";
					}
					return eval(cmd);
				}
				else
				    return data[field];
			};

	reverse = [-1, 1][+!!reverse];

	return function (a, b) {
	    return a = getVal(a), b = getVal(b), reverse * ((a > b) - (b > a));
	} 
}

/*
JoyTable.prototype.SortObjBy2 = function SortObjBy2(key, keyParam, reverse, preprocessFunc) {
    var bKeyIsFunc = checkIsFunction(key);
    var getVal;
    if (bKeyIsFunc) {
        var cmd = "window[key](data, " + keyParam + ")]"
        getVal = preprocessFunc ?
            function (data) {
                preprocessFunc(eval(cmd))
            } :
            function (data) {
                eval(key)
            };
    }
    else {
        getVal = preprocessFunc ?
			    function (data) {
			        if (key.indexOf(".") >= 0) {
			            var objPaths = key.split(".");
			            var cmd = "data";
			            for (var i = 0; i < objPaths.length; i++) {
			                cmd += "['" + objPaths[i] + "']";
			                if (eval(cmd + "==undefined"))
			                    return "";
			            }
			            return eval("preprocessFunc(" + cmd + ")");
			        }
			        else
			            return preprocessFunc(data[key]);
			    } :
			    function (data) {
			        if (key.indexOf(".") >= 0) {
			            var objPaths = key.split(".");
			            var cmd = "data";
			            for (var i = 0; i < objPaths.length; i++) {
			                cmd += "['" + objPaths[i] + "']";
			                if (eval(cmd + "==undefined"))
			                    return "";
			            }
			            return eval(cmd);
			        }
			        else
			            return data[key];
			    };

    }

    reverse = [-1, 1][+!!reverse];

    return function (a, b) {
        return a = getVal(a), b = getVal(b), reverse * ((a > b) - (b > a));
    }
}
*/

// sort list object by table output content
// param: [0] no use. [1] cell index of the table
// reverse: true: ascending
// premier: pre-process function before compare value
JoyTable.prototype.SortObjByOutput = function SortObjByOutput(params, reverse, preprocessFunc) {
    var _this = this;
    var getVal = preprocessFunc ? function (data) {
        return preprocessFunc(_this.GetOutputContent(params[0], params[1], data, false));
    } : function (data) {
        return _this.GetOutputContent(params[0], params[1], data, false);
    };

    reverse = [-1, 1][+!!reverse];

    return function (a, b) {
        return a = getVal(a), b = getVal(b), reverse * ((a > b) - (b > a));
    }
}

// [deprecated] old function. not fix yet. 
JoyTable.prototype.ChangeColumnOrder = function ChangeColumnOrder(bNormalOrder) {
	var findKey = bNormalOrder? "src_": "sw_";
	var lsTagName = [".list_header th", ".list_data td"];
	for (var m=0; m<lsTagName.length; m++) {
		var allColObjs = $(this.TableObject).find(lsTagName[m]);
		var refColObj = null;
		var refColObjIdx = -1;
		for (var i=0; i<allColObjs.length; i++) {
			var thisColObj = $(allColObjs[i]);
			var thisColName = thisColObj.attr("name");
			if (String.isNullOrWhiteSpace(thisColName))
				continue;
			if (thisColName == "check_row") {
				refColObj = thisColObj;
				refColObjIdx = i;
			}
			else if (thisColName.indexOf(findKey) >= 0) {
				if (i == refColObjIdx + 1) // no need move
					break;
					
				// do move
				$(thisColObj).insertAfter($(refColObj));
				// update ref obj & index
				refColObjIdx++;// = i;
				refColObj = thisColObj;
			}
		}
	}
}

// set record counter of table
JoyTable.prototype.SetCounter = function SetCounter(counter) {
    var labelObj = this.RootObject.find("span[name='table_counter']");
    if (checkIsEmpty(labelObj))
        return;
	labelObj.text("Total record(s): " + counter);
}

// set current record counter of table
JoyTable.prototype.SetCurrentCounter = function SetCurrentCounter(counter, clean) {
    var labelObj = this.RootObject.find("span[name='table_current_counter']");
    if (checkIsEmpty(labelObj))
        return;
    if (clean) {
        labelObj.text("");
    } else {

        labelObj.text("Current record(s): " + counter);
    }
}

// set selected record counter of table
JoyTable.prototype.SetSelCounter = function SetSelCounter(counter) {
    var labelObj = this.RootObject.find("span[name='table_sel_counter']");
	if (checkIsEmpty(labelObj))
	    return;
	if (this.RowSelectable)
		labelObj.text(". Selected record(s): " + counter);
	else
		labelObj.text("");
}

// set title of table
JoyTable.prototype.SetTitle = function SetTitle(title) {
    var labelObj = this.RootObject.find("span[name='table_title']");
    if (checkIsEmpty(labelObj))
        return;
	labelObj.html(title);
}

JoyTable.prototype.GetVersion = function() {
	var jsVerNum = "";
	var cssVerNum = "";
	
	var refObjs = document.getElementsByTagName('script');
	for (var i=refObjs.length; i>=0; i--) {
		var refObj = $(refObjs[i]);
		var refSrc = refObj.attr("src");
		if (!checkIsEmpty(refSrc)) {
			var idx = refSrc.indexOf("joy.table");
			if (idx > 0) {
				refSrc = refSrc.substr(idx);
				jsVerNum = refSrc.substr(0, refSrc.length-3);
				break;
			}
		}
	}
	
	var refObjs = document.getElementsByTagName('link');
	for (var i=refObjs.length; i>=0; i--) {
		var refObj = $(refObjs[i]);
		var refSrc = refObj.attr("href");
		if (!checkIsEmpty(refSrc)) {
			var idx = refSrc.indexOf("joy.table");
			if (idx > 0) {
				refSrc = refSrc.substr(idx);
				cssVerNum = refSrc.substr(0, refSrc.length-4);
				break;
			}
		}
	}
	
	var verInfo = "JS:" + jsVerNum + " CSS:" + cssVerNum;
	//console.debug(verInfo);
	return verInfo;
}

// set unique id of table. also set in TableInitial()
JoyTable.prototype.SetUniqueId = function SetUniqueId(lsUniKeys) {
	if (checkIsEmpty(this.TableObject)) {
		console.debug("Invalid table object");
		return false;
	}
	if (checkIsEmpty(lsUniKeys))
		return false;
	
	var strKeys = "";
	if (typeof(lsUniKeys) == "object")
		strKeys = lsUniKeys.join();
	else
		strKeys = lsUniKeys;
	this.Unikeys = lsUniKeys;
	$(this.TableObject).attr("unique-keys", strKeys);
	return true;
}

// get unitue id of table
JoyTable.prototype.GetUnitueId = function GetUniqueId() {
    //var lsUniKeys = $(this.TableObject).attr("unique-keys").split(",");
    return this.Unikeys;
}

// get unique id in table based on data object
// data: single data from binding data source
JoyTable.prototype.GetUniqueIdByData = function GetUniqueIdByData(data) {
	if (checkIsEmpty(this.TableObject)) {
		console.debug("Invalid table object");
		return;
	}
	if (checkIsEmpty(data)) {
		console.debug("Invalid data");
		return;
	}
	var lsUniKeys = this.GetUnitueId();
	var uniqueId = "";
	if (typeof(lsUniKeys) == "string") {
		var value = getObjectValueByKeyPath(data, lsUniKeys);
		if (checkIsEmpty(value)) {
			console.debug("Invalid unique key: " + lsUniKeys);
			return;
		}
		uniqueId = value + "_" + this.TableObject.attr("id");
	}
	else if (typeof(lsUniKeys) == "object") {
		if (checkIsEmpty(lsUniKeys)) {
			console.debug("No unique key");
			return;
		}
		for (var i=0; i<lsUniKeys.length; i++) {
			var value = getObjectValueByKeyPath(data, lsUniKeys[i]);
			if (checkIsEmpty(value)) {
				console.debug("Invalid unique key: " + lsUniKeys[i]);
				return;
			}
			uniqueId += value + "_";
		}
		//uniqueId = uniqueId.substring(0, uniqueId.length); // remove last _
		uniqueId += this.TableObject.attr("id");
	}
	return uniqueId;
}

// get binding data object by row object
JoyTable.prototype.GetDataByRow = function GetDataByRow(rowObj) {
    if (checkIsEmpty(this.DataSource))
        return null;
    if (checkIsEmpty($(rowObj).attr("id")))
        return null;
    var uniqueId = $(rowObj).attr("id");
    return this.GetDataByUniqueId(uniqueId);
}

// get binding data by unique id string
JoyTable.prototype.GetDataByUniqueId = function GetDataByUniqueId(uniqueId) {
    if (checkIsEmpty(this.DataSource))
        return null;
    var lsKeyVals = uniqueId.split("_");
    return this.GetDataByUnikeyVal(lsKeyVals);
}

// get binding data object by list of unique id
JoyTable.prototype.GetDataByUnikeyVal = function GetDataByUnikeyVal(lsKeyVals) {//sourceTypeId, matchId) {
    var lsUniKeys = this.GetUnitueId();
    if (lsKeyVals != null && !Array.isArray(lsKeyVals)) {
        lsKeyVals = [lsKeyVals];
    }
    if (checkIsEmpty(this.DataSource) || checkIsEmpty(lsUniKeys) || checkIsEmpty(lsKeyVals))
        return null;
    var dataIdx = this.GetDataIndexByUnikeyVal(lsKeyVals);
    if (dataIdx == -1)
        return null;
    return this.DataSource[dataIdx];
}

// get index of binding data object by list of unique id
JoyTable.prototype.GetDataIndexByUnikeyVal = function GetDataIndexByUnikeyVal(lsKeyVals) {//sourceTypeId, matchId) {
    var lsUniKeys = this.GetUnitueId();
    if (lsKeyVals != null && !Array.isArray(lsKeyVals)) {
        lsKeyVals = [lsKeyVals];
    }
    if (checkIsEmpty(this.DataSource) || checkIsEmpty(lsUniKeys) || checkIsEmpty(lsKeyVals) || lsUniKeys == "_joytable_autokey_") {
        console.error("No Data Source or Unique Key");
        return -1;
    }
    var bFound = false;
    for (var i = 0; i < this.DataSource.length; i++) {
        for (var j = 0; j < lsUniKeys.length; j++) {
            var value = getObjectValueByKeyPath(this.DataSource[i], lsUniKeys[j]);
            if (value.toString() != lsKeyVals[j].toString()) {
                break;
            }
            if (j == lsUniKeys.length - 1)
                bFound = true;
        }
        if (!bFound)
            continue;
        return i;
    }
    return -1;
}

JoyTable.prototype.GetRowByIndex = function (rowIdx) {
    if (checkIsEmpty(this.DataSource))
        return null;
    return this.TableObject.find("tbody tr")[rowIdx + 1]; // 0th is template row
}

JoyTable.prototype.CancelFocusRow = function () {
    var tmpRow = this.GetFocusRow();
    if (!checkIsEmpty(tmpRow))
        this.ClickRow(tmpRow);
}

// get focus row object
JoyTable.prototype.GetFocusRow = function GetFocusRow() {
    var highlightObj = this.TableObject.find("tr.highlight_text");
    if (highlightObj != null) {
        return highlightObj;
    }
    return null;
}

// get binding data object of focus row
JoyTable.prototype.GetFocusData = function GetFocusData() {
    var lsUniKeys = this.GetUnitueId();
	var highlightObj = this.GetFocusRow(this.TableObject);
	if (highlightObj != null) {
	    return this.GetDataByRow(highlightObj);
	}
	return null;
}

// get checked row objects
JoyTable.prototype.GetCheckedRows = function GetCheckedRows() {
    var result = [];
    var cbObjs = this.TableObject.find("tbody [name='check_row'] [type='checkbox']");
    for (var i = 0; i < cbObjs.length; i++) {
        var cbObj = $(cbObjs[i]);
        if (cbObj.prop("checked")) {
            var uniqueId = cbObj.parents("tr").attr("id");
            if (!checkIsEmpty(uniqueId))
                //result.push(cbObj.parents("tr").attr("id"));
                result.push(cbObj.parents("tr"));
        }
    }
    return result;
}

// get binding data objects of checked rows
JoyTable.prototype.GetCheckedData = function GetCheckedData() {
    var result = [];
    var cbObjs = this.TableObject.find("tbody [name='check_row'] [type='checkbox']");
    for (var i = 0; i < cbObjs.length; i++) {
        var cbObj = $(cbObjs[i]);
        if (cbObj.prop("checked")) {
            var uniqueId = cbObj.parents("tr").attr("id");
            if (!checkIsEmpty(uniqueId))
                result.push(this.GetDataByUniqueId(uniqueId));
        }
    }
    return result;
}

// check table contain data row by unique id string
JoyTable.prototype.HasDataByUniqueId = function HasDataByUniqueId(uniqueId) {
	if (checkIsEmpty(uniqueId))
		return false;
		
	var rowObjs = $(this.TableObject).find("tr[id='" + uniqueId + "']");
	if (rowObjs.length > 0)
		return true;
	return false;
}

// update rows to table and update binding data
JoyTable.prototype.UpdateRows = function UpdateRows(lsData, bFirstRowClick) {
    var tBeginLayout = new Date();
    var lsResult = [];
	if (checkIsEmpty(this.Unikeys)) {
		this.AutoUnikeys = true;
		this.Unikeys = "_joytable_autokey_";
	}
	if (lsData != null && !Array.isArray(lsData)) {
	    lsData = [lsData];
	}
	var doRecoverAll = this.TableEditable && lsData == this.RecoverSource; // update data is RecoverSource, mean reset all data
	var tobeRemoveRecoverSourceIdx = [];

    //var lsUniKeys = this.GetUnitueId();
    for (var i = 0; lsData != null && i < lsData.length; i++) {
        if (this.AutoUnikeys)
			lsData[i]["_joytable_autokey_"] = "_joytable_autokey_" + ((new Date()).getTime()).toString() + "_" + i;
        var result = this.WriteRow(lsData[i], "update", false, true);

        if (this.TableEditable) {
            if (doRecoverAll) // if recover all, remove all _data_changed at this row. RecoverSource will clear later
                result.row.find("._data_changed").removeClass("_data_changed");
            else { // handle by each prop
                if (checkIsEmpty(lsData[i]["_changed_prop"])) { // update data not contain _changed_prop, mean overwrite by new data
                    // reset any changed class of current row
                    result.row.find("._data_changed").removeClass("_data_changed");

                    if (!doRecoverAll) { // if not recover all, should find index for remove
                        // remove from RecoverSource due to new data coming
                        for (var k = 0; k < this.RecoverSource.length; k++) {
                            if (this.RecoverSource[k]["_data_unique_id"] == lsData[i]["_data_unique_id"]) {
                                tobeRemoveRecoverSourceIdx.push(k);
                                break;
                            }
                        }
                    }
                }
                else { // update data contain _changed_prop, mean update by user input. add change class
                    var dirtyPropCssSel = "._" + lsData[i]["_changed_prop"].join(", ._");
                    result.row.find(dirtyPropCssSel).addClass("_data_changed");
                    result.row.find("._data_changed:not(" + dirtyPropCssSel + ")").removeClass("_data_changed");
                }
            }
        }

        //if (this.PostAddRow != null && typeof (window[this.PostAddRow]) === "function") {
			var infoObj = {};
			infoObj.row = result.row;
			infoObj.rowIndex = i;
			infoObj.rowData = lsData[i];
		//    window[this.PostAddRow](infoObj);
        //}
        this.OnRowWrote([infoObj]);
		lsResult.push(result);
    }

    if (doRecoverAll) // all row do recover
        this.RecoverSource = [];
    else if (tobeRemoveRecoverSourceIdx.length > 0) { // partial row data do recover
        for (var i = tobeRemoveRecoverSourceIdx.length - 1; i >= 0; i--) {
            this.RecoverSource.splice(tobeRemoveRecoverSourceIdx[i], 1);
        }
    }

    //this.DataSource = lsData;
    this.FinishAdd(this.SnColVisible, bFirstRowClick);
	var tSpentTime = (new Date() - tBeginLayout);
	if (this.Debug)
	    console.log(this.TableObject.attr("id") + " Draw table spent:" + tSpentTime + "ms");
	return lsResult;
}

// add rows to table and update binding data
JoyTable.prototype.AddRows = function AddRows(lsData, bFirstRowClick) {
	if (checkIsEmpty(this.Configurations) || checkIsEmpty(this.Configurations.columns)) {
		this.TableAutoInitial(lsData);
	}
	var tBeginLayout = new Date();
    var lsResult = [];
	if (checkIsEmpty(this.Unikeys)) {
		this.AutoUnikeys = true;
		this.Unikeys = "_joytable_autokey_";
	}

	var lsRowChecked = []; // default checked row
    //var lsUniKeys = this.GetUnitueId();
    for (var i = 0; lsData != null && i < lsData.length; i++) {
		if (this.AutoUnikeys)
		    lsData[i]["_joytable_autokey_"] = "_joytable_autokey_" + ((new Date()).getTime()).toString() + "_" + i;
		lsData[i]["_data_index"] = i;
		var result = this.WriteRow(lsData[i], "add", false, true);

		if (this.TableEditable) { // add data may contains _changed_prop due to sorting function need calling
		    if (!checkIsEmpty(lsData[i]["_changed_prop"])) {
		        var dirtyPropCssSel = "._" + lsData[i]["_changed_prop"].join(", ._");
		        result.row.find(dirtyPropCssSel).addClass("_data_changed");
		        result.row.find("._data_changed:not(" + dirtyPropCssSel + ")").removeClass("_data_changed");
		    }
		}

		if (lsData[i]["_checked"])
		    lsRowChecked.push(result.row);

        //if (this.PostAddRow != null && typeof (window[this.PostAddRow]) === "function") {
			var infoObj = {};
			infoObj.row = result.row;
			infoObj.rowIndex = i;
			infoObj.rowData = lsData[i];
		//    window[this.PostAddRow](infoObj);
		//}
		this.OnRowWrote([infoObj]);
		lsResult.push(result);
    }
    this.DataSource = lsData;
    //this.SnColVisible = bShowSnCol;
    this.FinishAdd(this.SnColVisible, bFirstRowClick);
    for (var i = 0; i < lsRowChecked.length; i++) {
        this.CheckRow(lsRowChecked[i], true, i == (lsRowChecked.length - 1));
    }
	var tSpentTime = (new Date() - tBeginLayout);
	if (this.Debug)
		console.log(this.TableObject.attr("id") + " Draw table spent:" + tSpentTime + "ms");
}

// write (new/update) a row into table (internal use)
// data: single data from binding data source
JoyTable.prototype.WriteRow = function WriteRow(data, mode, bAutoClick, bNotFinish) {
	var result = { result: false, msg: "", row: null};
	var bAddRow = mode.toLowerCase() == "add";
	if (bAutoClick == undefined)
		bAutoClick = false;
		
	if (checkIsEmpty(this.TableObject)) {
		console.debug("Invalid table object");
		result.msg = "Invalid table object";
		return result;
	}
	if (checkIsEmpty(data)) {
		console.debug("Invalid data");
		result.msg = "Invalid data";
		return result;
	}
	var lsUniKeys = this.GetUnitueId();
	var uniqueId = this.GetUniqueIdByData(data);
	data["_data_unique_id"] = uniqueId;
	if (String.isNullOrWhiteSpace(uniqueId)) {
		console.debug("Unique key unknown");
		result.msg = "Unique key unknown";
		return result;
	}
	var bExisted = this.HasDataByUniqueId(uniqueId);
	if (bAddRow && bExisted) {
		result.msg = "Duplicated";
		return result;
	}
	
	var columnObjs;
	var writingRow = null;
	if (bAddRow) {
	    var newRowObj = this.TableAddRowElement(this.TableObject);
	    writingRow = newRowObj;
	    newRowObj.attr("id", uniqueId);
	    //Binded checking on click column
	    newRowObj.find('td.cb_col ').click(function (event) {
	        if (!$(event.target).is('input')) {
	            $('input:checkbox', this).click();
	        }
	    });
	    newRowObj.find('td.col-edit ').click(function (event) {
	        if (!$(event.target).is('input')) {
	            $('input:checkbox', this).click();
	        }
	    });
		columnObjs = newRowObj.find("td");
	}
	else {
	    var replaceIndex = this.GetDataIndexByUnikeyVal(uniqueId.split("_"));
	    var oldData = this.DataSource[replaceIndex];
	    this.DataSource[replaceIndex] = data;
	    data["_data_index"] = oldData["_data_index"];
	    writingRow = $("#" + uniqueId);
		columnObjs = writingRow.find("td");
		if (checkIsEmpty(columnObjs)) {
		    result.msg = "Target row not found";
		    return result;
		}
	}
	
	var lastGroup = "";
	for (var i = this.ReservedColNums; i < columnObjs.length; i++) { // reserve 0: serial_number, 1: check_row
	    var currentGroup = this.GetGroupNameByCellIndex(i);
	    this.SetColumnContent(columnObjs, i, data);
		
	    //handle row span properties 
	    var rowConfigObj = this.Configurations.list_row;
	    if (!checkIsEmpty(rowConfigObj)) {
	        if (rowConfigObj.rowspan_control) {
                //add group class
	            newRowObj.addClass("rowgroup_" + eval(rowConfigObj.class_add));

                //handle row background color 
	            var style_color = "#e6e6e6";
	            if (eval(rowConfigObj.class_add) % 2) {
	                style_color = "white"
	            }
	            newRowObj.each(function () {
                                this.style.setProperty("background-color", style_color, "important");
	            });

                //handle row hover background color control
	            newRowObj.hover(function () {
	                $(".rowgroup_" + eval(rowConfigObj.class_add)).each(
                        function(){
                            this.style.setProperty("background-color", "#81BEF7", "important");
                        })
	            }, function () {
	                $(".rowgroup_" + eval(rowConfigObj.class_add)).each(
                            function () {
                                this.style.setProperty("background-color", style_color);
                            })
	            })

	        }
	            
	    }


		// right border set black if group changed
		if (!checkIsEmpty(this.TableGroupHeaderObject) &&
			this.TableGroupHeaderObject.children().length > 0) {
			if (lastGroup != currentGroup && i-1>0) {
				$(columnObjs[i-1]).css('border-right-color', 'black');
			}
			else if (i == columnObjs.length - 1) {
				//$(columnObjs[i]).css('border-right-color', 'black');
			}
			lastGroup = currentGroup;
		}
	}
	if (bAutoClick)
		writingRow.click();
	
	if (!bNotFinish)
	    this.FinishAdd(false, false);
	result.row = writingRow;
	result.result = true;
	return result;
}

// get group name by cell index
JoyTable.prototype.GetGroupNameByCellIndex = function (cellIndex) {
    var result = "";
    if (cellIndex == 0)
        result = "SerialNumber";
    else if (cellIndex == 1)
        result = "Checkbox";
    else if (cellIndex < 0)
        result = "";
    else if (!checkIsEmpty(this.TableGroupHeaderObject) && this.GroupNameList.length > 0) {
        result = this.GroupNameList[cellIndex - this.ReservedColNums];
    }
    return result;
}

// get group name by column object
JoyTable.prototype.GetGroupNameByColumnObject = function (columnObj) {
    if (checkIsEmpty(columnObj))
        return "";
    var cellIndex = $(columnObj)[0].cellIndex;
    return this.GetGroupNameByCellIndex(cellIndex);
}

// generate column content by configuration
// data: single data from binding data source
JoyTable.prototype.SetColumnContent = function SetColumnContent(columnObjs, columnIdx, data) {
    // tobe finish: columnObj.attr("statement");
    var columnObj = $(columnObjs[columnIdx]);
    var columnConfigObj = this.Configurations.columns[columnIdx - this.ReservedColNums];

    var tdContent = this.GetOutputContent(columnObjs, columnIdx, data, false);
    //if (checkIsEmpty(data["outputContent"]))
    //    data["outputContent"] = {}
    //data["outputContent"][columnConfigObj.name] = tdContent;
    columnObj.html(tdContent);

    var tdTitleContent = this.GetOutputContent(columnObjs, columnIdx, data, true);
    if (!checkIsEmpty(tdTitleContent))
        columnObj.attr("title", tdTitleContent);
    //Binded checking on click column
    //$(columnObj).click(function (event) {
    //    if (!$(event.target).is('input')) {
    //        $('input:checkbox', this).click();
    //    }
    //});
    return;
}

// generate column content by configuration
JoyTable.prototype.GetOutputContent = function GetOutputContent(columnObjs, columnIdx, data, isTitle) {
    var columnObj = checkIsEmpty(columnObjs) ? null : $(columnObjs[columnIdx]);
    var columnConfigObj = this.Configurations.columns[columnIdx - this.ReservedColNums];

    var keyPrefix = isTitle ? "title_" : "";
    var dataSet = columnConfigObj[keyPrefix + "dataset"]; // list of object. member: dataKey, dataType, dataFormat
	
	if (isTitle && checkIsEmpty(dataSet)) { 	// also check "dataset" contain "title_" if "title_dataset" not exist
		dataSet = columnConfigObj["dataset"];
	}
    if (checkIsEmpty(dataSet)) {
        dataSet = [];
        var dataItem = {};
        dataItem[keyPrefix + "data"] = columnConfigObj[keyPrefix + "data"];
        dataItem[keyPrefix + "data_type"] = columnConfigObj[keyPrefix + "data_type"];
        dataItem[keyPrefix + "time_format"] = columnConfigObj[keyPrefix + "time_format"];
        dataItem[keyPrefix + "time_offset"] = columnConfigObj[keyPrefix + "time_offset"];
        dataItem[keyPrefix + "negative_data"]= columnConfigObj[keyPrefix + "negative_data"];
        dataItem[keyPrefix + "condition_statement"] = columnConfigObj[keyPrefix + "condition_statement"];
        dataItem[keyPrefix + "data_is_text"] = columnConfigObj[keyPrefix + "data_is_text"];
        dataItem[keyPrefix + "rowspan_statement"] = columnConfigObj[keyPrefix + "rowspan_statement"];
        dataSet.push(dataItem);
    }
	
	var bEmptyDataSet = true;
	for (var i=0; bEmptyDataSet && i<dataSet.length; i++) {
		var keys = Object.keys(dataSet[i]);
		for (var j=0; bEmptyDataSet && j<keys.length; j++) {
			if (isTitle)
				if (keys[j].indexOf("title_") != 0)	// only check "title_" property
					continue;

			if (!checkIsEmpty(dataSet[i][keys[j]]))
				bEmptyDataSet = false;
		}
	}

	var embeddedContent = columnConfigObj[keyPrefix + "text"];
	if (checkIsEmpty(embeddedContent) && // if embeddedContent existed, still need output
        bEmptyDataSet)
		return null;
		
	var embeddedContentDomType = null;
	var embeddedContentDomValue = null;
    var bAutoEmbeddedContent = false;
    if (checkIsEmpty(embeddedContent)) { // gen placeholder pattern if no embedded content
        bAutoEmbeddedContent = true;
        embeddedContent = "";
        for (var i = 0; i < dataSet.length; i++) {
            embeddedContent += "${" + i + "}";
            if (i != dataSet.length - 1)
                embeddedContent += " ";
        }
    }
    else {
        // do nothing
        embeddedContentDomType = columnConfigObj[keyPrefix + "text_domtype"]; // select/input-text/radio-group
    }

    var finalOutputContent = embeddedContent;
    var enumArrayIndex = -1;
    //var testAnyRegEx = new RegExp("\\$\\{[0-9]+\\}"); // test any placeholder ${n}  n>=0
    for (var i = 0; i < dataSet.length; i++) {
        var displayContent = "";
        var dataKey = dataSet[i][keyPrefix + "data"];
        var dataType = dataSet[i][keyPrefix + "data_type"];
        var negativeDataKey = dataSet[i][keyPrefix + "negative_data"];
        var dataIsText = dataSet[i][keyPrefix + "data_is_text"];
        var timeFormat = dataSet[i][keyPrefix + "time_format"];
        var timeOffset = dataSet[i][keyPrefix + "time_offset"];
        var boolFormat = dataSet[i][keyPrefix + "bool_format"];
        var conditionStatement = dataSet[i][keyPrefix + "condition_statement"];
        var rowspanStatement = dataSet[i][keyPrefix + "rowspan_statement"];

        var testThisPlaceholder = new RegExp("\\$\\{" + i + "\\}"); // test any placeholder ${n}  n>=0
        var hasAnyPlaceholder = testThisPlaceholder.test(finalOutputContent);
        if (!hasAnyPlaceholder &&
            checkIsEmpty(dataKey))
            continue;

        /* if (checkIsEmpty(dataKey)) {
            finalOutputContent = finalOutputContent.replace(new RegExp("\\$\\{" + i + "\\}", "g"), "");
            continue;
        } */

        if (checkIsEmpty(dataIsText))
            dataIsText = false;

        //rowspan_statement row span
        var span_num = 0;
        var span_pivot_condition = false;
        if (!checkIsEmpty(rowspanStatement) && this.Configurations.list_row.rowspan_control) {
            rowspanStatement = rowspanStatement.replace(/\$\{data\}/g, "data").replace(/ /g, '');
            var lsStatement = rowspanStatement.split(';');
            for (var j = 0; j < lsStatement.length; j++) {
                var statement = lsStatement[j].split(':');
                if (statement[0] == "span_num") {
                    span_num = eval(statement[1]);
                } else if (statement[0] == "span_pivot_condition") {
                    span_pivot_condition = eval(statement[1]);
                }
            }

            if (columnObj != null) {
                if (span_pivot_condition) {
                    if (!checkIsEmpty(columnObj[0])) columnObj[0].rowSpan = span_num;
                }
                else {
                    if (!checkIsEmpty(columnObj[0])) columnObj[0].style.display = "none"
                }
            }
        }




        // condition_statement
        var bConditionHasEnumArray = false;
        var conditionEnumArrayIndex = -1;
        var bConditionSatisfy = false;
        if (!checkIsEmpty(conditionStatement)) { // check condition satisfy if existed
            conditionStatement = conditionStatement.replace(/\$\{data\}/g, "data").trim();
            var enumArrayKeywordIndex = conditionStatement.indexOf("[n]");
            if (enumArrayKeywordIndex >= 0) { // to handle if enum array existed
                bConditionHasEnumArray = true;
                var notSign = conditionStatement[0] == "!" ? "!" : ""; // only for first character in overall condition statement
                if (notSign.length > 0) {
                    conditionStatement = conditionStatement.substr(1);
                    /* remove the "not sign" if it is the first character
                       i will prepend the "not sign" to condition statement due to the statement need rebuild later
                       if won't remove "not sign". it should be rewrite
                         statement without "not sign": "data." insert to statement[0]
                         statement contain "not sign": "data." insert to statement[1]
                    */
                }
                try {
                    var enumArrayName = conditionStatement.substr(0, enumArrayKeywordIndex);
                    var enumArrayLength = eval(notSign + "data." + enumArrayName).length;
                    for (var j = 0; j < enumArrayLength; j++) {
                        var tmpStatement = conditionStatement.replace(/\[n\]/g, "[" + j + "]");
                        bConditionSatisfy = eval(notSign + "data." + tmpStatement) == true;
                        if (bConditionSatisfy) {
                            conditionEnumArrayIndex = j;
                            break;
                        }
                    }
                }
                catch (e) {
                    console.error(keyPrefix + "condition_statement has error: " + conditionStatement);
                }
            }
            else { // to handle normal statement
                try {
                    bConditionSatisfy = eval(conditionStatement) == true;
                }
                catch (e) {
                    console.error(keyPrefix + "condition_statement has error: " + conditionStatement);
                }
            }
        }
        else
            bConditionSatisfy = true;

        var trgDataKey = bConditionSatisfy ? dataKey : negativeDataKey;
        if (dataIsText)
            displayContent = checkIsEmpty(trgDataKey) ? "" : trgDataKey;
        else if (checkIsEmpty(trgDataKey)) {
            displayContent = "";
        }
        else {
            enumArrayIndex = conditionEnumArrayIndex;
            if (bConditionHasEnumArray) {
                trgDataKey = trgDataKey.replace("[n]", "[" + conditionEnumArrayIndex + "]");
            }
            displayContent = getObjectValueByKeyPath(data, trgDataKey);
            if (displayContent === undefined) // use "===" due to distinguish between null and undefined
                displayContent = "";
        }

        if (displayContent == null ||  // allow null due to some value is nullable
			!checkIsEmpty(displayContent)) {
            if (dataType != undefined && data) {
                if (displayContent != null && dataType == "Date" && timeFormat != undefined) {
                    var tmpDt = NewUtcDate(displayContent);
                    if (tmpDt == null) {
                        console.error("JoyTable: detect invalid date time content:[" + tmpDt + "]");
                    }
                    else if (isNaN(timeOffset)) {
                        displayContent = tmpDt.format(timeFormat);
                    }
                    else {
                        displayContent = tmpDt.addHour(timeOffset).format(timeFormat);
                    }
                }
                else if (dataType == "Boolean" && boolFormat != undefined && Object.keys(boolFormat).length >= 2) {
                    displayContent = boolFormat[displayContent];
                }
            }
            if (!this.IsAllowShowingNull && displayContent == null)
                displayContent = "";
        }

        var processDomTypeValue = embeddedContentDomType != null && i == 0;
        if (!processDomTypeValue && // dont translate when current is domtype due to domtype set value will translate again
            displayContent != null && !checkIsEmpty(displayContent) && checkIsString(displayContent)) {
            displayContent = displayContent.replace(/'/g, "&#39;");
            displayContent = displayContent.replace(/"/g, "&#34;");
        }

        finalOutputContent = finalOutputContent.replace(new RegExp("\\$\\{" + i + "\\}", "g"), displayContent);
        if (processDomTypeValue) {
            embeddedContentDomValue = displayContent;
            var tmpDom = $(finalOutputContent)[0];
            switch (embeddedContentDomType) {
                case "select":
                    tmpDom.value = displayContent;
                    if (tmpDom.selectedOptions.length > 0)
                        tmpDom.selectedOptions[0].setAttribute("selected", true);
                    finalOutputContent = tmpDom.outerHTML;
                    break;
                case "input-text":
                    tmpDom.setAttribute("value", displayContent);
                    finalOutputContent = tmpDom.outerHTML;
                    break;
                case "radio-group":
                    var children = tmpDom.children;
                    var childDomNewName = null;
                    var finishSetValue = false;
                    for (var i = 0; i < children.length; i++) {
                        var childDom = children[i];
                        if (childDomNewName == null)
                            childDomNewName = childDom.name + "_uid_" + data._data_unique_id;
                        childDom.name = childDomNewName;
                        if (finishSetValue)
                            continue;
                        var domObjVal = checkIsEmpty(childDom.value) ? "" : childDom.value.trim().toLowerCase().toString();
                        var dispVal = checkIsEmpty(displayContent) ? "" : displayContent.toString().trim().toLowerCase().toString();
                        if (domObjVal == dispVal) {
                            //childDom.checked = true;
                            childDom.setAttribute("checked", "checked");
                        }
                    }
                    finalOutputContent = tmpDom.outerHTML;
                    //console.log("RADIO");
                    break;
                default: break;
            }
        }
    }
    //columnObj.html(finalOutputContent);
    return finalOutputContent;
}

// post process after finish add/update rows (internal use)
JoyTable.prototype.FinishAdd = function FinishAdd(bShowSnCol, bClickFirstRow) {

    if(this.FixDivHeight){
        // to solve the outer div smaller than table div. detect the correct div height
        var tmpHeight = parseInt(this.RootObject.css('height')) - parseInt(this.HeaderRootObject.css('height'));
        if (tmpHeight > 0) // if container div hidden, the value is 0. dont set
            this.CollapseObject.css("height", tmpHeight + "px");

    }
	


    var counter = 0;
    if (bShowSnCol == undefined)
        bShowSnCol = false;
    if (bClickFirstRow == undefined)
        bClickFirstRow = false;

    counter = this.CountRow(bShowSnCol);

    var tableId = this.TableObject.attr("id");

    /* if (!checkIsEmpty(this.TableObject.attr("class")) && this.TableObject.attr("class").indexOf("table-fixed-header") >= 0) {
        //if (this.TableObject.attr("id") == "list_match") {
        //this.FixHeader(this.TableObject);
        this.DoUpdateFixCell();
    } */

    //if (this.Events.OnChanged != null && typeof (window[this.Events.OnChanged]) === "function")
    //    window[this.Events.OnChanged](this);
    this.OnChanged();

    this.SetCounter(counter);
    this.SetCurrentCounter(0, true);
    this.SetSelCounter(0);

    if (bClickFirstRow) {
        var rowObjs = this.TableObject.find("tbody tr.list_data");
        if (!checkIsEmpty(rowObjs)) {
            for (var i = 0; i < rowObjs.length; i++) {
                if ($(rowObjs[i]).attr('class').indexOf("template") < 0) { // not template
                //if ($(rowObjs[i]).height() > 0) { // not hide
                    var rowInputObjs = $(rowObjs[i]).find("input");
                    if (!checkIsEmpty(!rowInputObjs))
                        $(rowInputObjs[0]).focus();
                    //this.ClickRow($(rowObjs[i]));
                    $(rowObjs[i]).click();
                    break;
                }
            }
        }
        //$($("#list_match tbody tr.list_data input")[1]).focus();
        //$($("#list_match tbody tr.list_data")[1]).click();
    }
    //$(window).resize();
    window.dispatchEvent(new Event('resize')); // to be fix
    //console.log('resize1');
    /* ********  because of the time difference problem will cause header layout broken ******** */
    /* ********  so here need to delay 1 sec to resize the header                       ******** */
    setTimeout(function () { window.dispatchEvent(new Event('resize')) }, 1000);
    
    if (this.Draggable) {
    	// check support. jquery-ui-1.10.4
        if (checkIsFunction($("tbody[id*='draggable']").sortable)) {
            $("tbody[id*='draggable']").sortable();
            $("tbody[id*='draggable']").disableSelection();
        }
        else {
            console.log("Need upgrade jquery-ui-1.10.4 for supporting sortable() and disableSelection()");
        }
    }

    return counter;
}

/*
// [deprecated] fix table header
JoyTable.prototype.FixHeader = function FixHeader() {
	//if (this.TableObject.attr("class").indexOf("table-fixed-header") < 0)
	//	return;
    var _this = this;
	$(this.TableObject).floatThead({
		scrollingTop: pageTop,
		useAbsolutePositioning: false,
		scrollContainer: function (_this) {
		    //return $table.closest("div").closest("div");
		    return _this.BodyRootObject;
		}
	});
	$(this.TableObject).floatThead("reflow");
}
*/

// callback event when table scrolling (internal use)
JoyTable.prototype.OnTableScrolling = function OnTableScrolling(e) {
    //console.debug("scrolling x:" + this.BodyRootObject.scrollLeft() + " y:" + this.BodyRootObject.scrollTop());
    this.TableHeaderDivObject.offset({ left: -1 * e.currentTarget.scrollLeft });
}

JoyTable.prototype.OnTableScrollingH = function (e, tblPosition, domObj) {
	//console.debug("scrolling x:" + this.BodyRootObject.scrollLeft() + " y:" + this.BodyRootObject.scrollTop());
	$(domObj).offset({ left: tblPosition.left + -1 * e.currentTarget.scrollLeft });
}

JoyTable.prototype.OnTableScrollingV = function (e, tblPosition, domObj) {
	//console.debug("scrolling x:" + this.BodyRootObject.scrollLeft() + " y:" + this.BodyRootObject.scrollTop());
	$(domObj).offset({ top: tblPosition.top + -1 * e.currentTarget.scrollTop });
}

// callback event when table resizing (internal use)
JoyTable.prototype.OnResizing = function OnResizing(e) {
    //console.debug("Resizing");
    if (!checkIsEmpty(this.TableObject.attr("class"))) {
		if (this.TableObject.attr("class").indexOf("table-fixed-header") >= 0) {
			//if (this.TableObject.attr("id") == "list_match") {
			//this.FixHeader(this.TableObject);
			this.DoUpdateFixCell();
			this.TableHeaderDivObject.css('left', this.ScrollOffset);
		}
		else if (this.TableObject.attr("class").indexOf("table-frozen-header") >= 0) {
			this.DoFrozenTopHeader(this.TableObject)
			//this.TableHeaderDivObject.css('left', this.ScrollOffset);
		}		
		else if (this.applyFixedHeader)
			this.UnDoFixCell();
	}
}

// fix table header
JoyTable.prototype.DoFixCell = function DoFixCell() {
	this.applyFixedHeader = true;
    if (this.TableHeaderDivObject != null) {
        return this.DoUpdateFixCell();
    }
	
    var oriTheadObj = this.TableObject.find("thead");
    var oriTheadHeight = oriTheadObj.height();
    var oriTheadWidth = oriTheadObj.width();    

    // initial new header container
    var newHeaderDivNode = document.createElement("div");
    var newHeaderTableNode = document.createElement("table");
    newHeaderDivNode.setAttribute("style", "position:fixed; z-index:1;");
    $(newHeaderDivNode).css("width", parseInt($(this.TableObject).css("width")) +
                                    parseInt($(this.TableObject).css("borderLeftWidth")) +
                                    parseInt($(this.TableObject).css("borderRightWidth")));
    $(newHeaderDivNode).css("height", oriTheadHeight +
                                    parseInt($(this.TableObject).css("borderTopWidth")) +
                                    parseInt($(this.TableObject).css("borderBottomWidth")));
    $(newHeaderTableNode).attr("style", $(this.TableObject).attr("style"));
    $(newHeaderTableNode).attr("class", $(this.TableObject).attr("class"));
    $(newHeaderTableNode).css("width", $(this.TableObject).css("width"));
    $(newHeaderTableNode).css("height", $(this.TableObject).css("height"));
    $(newHeaderDivNode).append($(newHeaderTableNode));
    this.TableHeaderDivObject = $(newHeaderDivNode);

    // initial fake header container
    var fakeHeaderTheadNode = document.createElement("thead");
    var fakeHeaderTrNode = document.createElement("tr");
    this.TableFakeHeaderTheadObject = fakeHeaderTheadNode;
    $(fakeHeaderTheadNode).append($(fakeHeaderTrNode));

    // set fake header content
    var oriTheadNodes = this.TableHeaderObject.find("th");
    for (var i = 0; i < oriTheadNodes.length; i++) {
        var oriTheadNode = oriTheadNodes[i];
        // force set current width/height to ori th
        var cellWidth = $(oriTheadNode).outerWidth(); // dom offsetWidth
        var cellHeight = $(oriTheadNode).outerHeight(); // dom offsetHeight
        $(oriTheadNode).css("width", cellWidth);
        $(oriTheadNode).css("height", cellHeight);

        // create fake th
        var fakeHeaderThNode = $(oriTheadNode).clone();
        //var fakeHeaderThNode = document.createElement("th");
        //fakeHeaderThNode.innerHTML = "&nbsp;";
        //$(fakeHeaderThNode).attr("style", $(oriTheadNode).attr("style"));
        //$(fakeHeaderThNode).attr("groups", $(oriTheadNode).attr("groups"));
        $(fakeHeaderThNode).css("height", oriTheadHeight);
        $(fakeHeaderTrNode).append($(fakeHeaderThNode));
    }

    // add new header container (empty) to ui
    $(this.BodyRootObject).prepend(this.TableHeaderDivObject); //$(newHeaderDivNode)
    
    // move ori header to new container
    oriTheadObj.prependTo($(newHeaderTableNode));


    // add fake header to table
    $(this.TableObject).prepend($(fakeHeaderTheadNode));

    var domObj = this.BodyRootObject[0];
    domObj.addEventListener("scroll", this._bindingScrollingEventObj, false);
}

// un-fix table header
JoyTable.prototype.UnDoFixCell = function UnDoFixCell() {	
	this.applyFixedHeader = false;
    if (this.TableHeaderDivObject == null)
        return;
    this.ScrollOffset = this.TableHeaderDivObject.css('left');
    var tableOriHeaderTheadObject = this.TableHeaderDivObject.find("thead")[0];
	if (this.TableFakeHeaderTheadObject != null) {
		this.TableFakeHeaderTheadObject.remove();
		this.TableFakeHeaderTheadObject = null;
	}
    $(tableOriHeaderTheadObject).prependTo(this.TableObject);
    this.TableHeaderDivObject.remove();
    this.TableHeaderDivObject = null;
    var domObj = this.BodyRootObject[0];
    domObj.removeEventListener("scroll", this._bindingScrollingEventObj, false);
	
	var frozenDiv = this.TableObject.parent("div[name=div-body]");
	if (!checkIsEmpty(frozenDiv)) {
		var divRoot = frozenDiv.parent();
		$(this.TableObject).prependTo(divRoot);
		frozenDiv.remove();
		frozenDiv = null;
	}
}

// relayout fixed table header
JoyTable.prototype.DoUpdateFixCell = function DoUpdateFixCell() {
    this.UnDoFixCell();
	
	if (!checkIsEmpty(this.TableObject.attr("class"))) {
		if (this.TableObject.attr("class").indexOf("table-fixed-header") >= 0) {
			this.DoFixCell();
		}
		else if (this.TableObject.attr("class").indexOf("table-frozen-header") >= 0) {
			this.DoFrozenTopHeader(this.TableObject)
		}
	}
}

JoyTable.prototype.DoFrozenTopHeader = function (tblObj) {
	this.applyFixedHeader = true;
    if (this.TableHeaderDivObject != null) {
        return this.DoUpdateFixCell();
    }

	var tblParentObj = tblObj.parent(); // original container of table - div
	var tblHeaderObj = tblObj.children('thead'); // original thead
	var tblBodyObj = tblObj.children('tbody'); // original tbody
	var tblPosition = tblObj.position();
	
	if (checkIsEmpty(tblObj.parents("div[name=jt-root]")))
		tblParentObj.attr("name", "jt-root");				
	
	var divHeaderObj = $(document.createElement("div")); // new container(div) for thead
	var divBodyObj = $(document.createElement("div")); // new container(div) for tbody
	this.TableHeaderDivObject = divHeaderObj;
	divHeaderObj.attr('name', 'div-top');
	divBodyObj.attr('name', 'div-body');

	// set fixed to new container of header
	divHeaderObj.css("position", "fixed");
	divHeaderObj.css("z-index", 1);				
	divHeaderObj.css("width", parseInt(tblObj.css("width")) + parseInt(tblObj.css("borderLeftWidth")) + parseInt(tblObj.css("borderRightWidth")));

	// clone new table obj.
	var newTopTblObj = $(document.createElement("table"));
	newTopTblObj.attr("class", tblObj.attr("class"));
	newTopTblObj.attr("style", tblObj.attr("style"));
	newTopTblObj.attr("style", tblObj.attr("width"));
	// newTopTblObj.attr("style", tblObj.attr("height"));
	
	// clone thead
	var newTopHeaderObj = tblObj.children('thead').clone();	
	this.TableFakeHeaderTheadObject = newTopHeaderObj;
	newTopHeaderObj.attr('name', 'cloned');
	
	var oriTheadNodes = tblHeaderObj.find("th");
	for (var i=0; i<oriTheadNodes.length; i++) {
        var oriTheadNode = oriTheadNodes[i];
        // force set current width/height to ori th
        var cellWidth = $(oriTheadNode).outerWidth(); // dom offsetWidth
        var cellHeight = $(oriTheadNode).outerHeight(); // dom offsetHeight
        $(oriTheadNode).css("width", cellWidth);
        $(oriTheadNode).css("height", cellHeight);
	}
	
	// move ori header to cloned table and cloned header to ori table
	tblHeaderObj.appendTo(newTopTblObj);
	newTopHeaderObj.prependTo(tblObj);
	tblHeaderObj.css('background-color', 'green'); // for debug
	
	// add new container(div) to ui
	tblParentObj.prepend(divBodyObj);
	tblParentObj.prepend(divHeaderObj);
	
	// move old/new table to new container(div)
	divHeaderObj.prepend(newTopTblObj);
	divBodyObj.prepend(tblObj);
	
	// listen container scolling event and trigger fixed header scroll
	//var domObj = tblParentObj[0];
	var domObj = tblObj.parents("div [name=jt-root]")[0];
	var _bindingScrollingEventObj = {
										handleEvent: function (e) {
											// this.bindingObj.OnTableScrolling(e);
											this.tableClassObj.OnTableScrollingH(e, tblPosition, this.bindingObj);
										},
										bindingObj: divHeaderObj,
								        tableClassObj: this,
									};
	domObj.addEventListener("scroll", _bindingScrollingEventObj, true);
}

JoyTable.prototype.DoFrozenLeft = function (tblObj, frozenColIdx) {
	if (frozenColIdx < 0) {
		console.log("JoyTable: Frozen column index not set");
		return false;
	}
	var tblParentObj = tblObj.parent(); // original container of table - div
	var tblHeaderObj = tblObj.children('thead'); // original thead
	var tblBodyObj = tblObj.children('tbody'); // original tbody
	var tblLeftThTdObjs = [];//tblObj.find("th:first-child, td:first-child");
	var tblLeftTopThTdObjs = [];
	var tblPosition = tblObj.position();
	
	if (checkIsEmpty(tblObj.parents("div[name=jt-root]")))
		tblParentObj.attr("name", "jt-root");		
	
	//var frozenColIdx = 3; // begin at 1
	var leftTblWidth = 0;
	for (var i=1; i<=frozenColIdx; i++) {
		var leftThObjs = tblObj.find("th:nth-child(" + i + ")").addClass("jt-left");
		var leftTdObjs = tblObj.find("td:nth-child(" + i + ")").addClass("jt-left");
		//if (i == 1)
		//	leftTblWidth += parseInt(leftThObjs.eq(0).css("borderLeftWidth"));
		leftTblWidth += parseInt(leftThObjs.eq(0).css("width"));// + 
		//if (i == frozenColIdx)
		//	leftTblWidth += parseInt(leftThObjs.eq(0).css("borderRightWidth"));
		var colObj = { th: leftThObjs, td: leftTdObjs };
		tblLeftThTdObjs.push(colObj);
	}
	
	//var divHeaderObj = $(document.createElement("div")); // new container(div) for thead
	var divBodyObj = $(document.createElement("div")); // new container(div) for tbody
	var divLeftObj = $(document.createElement("div"));
	var newLeftTblObj = tblObj.clone();
	newLeftTblObj.attr("id", newLeftTblObj.attr("id") + "_frozen_left");
	//var divLeftObj = newLeftTblObj; // new container(div) for left
	//divHeaderObj.attr('name', 'div-top');
	divBodyObj.attr('name', 'div-right');
	divLeftObj.attr('name', 'div-left');

	//// set fixed to new container of header
	//divHeaderObj.css("position", "fixed");
	//divHeaderObj.css("z-index", 1);				
	//divHeaderObj.css("width", parseInt(tblObj.css("width")) + parseInt(tblObj.css("borderLeftWidth")) + parseInt(tblObj.css("borderRightWidth")));
	// ..left
	divLeftObj.css("position", "fixed");
	divLeftObj.css("z-index", 1);				
	divLeftObj.css("height", parseInt(tblObj.css("height")) + parseInt(tblObj.css("borderTopWidth")) + parseInt(tblObj.css("borderBottomWidth")));
	divLeftObj.css("width", leftTblWidth);

	//// clone new table obj.
	//var newTopTblObj = $(document.createElement("table"));
	//newTopTblObj.attr("class", tblObj.attr("class"));
	//newTopTblObj.attr("style", tblObj.attr("style"));
	//newTopTblObj.attr("style", tblObj.attr("width"));
	// newTopTblObj.attr("style", tblObj.attr("height"));
	// ..left
	//var newLeftTblObj = $(document.createElement("table"));
	//newLeftTblObj.attr("class", tblObj.attr("class"));
	//newLeftTblObj.attr("style", tblObj.attr("style"));
	//newLeftTblObj.attr("style", tblObj.attr("height"));
	// newLeftTblObj.attr("style", tblObj.attr("width"));
	
	//// clone thead
	//var newTopHeaderObj = tblHeaderObj.clone();//tblObj.children('thead').clone();								
	//newTopHeaderObj.attr('name', 'cloned');
	// .. left
	newLeftTblObj.find("th:not(.jt-left), td:not(.jt-left)").remove();
	//var newLeftThTdObjs = DeepClone(tblLeftThTdObjs);//tblObj.find("th:first-child, td:first-child").clone();
	newLeftTblObj.find("th,td").attr('name', 'cloned');
	newLeftTblObj.css('background-color', 'red'); // for debug
	
	//// move ori header to cloned table and cloned header to ori table
	//tblHeaderObj.appendTo(newTopTblObj);
	//newTopHeaderObj.prependTo(tblObj);
	//tblHeaderObj.css('background-color', 'green'); // for debug
	// .. left
	//tblLeftThTdObjs.appendTo(newLeftTblObj);
	
	//---tblLeftThTdObjs.find("th").appendTo(newLeftTblObj.find("thead"));
	//---tblLeftThTdObjs.find("td").appendTo(newLeftTblObj.find("tbody"));
	
	//newLeftThTdObjs.prependTo(tblObj);
	//tblLeftThTdObjs.css('background-color', 'green'); // for debug
	var headOfNewLeftTblObj = newLeftTblObj.find("thead tr");
	var bodyOfNewLeftTblObj = newLeftTblObj.find("tbody tr");
	tblObj.find("thead tr").each(function(row){
		var tds = $(this).find("th.jt-left");
		var rowIdx = $(this).index();					
		headOfNewLeftTblObj.eq(rowIdx).append(tds);
	});
	tblObj.find("tbody tr").each(function(row){
		var tds = $(this).find("td.jt-left");
		var rowIdx = $(this).index();					
		bodyOfNewLeftTblObj.eq(rowIdx).append(tds);
	});
	var headOfTblObj = tblObj.find("thead tr");
	var bodyOfTblObj = tblObj.find("tbody tr");
	newLeftTblObj.find("thead tr").each(function(row){
		var tds = $(this).find("th[name='cloned']");
		var rowIdx = $(this).index();					
		headOfTblObj.eq(rowIdx).prepend(tds);
	});
	newLeftTblObj.find("tbody tr").each(function(row){
		var tds = $(this).find("td[name='cloned']");
		var rowIdx = $(this).index();					
		bodyOfTblObj.eq(rowIdx).prepend(tds);
	});
	//// add new container(div) to ui
	tblParentObj.prepend(divBodyObj);
	//tblParentObj.prepend(divHeaderObj);
	tblParentObj.prepend(divLeftObj);
	
	
	//// move old/new table to new container(div)
	//divHeaderObj.prepend(newTopTblObj);
	divBodyObj.prepend(tblObj);
	divLeftObj.prepend(newLeftTblObj);
	
	//// listen container scolling event and trigger fixed header scroll
	//var domObj = tblParentObj[0];
	var domObj = tblObj.parents("div [name=jt-root]")[0];
	var _bindingScrollingEventObj = {
										handleEvent: function (e) {
											// this.bindingObj.OnTableScrolling(e);
											this.tableClassObj.OnTableScrollingV(e, tblPosition, this.bindingObj);
										},
										bindingObj: divLeftObj,
								        tableClassObj: this,
									};
	domObj.addEventListener("scroll", _bindingScrollingEventObj, true);
	return true;
}

JoyTable.prototype.DoFrozenTable = function (columnIdx) {
	if (checkIsEmpty(columnIdx)) {
		columnIdx = this.frozenColIdx;
	}

	var bFrozenLeftOk = this.DoFrozenLeft(this.TableObject, columnIdx);
	if (!bFrozenLeftOk)
		return;
	
	this.DoFrozenTopHeader(this.TableObject);
	
	var tableId = this.TableObject.attr("id");	
	this.DoFrozenTopHeader($("#" + tableId + "_frozen_left"));
	
}

// show/hide column
JoyTable.prototype.ShowHideColumn = function ShowHideColumn(colName, bShowCol) {
    if (!checkIsEmpty(this.Configurations) && !checkIsEmpty(this.Configurations["groups"])) {
        var cellIndexes = ArrayFind(this.ColumnNameList, colName);  // this.ColumnNameList.find(colName);
        for (var i = 0; i < cellIndexes.length; i++) {
            var currentGroup = this.GetGroupNameByCellIndex(cellIndexes[i]);
            this.TableGroupHeaderObject.each(function () {
                var colSpan = parseInt($(this).attr("colspan"));
                if (bShowCol)
                    colSpan++;
                else
                    colSpan--;
                $(this).attr("colspan", colSpan);
            });
        }
    }

    this.TableHeaderObject.find("[name=" + colName + "]").each(function () {
        if (bShowCol)
            $(this).removeClass("hide");
        else
            $(this).addClass("hide");
    });

    // show/hide th/td column 
    this.TableObject.find("[name=" + colName + "]").each(function () {
        if (bShowCol)
            $(this).removeClass("hide");
        else
            $(this).addClass("hide");
    });
    //$(window).resize();
    window.dispatchEvent(new Event('resize'));
}

// show/ hide group column
JoyTable.prototype.ShowHideGroups = function ShowHideGroups(groupName, bShowCol) {
    // show/hide thead's th group
    this.TableTheadObject.find("[name=" + groupName + "],[groups=" + groupName + "]").each(function () {
        if (bShowCol)
            $(this).removeClass("hide");
        else
            $(this).addClass("hide");
    });

    // show/hide th/td group column
    this.TableObject.find("[groups=" + groupName + "]").each(function () {
        if (bShowCol)
            $(this).removeClass("hide");
        else
            $(this).addClass("hide");
    });
    //$(window).resize();
    window.dispatchEvent(new Event('resize'));
}

JoyTable.prototype.ShowHideRowByIndex = function(index, bShow) {
	var rowObj = this.GetRowByIndex(index);
	this.ShowHideRowByRowObj(rowObj, bShow);
}

JoyTable.prototype.ShowHideRowByRowObj = function(obj, bShow) {
	if (bShow)
		$(obj).removeClass("hide");
	else
		$(obj).addClass("hide");
}

JoyTable.prototype.ShowAllRows = function() {
	this.TableObject.find("tbody tr.hide").each(function () {
		if ($(this).hasClass("template"))
			return;
		$(this).removeClass("hide");
	});
    this.SetCurrentCounter(0,true);
}

// click a row of table
JoyTable.prototype.ClickRow = function ClickRow(rowDomObj) {
    var clickStatus;
    var highlightRow = this.GetFocusRow(this.TableObject);
    //if (highlightRow != null) {
    //    highlightRow.removeClass("highlight_text");
    //}
    var rowObj = $(rowDomObj);

    //row span click control
    if (!checkIsEmpty(this.Configurations.list_row)) {
        if (this.Configurations.list_row.rowspan_control) {
            var group_index = rowDomObj.find("#pivot_div_list_dup_match").text();
            rowObj = $('.rowgroup_' + rowDomObj.find("#pivot_div_list_dup_match").text());
        }
    }
    if (checkIsEmpty(highlightRow)) { // first highlight row
        rowObj.addClass("highlight_text");
        clickStatus = "clickfirst";
    }
    else if (highlightRow.hasClass("highlight_text") && (highlightRow.attr("id") == rowDomObj.attr("id"))) { // click self
        if (this.AllowUnFocus) {
            highlightRow.removeClass("highlight_text");
            clickStatus = "clickcancel";
        }
        else {
            console.warn("Cancel click failed. Shoule set true to allow_un_focus attribute");
        }
    }
    else { // click another row
        highlightRow.removeClass("highlight_text");
        rowObj.addClass("highlight_text");
        clickStatus = "clickchanged";
    }
    
    //if (this.Events.OnRowClicked != null && typeof (window[this.Events.OnRowClicked]) === "function")
    //    window[this.Events.OnRowClicked](this, rowDomObj);
    this.OnRowClicked([rowDomObj], clickStatus);
}

// check all rows of table
JoyTable.prototype.CheckAllRow = function CheckAllRow(checkStatus) {
    var cbAllObj = this.TableObject.find("[name='check_row'] [type='checkbox']");
    if (this.TableHeaderDivObject != null) {
        cbAllObj = this.TableHeaderDivObject.find("[name='check_row'] [type='checkbox']");
    }

    if (!checkIsEmpty(cbAllObj))
        cbAllObj = $(cbAllObj[0]);
    else {
        console.warn("Check all element not found");
        return;
    }
    var setValue = true;
    if (checkIsEmpty(checkStatus))
        setValue = cbAllObj.prop("checked");
    else {
        setValue = checkStatus;
        cbAllObj.prop("checked", checkStatus);
    }

    var trRowObjs = this.TableObject.find("tbody tr");
    for (var i = 0; i < trRowObjs.length; i++) {
        var trRowObj = $(trRowObjs[i]);
        if (trRowObj.attr("class").indexOf("template") >= 0)
            continue;
		if (trRowObj.hasClass("hide"))
			continue;
        //var lastObj = (i == trRowObjs.length - 1);
        this.CheckRow(trRowObj, setValue, false);
    }
	this.FinishCheckRow();
	/* 
    var cbObjs = this.TableObject.find("tbody [name='check_row'] [type='checkbox']");
    for (var i = 0; i < cbObjs.length; i++) {
        var cbObj = cbObjs[i];
        var trRowObj = $(cbObj).parents("tr");
        if (trRowObj.attr("class").indexOf("template") >= 0)
            continue;
        var lastObj = (i == cbObjs.length - 1);
        this.CheckRow(trRowObj, setValue, lastObj);
    }
	 */
}

// check a row of table
JoyTable.prototype.CheckRow = function CheckRow(rowDomObj, checkStatus, finishCheck) {
    var rowObj = $(rowDomObj);
    var cbObj = $(rowDomObj).find("[name='check_row'] [type='checkbox']");
    var uniqueId = rowObj.attr("id");
    var setValue = true;// = cbObj.prop("checked");
    var checkedRows = this.GetCheckedRows();
    if (this.RowSelectable && this.SingleSelect && checkedRows.length > 1) {
        for (var i = 0; i < checkedRows.length;i++){
            $(checkedRows[i]).find("[name='check_row'] [type='checkbox']").prop("checked", false);
            $(checkedRows[i]).removeClass("highlight_background");
        }
        cbObj.prop("checked", true);
        //$(checkedRows[0]).find("[name='check_row'] [type='checkbox']").prop("checked", false);
        //$(checkedRows[0]).removeClass("highlight_background");
    }
    if (checkIsEmpty(finishCheck))
        finishCheck = true;
    if (cbObj.prop('disabled')) {
        return;
    }

    if (checkIsEmpty(checkStatus)) {
        setValue = cbObj.prop("checked");
    }
    else {
        setValue = checkStatus;
        cbObj.prop("checked", checkStatus);
    }

    if (setValue) {
        rowObj.addClass("highlight_background");
        var theData = this.GetDataByUniqueId(uniqueId);
        if (!checkIsEmpty(theData))
            theData["_checked"] = true;
    }
    else {
        rowObj.removeClass("highlight_background");
        var theData = this.GetDataByUniqueId(uniqueId);
        if (!checkIsEmpty(theData))
            delete theData["_checked"];
    }
    
    if (!checkIsEmpty(uniqueId)) {
        // update (add/remove) check object in list?
    }

    if (finishCheck) {
		this.FinishCheckRow();
        //var checkedRows = this.GetCheckedRows();
        //this.SetSelCounter(checkIsEmpty(checkedRows) ? 0 : checkedRows.length);
		//if (this.Events.OnRowChecked != null && typeof (window[this.Events.OnRowChecked]) === "function")
		//	window[this.Events.OnRowChecked](this, checkedRows);
    }
}

JoyTable.prototype.FinishCheckRow = function(){
	var checkedRows = this.GetCheckedRows();
	this.SetSelCounter(checkIsEmpty(checkedRows) ? 0 : checkedRows.length);
	//if (this.Events.OnRowChecked != null && typeof (window[this.Events.OnRowChecked]) === "function")
    //	window[this.Events.OnRowChecked](this, checkedRows);
    this.OnRowChecked(checkedRows);
}

// [deprecated] show message on top row
JoyTable.prototype.ShowMessage = function ShowMessage(showHide, message) {
	var messageRowObj = this.TableObject.find("#message_field");
	if (messageRowObj.length > 0) {
		messageRowObj.text(message);
		if (showHide)
			//messageRowObj.attr("style", "");
			messageRowObj.removeClass("hide");
		else
			//messageRowObj.attr("style", "display:none");
			messageRowObj.addClass("hide");
	}
}

// clone a template row (internal use)
JoyTable.prototype.TableAddRowElement = function TableAddRowElement() {
	//var this.TableObject = $(obj);
	var headerObjs = this.TableObject.find(".list_header th");
	var headerObjRoot = this.TableObject.find(".list_header");
	
	var templateObj = this.TableObject.find("#data_template_" + this.RootObject.attr('id')); // find the template obj
	var className = templateObj.attr("class");
	var trParent = templateObj.parent(); // find tr container
	
	//var hasTitleRow = (trParent.find(".list_header th").length > 0);
	// begin to clone
	var cloneObj = templateObj.clone();
	//cloneObj.html(cloneObj.html().replace(/_N/g, "_" + (idx + i))); // replace keyword
	//cloneObj.html(cloneObj.html().replace(/select2/g, "select")); // replace keyword
	templateObj.parent().append(cloneObj); // insert obj
	
	// attach data attribute from th to cloned td
	var cloneTdObjs = cloneObj.find("td");
	for (var i=0; i<cloneTdObjs.length; i++) {
		var tdObj = $(cloneTdObjs[i]);
		var tdName = tdObj.attr("name");
		if (!checkIsEmpty(tdName)) {
			var headerObj = headerObjRoot.find("th[name=" + tdName + "]");
			if (!checkIsEmpty(headerObj)) {
                // remove data attr
				//var dataField = headerObj.attr("data");
				//tdObj.attr("data", dataField);
			}
		}
        // binding click event on specifial td element
		if (tdName == "check_row") {
		    var checkObj = tdObj.find("input[type='checkbox']");
		    var bindingColEventObj = {
		        handleEvent: function (e) {
		            this.tableClassObj.CheckRow(this.rowObj);
		        },
		        tableClassObj: this,
		        rowObj: cloneObj
		    };
		    $(checkObj)[0].addEventListener("click", bindingColEventObj, false);
		}
	}
	cloneObj.removeClass("template");
	cloneObj.removeClass("hide");

    // binding click event on row
	var bindingRowEventObj = {
	    handleEvent: function (e) {
	        this.tableClassObj.ClickRow(this.rowObj);
	    },
	    tableClassObj: this,
        rowObj: cloneObj
	};
	$(cloneObj)[0].addEventListener("click", bindingRowEventObj, false);
    // todo: checkbox add listener
	return cloneObj;
}

// clear table content
JoyTable.prototype.Clear = function Clear() {
    var reservedClassNames = ["list_header", "template"];
	var rowObjs = this.TableObject.find("tbody tr");
	for (var i=0; i<rowObjs.length; i++) {
		var rowObj = $(rowObjs[i]);
		var classNames = rowObj.attr("class").split(" ");
		var bIsReserved = false;
		for (var j=0; j<classNames.length; j++) {
			var className = classNames[j];
			if (reservedClassNames.indexOf(className) >= 0) {
				bIsReserved = true;
				break;
			}
		}
		if (bIsReserved)
			continue; // skip this row
		rowObj.remove();
	}
	var headerSortIcons = this.TableHeaderObject.find("img");
	for (var i=0; i<headerSortIcons.length; i++) {
		var headerSortIconObj = $(headerSortIcons[i]);
		if (headerSortIconObj.attr("src").indexOf("sort") >= 0) {
			headerSortIconObj.addClass("hide");
			headerSortIconObj.attr("src", "/images/sort_az.png");
		}
	}
    this.TableTheadObject.find("input[type='checkbox']").prop('checked',false);
    this.FinishAdd(0, false);
	//if (this.Events.OnClear != null && typeof (window[this.Events.OnClear]) === "function")
    //    window[this.Events.OnClear](this);
    this.OnCleared();
	
	//if (this.Events.OnChanged != null && typeof (window[this.Events.OnChanged]) === "function")
    //    window[this.Events.OnChanged](this);
    this.OnChanged();
}

// count row and update record/selected row counter (internal use)
JoyTable.prototype.CountRow = function CountRow(bShowSn) {
    if (bShowSn == undefined)
        bShowSn = false;

    //var headerObjs = $(this.TableObject.find("th[name=serial_number]"));
    var headerObjs = this.TableTheadObject.find("th[name=serial_number]");
    for (var i = 0; i < headerObjs.length; i++) {
        if (bShowSn) {
            $(headerObjs[i]).css("display", "");
        }
    }
    //$(headerObjs[i]).removeClass("hide");
    var rowObjs = this.TableObject.find("tbody tr:not(.template)"); // get each data row
    var counter = 0;
	if (checkIsEmpty(rowObjs))
		return 0;
    //handle row span properties 
    var rowConfigObj = this.Configurations.list_row;
    var bRowSpan = false;
    var groupCounter = 0;
    if (!checkIsEmpty(rowConfigObj)) {
        if (rowConfigObj.rowspan_control) {
            bRowSpan = true;
        }
    }
    for (var i = 0; i < rowObjs.length; i++) {
        var rowObj = $(rowObjs[i]);
        if (rowObj.attr("class").indexOf("hide") >= 0) // don't check height(). becoz sometimes the ui not shown
            continue;
        counter++;
        if (bRowSpan) {
            if ($('.rowgroup_' + i).length>0) {
                groupCounter++;
            }
        }

        if (bShowSn != true) // return if no need show sn
            continue;

        var snColObjs = rowObj.find("[name=serial_number]");
        if (checkIsEmpty(snColObjs)) // return if sn column not found
            continue;

        var snColObj = $(snColObjs[0]);
        snColObj.attr("style", "");
        snColObj.find(':not(:has(*))').text(counter); // set the number to text
        //snColObj.text(counter); // set the number to text
    }
    if (bRowSpan) {
        return groupCounter;
    }
    return counter;
}

// show/hide serial number column of table
JoyTable.prototype.ShowSn = function ShowSn(bShowSn) {
    this.SnColVisible = bShowSn;
    if (checkIsEmpty(bShowSn))
        bShowSn = true;

    return this.CountRow(bShowSn);
}

// show/hide check box column of table
JoyTable.prototype.ShowCheckbox = function ShowCheckbox(bShowCk) {
    this.RowSelectable = bShowCk;
    var checkObjs = this.TableObject.find("[name=check_row]");
    for (var i = 0; i < checkObjs.length; i++) {
        var checkObj = $(checkObjs[i])
        if (bShowCk) {
            //checkObj.attr("style", checkObj.attr("style").replace("display:none;", ""));
            checkObj.css("display", "");
        }
        else {
            //if (checkObj.attr("style").indexOf("display:none") < 0)
            //    checkObj.attr("style", "display:none;" + checkObj.attr("style"));
            checkObj.css("display", "none");
        }
    }
}

// [deprecated] scroll table to indicated row by id
JoyTable.prototype.ScrollTo = function ScrollTo(id, topOffset) {
	var target = $("#" + id);
	var container = null;
	
	container = this.TableObject.parents("div");
	if (checkIsEmpty(container)) {
		container = table.parents("body");
		if (checkIsEmpty(container))
			return;
	}
	
	var tableHeadHeight = this.TableObject.find("thead").height();
	
	for (var i=0; i<container.length; i++) {
		var trgContainer = $(container[i]);
		if (!trgContainer.hasScrollBar())
			continue;
		//if (!checkIsEmpty(trgContainer.attr("style")) && trgContainer.attr("style").indexOf("scrollable") < 0)
		//	continue;
		trgContainer.animate({
			scrollTop: target.offset().top - topOffset - tableHeadHeight
		}, 1000)
	}
}

JoyTable.prototype.BindEvent = function (eventName, funcOrName, addOrRemove) {
    if (checkIsEmpty(eventName) || checkIsEmpty(funcOrName))
        return;
    if (checkIsEmpty(addOrRemove))
        addOrRemove = "add";
    else
        addOrRemove = addOrRemove.toLowerCase();

    eventName = eventName.toLowerCase();
    var callbackFunc = null;
    if (checkIsFunction(funcOrName))
        callbackFunc = funcOrName;
    else if (checkIsString(funcOrName)) {
        if (checkIsFunction(window[funcOrName]))
            callbackFunc = window[funcOrName];
    }
    if (callbackFunc == null) {
        console.log("JoyTable: The binding callback is not a function");
        return;
    }
    var targetEventList = null;
    switch (eventName) {
        case "onchanged":
            if (this.Events.OnChanged == null) this.Events.OnChanged = [];
            targetEventList = this.Events.OnChanged;
            break;
        case "onclear":
            if (this.Events.OnCleared == null) this.Events.OnCleared = [];
            targetEventList = this.Events.OnCleared;
            break;
        case "onrowwrote":
            if (this.Events.OnRowWrote == null) this.Events.OnRowWrote = [];
            targetEventList = this.Events.OnRowWrote;
            break;
        case "onrowclicked":
            if (this.Events.OnRowClicked == null) this.Events.OnRowClicked = [];
            targetEventList = this.Events.OnRowClicked;
            break;
        case "onrowchecked":
            if (this.Events.OnRowChecked == null) this.Events.OnRowChecked = [];
            targetEventList = this.Events.OnRowChecked;
            break;
        default:
            console.log("JoyTable: The binding event " + eventName + " is invalid");
            return;
    }

    if (addOrRemove == "add")
        targetEventList.push(callbackFunc);
    else if (addOrRemove == "remove") {
        var idx = targetEventList.indexOf(callbackFunc);
        if (idx >= 0)
            targetEventList.splice(idx, 1);
    }
}

JoyTable.prototype.OnChanged = function () {
    if (this.Events != null && this.Events.OnChanged != null) {
        if (typeof (window[this.Events.OnChanged]) === "function") // convert string to function. for compatible to old version
            window[this.Events.OnChanged](this);
        else if (checkIsArray(this.Events.OnChanged) && this.Events.OnChanged.length > 0) {
            for (var i = 0; i < this.Events.OnChanged.length; i++) {
                var callbackFunc = this.Events.OnChanged[i];
                if (typeof (callbackFunc) === "function")
                    callbackFunc({ JoyTable: this });
            }
        }
    }
}

JoyTable.prototype.OnCleared = function () {
    if (this.Events != null && this.Events.OnCleared != null) {
        if (typeof (window[this.Events.OnCleared]) === "function") // convert string to function. for compatible to old version
            window[this.Events.OnCleared](this);
        else if (checkIsArray(this.Events.OnCleared) && this.Events.OnCleared.length > 0) {
            for (var i = 0; i < this.Events.OnCleared.length; i++) {
                var callbackFunc = this.Events.OnCleared[i];
                if (typeof (callbackFunc) === "function")
                    callbackFunc({ JoyTable: this });
            }
        }
    }
}

JoyTable.prototype.OnRowWrote = function (rowDomObjs) {
    if (this.Events != null && this.Events.OnRowWrote != null) {
        if (typeof (window[this.Events.OnRowCliOnRowWrotecked]) === "function") // convert string to function. for compatible to old version
            window[this.Events.OnRowWrote](this);
        else if (checkIsArray(this.Events.OnRowWrote) && this.Events.OnRowWrote.length > 0) {
            for (var i = 0; i < this.Events.OnRowWrote.length; i++) {
                var callbackFunc = this.Events.OnRowWrote[i];
                if (typeof (callbackFunc) === "function")
                    callbackFunc({ JoyTable: this, DomObjs: rowDomObjs });
            }
        }
    }
}

JoyTable.prototype.OnRowClicked = function (rowDomObjs, clickStatus) {
    if (this.Events != null && this.Events.OnRowClicked != null) {
        if (typeof (window[this.Events.OnRowClicked]) === "function") // convert string to function. for compatible to old version
            window[this.Events.OnRowClicked](this);
        else if (checkIsArray(this.Events.OnRowClicked) && this.Events.OnRowClicked.length > 0) {
            for (var i = 0; i < this.Events.OnRowClicked.length; i++) {
                var callbackFunc = this.Events.OnRowClicked[i];
                if (typeof (callbackFunc) === "function")
                    callbackFunc({ JoyTable: this, DomObjs: rowDomObjs, Status: clickStatus });
            }
        }
    }
}

JoyTable.prototype.OnRowChecked = function (rowDomObjs) {
    if (this.Events != null && this.Events.OnRowChecked != null) {
        if (typeof (window[this.Events.OnRowChecked]) === "function") // convert string to function. for compatible to old version
            window[this.Events.OnRowChecked](this);
        else if (checkIsArray(this.Events.OnRowChecked) && this.Events.OnRowChecked.length > 0) {
            for (var i = 0; i < this.Events.OnRowChecked.length; i++) {
                var callbackFunc = this.Events.OnRowChecked[i];
                if (typeof (callbackFunc) === "function")
                    callbackFunc({ JoyTable: this, DomObjs: rowDomObjs });
            }
        }
    }
}

JoyTable.prototype.ExportFilterConditions = function () {
    var sample = [];
    if (checkIsEmpty(this.Configurations) || checkIsEmpty(this.Configurations.columns)) {
        console.error("Table configuration not initial");
        return JSON.stringify(sample);
    }

    for (var i = 0; i < this.Configurations.columns.length; i++) {
        var col = this.Configurations.columns[i];
        sample.push({
            Key: col.data,
            Value: ""
        });
    }
    return JSON.stringify(sample);
}

// act: add/update / remove/delete
// inConditions: when act:add [{Key:key1, Value:val1}, {Key:key2, Value:val2}...]
//               when act:remove ["key1", "key2", ...]
JoyTable.prototype.SetFilterCondition = function (act, inConditions) {
    if (checkIsEmpty(inConditions))
        return;
    for (var i = 0; i < inConditions.length; i++) {
        var item = inConditions[i];
        if (act == "remove" || act == "delete") {
            for (var j = 0; j < this.FilterConfig.Conditions.length; j++) {
                var filterCfg = this.FilterConfig.Conditions[j];
                if (filterCfg.Key == item) {
                    this.FilterConfig.Conditions.splice(j, 1);
                    break;
                }
            }
        }
        else if (act == "add" || act == "update") {
            if (checkIsEmpty(item.Key))
                continue;
            var found = false;
            for (var j = 0; j < this.FilterConfig.Conditions.length; j++) {
                var filterCfg = this.FilterConfig.Conditions[j];
                if (filterCfg.Key == item.Key) {
                    filterCfg.Value = item.Value;
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.FilterConfig.Conditions.push(item);
            }
        }
    }
}

JoyTable.prototype.ApplyFilter = function () {
    if (//this.FilterConfig.Checked ||
        checkIsEmpty(this.FilterConfig.Conditions))
        return;

    this.FilterConfig.Checked = true;
    var filters = [];
    for (var i = 0; i < this.FilterConfig.Conditions.length; i++) {
        var cond = this.FilterConfig.Conditions[i];
        filters.push(this.CreateJoyTableFilterItem(cond.Key, cond.Value));
    }
    this.DoFilter(filters);
}

JoyTable.prototype.CancelFilter = function () {
    if (this.FilterConfig.Checked) {
        this.ShowAllRows();
        this.FilterConfig.Checked = false;
    }
}

// inner filter function
JoyTable.prototype.DoFilter = function (lsCondition) {
        if ((lsCondition && !lsCondition.length)) {
            var array = new Array();
            array.push(lsCondition);
            lsCondition = array;
        }
        this.ShowAllRows();
        if (!lsCondition || !lsCondition.length) {
            return;
        }
        if (!this.DataSource) {
            return;
        }

        var rows = this.TableObject.find("tbody tr");
        //Row of index 0 is template
        for (var i = 1; i < rows.length; i++) {
            var dataRow = rows[i];
            var dataObj = this.GetDataByRow(dataRow);

            for (var j = 0; j < lsCondition.length; j++) {
                var filter = lsCondition[j];
                //if Keyword not effective
                if (!filter.KeyList)
                    continue;
                //if prop not exist
                if (!dataObj.hasOwnProperty(filter.DataPropName) || dataObj[filter.DataPropName] == null) {
                    this.ShowHideRowByRowObj(dataRow, false);
                    continue;
                }
                //Show or Hide
                if (!this.IsFilterMatch(dataObj[filter.DataPropName].toString().toLowerCase(), filter.KeyList)) {
                    this.ShowHideRowByRowObj(dataRow, false);
                    continue;
                }
            }
        }
    var currentCount = this.CountRow(this.SnColVisible);
    this.SetCurrentCounter(currentCount);
}

//Joy table filter match operation
JoyTable.prototype.IsFilterMatch = function (value, lsKeys, regxStr) {
    if (checkIsEmpty(regxStr))
        regxStr = this.CreateJoyTableFilterRegex(lsKeys);
    
    var isMatch = value.match(new RegExp(regxStr, 'gi'));//gi -> ignore case, match multiple keyword with no order
    return !!isMatch;//return true or false 
}

JoyTable.prototype.CreateJoyTableFilterRegex = function (lsKeys) {
    var regx = [];
    for (var j = 0; j < lsKeys.length; j++) {
        if (lsKeys[j].trim()) { // ignore if keyword is empty
            var str = "(?=.*" + lsKeys[j].trim() + ")";
            regx.push(str);
        }
    }
    var regxStr;
    if (this.FilterMatchMode.toLowerCase() == "or")
        regxStr = regx.join('|');
    else
        regxStr = regx.join('');
    return regxStr;
}

//Create Joy Table Filter Condition item
JoyTable.prototype.CreateJoyTableFilterItem = function (dataName, keySentence) {
    var filterObj =
    {
        DataPropName: dataName,
        KeyList: this.ConvertKeySentenceToArray(keySentence)
    };
    return filterObj;
}

//Conver sentence to array which for filter
JoyTable.prototype.ConvertKeySentenceToArray = function (keySentence) {
    if (checkIsEmpty(keySentence)) {
        return null;
    }
    var lsKey = keySentence.split(/\b/); // split keySentence by white space(\b) as multiple keyword
    if (checkIsEmpty(lsKey[0])) {
        return null;
    }
    return keySentence.split(/\b/);
    //return keySentence.split(/\b(\s)/);
}

// Edit mode
JoyTable.prototype.SwitchEditMode = function (enterEditMode) {
    this.RootObject.find("._active_edit").remove();
    if (enterEditMode) {
        var emptyData = tblPlayer.GetRowByIndex(0) == null;
        if (emptyData)
            return false;
        //this.TableObject.find("td:not(.cb_col) input,select").prop("disabled", false).trigger("chosen:updated");
        this.SetDisabledDomObj(this.TableObject, false);
        this.EditMode = true;
        this.ShowCheckbox(true);

    }
    else { // cancel edit
        this.EditMode = false;
        this.ResetChangedData();
        if (this.GetCheckedRows().length > 0) {
            this.CheckAllRow(false);
        }

        //this.TableObject.find("td:not(.cb_col) input,select").prop("disabled", true).trigger("chosen:updated");
        this.SetDisabledDomObj(this.TableObject, true);
    }
}

JoyTable.prototype.ModifyData = function (dataProp, newVal, dataUniId, data) {
    if (dataProp == "check_row" ||  // system column
        checkIsEmpty(dataProp)) // no dataProp, can't monitor
        return;

    var hasDataUniId = !checkIsEmpty(dataUniId);
    var hasData = !checkIsEmpty(data);
    if (!hasDataUniId && !hasData) {
        console.warn("Modify empty target");
        return;
    }
    else if (hasDataUniId && !hasData) {
        data = this.GetDataByUniqueId(dataUniId);
    }
    else if (!hasDataUniId && hasData) {
        dataUniId = this.GetUniqueIdByData(data);
    }

    var foundAlreadyBackup = false;
    var changeValueBack = false;
    for (var i = 0; i < this.RecoverSource.length; i++) {
        var tmpData = this.RecoverSource[i];
        var tmpUniId = !checkIsEmpty(tmpData["_data_unique_id"]) ? tmpData["_data_unique_id"] : this.GetUniqueIdByData(tmpData);

        if (tmpUniId == dataUniId) {
            foundAlreadyBackup = true;
            if (tmpData[dataProp] == newVal) {
                // detect user set value back to original value....
                // need reset ths cell as no-changed in ui and internal data
                changeValueBack = true;                
                var chgPropIdx = data["_changed_prop"].indexOf(dataProp); // remove from _changed_prop
                data["_changed_prop"].splice(chgPropIdx, 1);
                if (data["_changed_prop"].length == 0) {  // no any value changed in this row, reset by current recover data directly
                    this.UpdateRows([tmpData]);
                    return;
                }
            }
            break;
        }
    }
    
    // clone original data if not backup yet
    if (!foundAlreadyBackup) {
        var cloneData = Object.clone(data);
        tblPlayer.RecoverSource.push(cloneData);
    }

    // write input value to current DataSource and update changed prop
    data[dataProp] = newVal;
    if (data["_changed_prop"] == null)
        data["_changed_prop"] = [];
    if (!changeValueBack && data["_changed_prop"].indexOf(dataProp) < 0) // push to _changed_prop if input value different to original
        data["_changed_prop"].push(dataProp);

    // update ui
    var lsWroteRows = this.UpdateRows([data]);
    if (lsWroteRows.length > 0 && data["_changed_prop"].length > 0) {
        tblPlayer.CheckRow(lsWroteRows[0].row, true);
    }
}

// inData: array data. given saving result
// idFailedData: boolean default false. indicate the saving result are write ok or failed
// keepOkDataAsDirty: boolean defalut false. remove changed status if write ok
// return: an object contains ok and failed data
JoyTable.prototype.AfterSaved = function (inData, isFailedData, keepOkDataAsDirty) {
    if (checkIsEmpty(isFailedData))
        isFailedData = false;
    if (checkIsEmpty(keepOkDataAsDirty))
        isFailedData = false;

    var tbwData = this.GetTobeWriteData();
    var wOkData = []; // write ok
    var wNgData = []; // write not ok

    // find tbwData - inData
    var revData = [];
    for (var i = 0; i < tbwData.length; i++) {
        var found = false;
        for (var j = 0; j < inData.length; j++) {
            var writingId = this.GetUniqueIdByData(tbwData[i]);
            var inId = this.GetUniqueIdByData(inData[i]);

            if (writingId == inId) {
                found = true;
                break;
            }
        }

        if (!found) {
            if (isFailedData)
                wOkData.push(tbwData[i]);
            else
                wNgData.push(tbwData[i]);
        }
        else {
            if (isFailedData)
                wNgData.push(tbwData[i]);
            else
                wOkData.push(tbwData[i]);
        }
    }

    var rtn = {
        "success": wOkData, "failed": wNgData
    };

    if (!keepOkDataAsDirty) {
        var fakeNew = [];
        for (var i = 0; i < wOkData.length; i++) {
            var newData = wOkData[i]; //Object.clone(wOkData[i]);
            delete newData["_changed_prop"];
            fakeNew.push(newData);
        }
        this.UpdateRows(fakeNew);
    }
    return rtn;
}

JoyTable.prototype.SetDisabledDomObj = function (cellContainer, disabled) {
    if (checkIsEmpty(cellContainer))
        return;
    if (disabled) { // set disabled=true
        cellContainer.find("td:not(.cb_col) input,select").prop("disabled", true).trigger("chosen:updated");
    }
    else { // set disabled=false
        cellContainer.find("td:not(.cb_col) input,select").prop("disabled", false).trigger("chosen:updated");
    }
}

JoyTable.prototype.ResetChangedData = function (resetNonCheckedOnly) {
    var tobeWrite = this.GetTobeWriteData();
    if (!checkIsEmpty(resetNonCheckedOnly) && resetNonCheckedOnly) { // only reset non-checked changed data
        var tobeReset = [];
        for (var i = this.RecoverSource.length - 1; i >= 0; i--) {
            var foundInWrite = false;
            for (var j = 0; j < tobeWrite.length; j++) {
                if (this.RecoverSource[i]["_data_unique_id"]== tobeWrite[j]["_data_unique_id"]) {
                    foundInWrite = true;
                    break;
                }
            }
            if (!foundInWrite) {
                tobeReset.push(this.RecoverSource[i]);
                this.RecoverSource.splice(i, 1);
            }
        }
        if (tobeReset.length > 0) // reset
            this.UpdateRows(tobeReset);
    }
    else { // reset all changed data
        if (this.RecoverSource.length > 0) {
            this.UpdateRows(this.RecoverSource);
            this.RecoverSource = [];
        }
    }
}

// find changed and checked data
JoyTable.prototype.GetTobeWriteData = function () {
    var tobeWrite = this.GetCheckedData();
    // find and remove unchanged data from checked data
    for (var i = tobeWrite.length - 1; i >= 0 ; i--) {
        var foundInChange = false;
        for (var j = 0; j < this.RecoverSource.length; j++) {
            if (tobeWrite[i]["_data_unique_id"] == this.RecoverSource[j]["_data_unique_id"]) {
                foundInChange = true;
                break;
            }
        }
        if (!foundInChange)
            tobeWrite.splice(i, 1);
    }
    return tobeWrite;
}

