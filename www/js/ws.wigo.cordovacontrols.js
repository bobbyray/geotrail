/* 
Copyright (c) 2015 - 2017 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/

/*
Module for a few html controls that work in the Apache Cordova framework 
whose behavior is the same for android or ios platforms. 
ios native implementation of some of the standard html controls like
select (drop list) is quite different that the standard html web behavior.
Therefore this module only uses very basic html controls such as div and button
to create a composite control.

Class Names for CSS
    wigo_ws_DropDownIcon
    wigo_ws_DropDownControl
    wigo_ws_DropDownList
    wigo_ws_DropDownListItem
    wigo_ws_DropDownLabel
    wigo_ws_DropDownValue
    wigo_ws_DropDownItem

    wigo_ws_OnOffControl
    wigo_ws_OnCtrl
    wigo_ws_OffCtrl
    wigo_ws_On
    wigo_ws_Off
    wigo_ws_unknown

    wigo_ws_StatusMsg   
    wigo_ws_StatusClose
    wigo_ws_StatusError
    wigo_ws_StatusNoError
    wigo_ws_status_item

    wigo_ws_NoShow
    wigo_ws_Show
    wigo_ws_NoDim
    wigo_ws_Dim

    wigo_ws_Title
    wigo_ws_TitleBarHelp

    wigo_ws_BackIcon  // Image for back arrow icon.

    wigo_ws_list_header
    wigo_ws_list
    wigo_ws_celln  // n = 0, 1, 2, ... for cell within a div.
*/
'use strict';
// Function that returns an object of controls.
// Remarks:
// Call Wigo_Ws_CordovaControls(), it is NOT an object to be constructed by new.
// The members in the returned object are functions (object definitions) for controls 
// that need to be constructed by new. 
// There is one exception: the NewYesNoControl member of the returned object returns
// an OnOffControl object that has already been constructed and is tailored for 
// Yes or No instead of On or Off. 
function Wigo_Ws_CordovaControls() {
    // Literal object to generate a unique id name.
    // Props:
    //  next: readonly, string. Next unique id as idnnn, where nnn is integer.
    //  iStart: integer. Leave 0 or set it initially >= 0.
    var UniqueIdName = {
        get next() { return "id" + this.iStart++;},
        iStart:0
    }

    // Object to use as prototype for Cordova Controls.
    function ControlBase() {
        // Creates a new HTML element.
        // Args:
        //  tag: string. Tag name of the html element.
        //  idName: string, optional. The value of id attribute of the html element. Defauls to next id, 'idnnn'.
        //  className: string, optional. Class name to assign to class member of element. Defaults to no assigment.
        this.create = function (tag, idName, className) {
            if (typeof tag !== 'string')
                throw new Error("Html element tag must be first argument of ControlBase.create(...).");
            if (typeof idName !== 'string') 
                idName = UniqueIdName.next;
            var el = document.createElement(tag);
            if (typeof className === 'string')
                el.className = className;
            el.id = idName;
            return el;
        };
        

        // Shows or hides by setting class attribute for an html element.
        // Args:
        //  ctrl: instance of Element. The html element to show or hide.
        //  bShow: boolean: true to show the element, false to hide.
        // Remarks:
        //  The CSS defines how show or hide is done. 
        //  Suggest display: block to show, or display: none to hide.
        this.show = function (ctrl, bShow) {
            if (bShow) {
                ctrl.classList.add('wigo_ws_Show');
                ctrl.classList.remove('wigo_ws_NoShow');
            } else {
                ctrl.classList.remove('wigo_ws_Show');
                ctrl.classList.add('wigo_ws_NoShow');
            }
        }

        // Set error highligting for a ctrl.
        // Args:
        //  ctrl: Element obj to highlight.
        //  bError: boolean. true to highligt for an error.
        this.hiliteError = function (ctrl, bError) {
            if (typeof bError === 'undefined')
                bError = true;
            if (bError) {
                ctrl.classList.remove('wigo_ws_StatusNoError');
                ctrl.classList.add('wigo_ws_StatusError');
            } else {
                ctrl.classList.remove('wigo_ws_StatusError');
                ctrl.classList.add('wigo_ws_StatusNoError');
            }
        }

        // Dims or unDims by setting class attribute for an html element.
        // Args:
        //  ctrl: instance of Element. The html element to dim or not.
        //  bDim: boolean: true to show the element, false to hide.
        // Remarks:
        //  The CSS defines how dim or not is done. 
        //  Suggest setting different background colors for dim and not dim.
        this.dim = function (ctrl, bDim) {
            if (bDim) {
                ctrl.classList.add('wigo_ws_Dim');
                ctrl.classList.remove('wigo_ws_NoDim');
            } else {
                ctrl.classList.remove('wigo_ws_Dim');
                ctrl.classList.add('wigo_ws_NoDim');
            }
        };
    }
    var controlBase = new ControlBase(); // Use this single obj as prototype for various html elements.


    // Object for image for the drop node icon.
    // Constructor args:
    //  parentEl: Element (usually HTMLElement). Parent container for DropDown img element for the icon.
    //  idName: string, optional. Name of id img icon. Defaults to next id, 'idnnn'.
    //  imgPath: string, optional. Path to image file for the icon. Defaults to "img/ws.wigo.dropdownicon.png".
    function DropDownIcon(parentEl, idName, imgPath) {
        if (! parentEl instanceof Element)
            throw new Error('HTMLElement for parent of DropDownIcon must be given in constructor.');
        if (!imgPath)
            imgPath = "img/ws.wigo.dropdownicon.png";
        this.img = this.create("img", idName, 'wigo_ws_DropDownIcon');
        this.img.setAttribute("src", imgPath);
        parentEl.appendChild(this.img);
    }
    DropDownIcon.prototype = controlBase;
    DropDownIcon.prototype.constructor = DropDownIcon;

    // Object for DropDownList list control.
    // Constructor args:
    //  parentEl: Element (usually HTMLElement). Parent container for this control.
    //  idName: string, optional. Name of id for this control. Defaults to next id, 'idnnn'.
    //  labelStr: string, optional. Name shown for a label in div for the label. If not a string, 
    //            no div for the label is created. null for no label created.
    //  valueStr: string, optional. data-value attribute for value div and indicates that value div
    //            is to be created. Text for value div is empty string. 
    //            If null or not a string, the value div is not created. Defaults to no value div. 
    //  iconPath: string, optional. Path to image file for the icon. Defaults to "img/ws.wigo.dropdownicon.png".
    // Remarks:
    // value div, optionally created, indicates which droplist element is selected. 
    // valueStr arg causes value div to be creeated but the droplist is initially empty. 
    // When a droplist item is append and marked selected, the value div is assigned from the item.  
    // Likewise clicking on a droplist item, assigns the item to the value div.
    // If valuestr is an empty string or any string, the value div is created. Use null to not create the value div.
    function DropDownControl(parentEl, idName, labelStr, valueStr, iconPath) {
        var that = this; 

        // Html div created as container for this dropdown control.
        // Note: Likely not accessed by owner of this object.        
        this.ctrl = this.create("div", idName, 'wigo_ws_DropDownControl');

        // Set to Event handler function called when user clicks on an item in the drop down list.
        // Handler Signature:
        //  dataValue: data-value attribute for item in droplist that was clicked.
        //  Returns: not used
        // Remarks: Set to null to remove a handler function that has been previously assigned.
        this.onListElClicked = function (dataValue) { };
        
        // Set to event handlerr fuction called when user closes droplist without selecting an element.
        // Handler Signature:
        //  No arg.
        //  Returns: not used.
        this.onNoSelectionClicked = function() { };  

        // Set to event handler function called to measure the max height available for the droplist.
        // Maybe null, in which case the height for the droplist is not changed.
        // Handler Signature:
        //  No Arg.
        //  Returns: number. Number of pixels for max height. If <= 0 height is not changed.
        this.onMeasureMaxHeight = null; 

        // Fills dropdown list with values.
        // Arg:
        //  values: 2D array of [string, string, boolean]. droplist element shown for each list item when it is dropped.
        //          [0, string]: data-value attribute for the item.
        //          [1, string]: Text for the droplist item.
        //          [2, boolean]: Optional. Indicates item is selected. Defaults to false. 
        // Remarks:
        //  Empties the dropdown list before filling it.
        //  The data-value attribute is the argument passed in this.onListElClicked(dataValue) callback.
        //  Hides the dropdown list after filling it.
        //  Use this.drop(bDrop) to show or hide the dropdown list.
        this.fill = function (values) {
            if (!values)
                throw new Error('DropDownControl.FillList(values) requires values to be array of [string, integer] elements.');
            /* 
            var child;
            // Remove all children if any.
            while (list.children.length > 0) {
                child = list.children[0];
                list.removeChild(child)
            }
            */
            // Empty the droplist before filling it.
            this.empty();
            var el;
            var bSelected = false;
            for (var i = 0; i < values.length; i++) {
                el = values[i];
                bSelected = typeof el[2] === 'boolean' ? el[2] : false;
                this.appendItem(el[0], el[1], el[2]); // Append data-value, text, indicate if selected.
            }

            this.show(list, false);
        };

        // Empties the droplist.
        // Arg:
        //  iKeep: integer, optional. Keeps items before index given by iKeep in the list.
        //          Defaults to 0, which removes all items.
        this.empty = function(iKeep) {
            if (!iKeep) 
                var iKeep = 0;
            // Remove all children if any.
            var child;
            while (list.children.length > iKeep) {
                child = list.children[iKeep];
                list.removeChild(child)
            }

        };

        // Appends item to the droplist.
        // Args:
        //  sDataValue: string for data-value attribute.
        //  sText: string for text shown for item in the droplist.
        //  bSelected: boolean, optional. If given, sets the value div to indicate
        //             the item is selected. Only one item can be selected.
        //             For multiple selects, the last one is effective.
        this.appendItem = function(sDataValue, sText, bSelected) {
            var child = this.create('div', null, 'wigo_ws_DropDownItem');
            child.className = 'wigo_ws_DropDownListItem';
            SetValueAndText(child, sDataValue, sText);
            child.addEventListener('click', DropDownListElClicked, false);
            list.appendChild(child);
            
            // Set value div to the item if item is seleeted.
            if (typeof bSelected === 'boolean') {
                if (bSelected) {
                    SetValueAndText(value, sDataValue, sText)
                }
            }
        };


        // Inserts at integer index in the droplist if item is anot already present.
        // Args:
        //  ixAt: nunber. integer in droplist of items at which to insert the item.
        //        if ixAt < 0, inserts at index 0. If ixAt >= length of droplist, appends item.
        //  sDataValue: string for data-value attribute.
        //  sText: string for text shown for item in the droplist.
        //  bSelected: boolean, optional. If given, sets the value div to indicate
        //             the item is selected. Only one item can be selected.
        //             For multiple selects, the last one is effective.
        this.insertItemAtIx = function(ixAt, sDataValue, sText, bSelected) { 
            if (ixAt < 0)
                ixAt = 0;
            if (ixAt < list.children.length) {
                var beforeListEl = list.children[ixAt];
                var sCurDataValue = beforeListEl.getAttribute('data-value');
                if (sCurDataValue !== sDataValue) {
                    // Insert new item before list element.
                    var child = this.create('div', null, 'wigo_ws_DropDownItem');
                    child.className = 'wigo_ws_DropDownListItem';
                    SetValueAndText(child, sDataValue, sText);
                    child.addEventListener('click', DropDownListElClicked, false);
                    list.insertBefore(child, beforeListEl);
                }
                // Set value div to the item if item is seleeted.
                if (typeof bSelected === 'boolean') {
                    if (bSelected) {
                        SetValueAndText(value, sDataValue, sText)
                    }
                }
            } else {
                this.appendItem(sDataValue, sText, bSelected)
            }
        };

        // Removes droplist item given its data-value attribute.
        // If droplist item to remove is not found, does nothing.
        // Arg:
        //  sDataValue: string for data-value attribute of droplist element to remove.
        this.removeItem = function(sDataValue) { 
            var el = FindListEl(sDataValue);
            if (el) {
                list.removeChild(el);
            }
        };

        // Returns integer index in droplist for the selected value.
        // If value div does not exist, returns -1.
        // Remarks: 
        // The index in the droplist is found by matching the data-value attribute
        // of a list element to the data-value attribute of the value div,
        // which contains the selected value.
        this.getSelectedIndex = function() {
            var iFound = -1;
            if (!value)        
                return -1;     
            var valueToMatch = GetValue(value); 
            var listEl, listValue;
            for (var i=0; i <list.children.length; i++) {
                listEl = list.children[i];
                listValue = GetValue(listEl);
                if (listValue == valueToMatch) {
                    iFound = i;
                    break;
                }
            }
            return iFound;
        }

        // Sets the value div to droplist element for given index.
        // Arg:
        //  index: integer. Index for element in the droplist.
        this.setSelectedIndex = function(index) {
            if (index >= 0 && index < list.children.length) {
                var listEl = list.children[index];
                SetValueAndText(value, GetValue(listEl), GetText(listEl));
            }
        };

        // Sets value div to droplist item for a given data-value attrib.
        // Arg:
        //  dataValue: string. data-value attribute for matched droplist item.
        // Remarks:
        // If dataValue is not a match, does nothing. 
        this.setSelected = function(dataValue) {
             var listEl = FindListEl(dataValue);
             if (listEl) {
                SetValueAndText(value, GetValue(listEl), GetText(listEl));
             }
        };

        // Clears text in value control.
        // Remarks: Does not change data-value attribute of value control.  
        this.clearValueDisplay = function() {
            if (value) {
                SetText(value, "");
            }
        };


        // Returns string for selected data-value. 
        // Returns empty string if there is no value div.
        // Remarks:
        // The return value is the data-value attribute of the value div,
        // not the text (or innerHTML) of the div.
        this.getSelectedValue = function() {
            var sValue = "";
            if (value) {
                sValue = GetValue(value); 
            }
            return sValue;
        };

        // Returns string for text from the value control, which represents
        // the selected droplist element.
        // Returns empty string if there is no value control.
        // Remarks:
        // The returned string is value.innerHTML, rather than innerText.
        this.getSelectedText = function() {
            var sText = "";
            if (value) {
                sText = value.innerHTML;
            }
            return sText;
        };

        // Returns string for plain text from the value control, which represents
        // the selected droplist element.
        // Returns empty string if there is no value control.
        // Remarks:
        // The returned string is value.innerText, rather than innerHTML.
        // value.innerHTML would have & char as hmtl entity sequence &amp;
        // Instead value.innerText has & char, not the html entity sqequence.
        this.getSelectedPlainText = function() {
            var sText = "";
            if (value) {
                sText = value.innerText;
            }
            return sText;
        };

        // Selects item from droplist by text for the item.
        // If there is no match, does not change the selection.
        // Returns: string. data-value attribute of if selection is found.
        //          Empty string if selection is not found.
        // Arg:
        //  sText: string. Text of item in droplist to match.
        // Remarks: value control is set to the matched item. 
        // If there is no match, value control is not changed.
        this.selectByText = function(sText) {
            var dataValue = "";
            var el = FindListElByText(sText);
            if (el && value) {
                dataValue = GetValue(el);
                SetValueAndText(value, dataValue, sText);
            }
            return dataValue;
        };
        
        // Returns ref to html Element for given list item.
        // Arg: 
        //  dataValue: string. data-value attribute of the list item.
        //             Return null if data-value is not found.
        this.getListEl = function(dataValue) {
            var el = FindListEl(dataValue);
            return el;
        };

        // Sets text for item in droplist for a given data-value attribute.
        // Arg:
        //  dataValue: string to match against data-value attribute of elements in droplist.
        this.setListElText = function(dataValue, sText) {
            var el = FindListEl(dataValue);
            if (el) {
                SetText(el, sText);
            }
        }

        // Indicates droplist el is hidden or not.
        // Args:
        //  dataValue: string for data-value attribute of droplist element.
        //  bHide: boolean. true indicates list element is hidden.
        // Remarks.
        // Adds or removes wigo_ws_DropDownListItemHidden class for the
        // droplist element.
        this.hideListEl = function(dataValue, bHide) {
            var el = FindListEl(dataValue);
            if (el) {
                this.show(el, !bHide)
            }
        };

        // Sets text for the label.
        // Arg:
        //  sLabel: string. text shown for the label.
        this.setLabel = function(sLabel) {  
            if (label) {
                label.innerText = sLabel;
            }
        };

        // Returns length of dropdown list.
        this.getListLength = function() {
            var length = list.children.length;
            return length;
        };

        // Returns true if the dropdown list is scrolling.
        // Remarks: 
        // A touchmove event is considered to initiate scrolling.
        this.isDropDownListScrolling = function() {
            return bDropDownListDropped; 
        };

        // Shows the dropdown list or hide it.
        // Arg:
        //  bDrop: boolean. true to show the dropdown list, false to hide it.
        this.drop = function (bDrop) {
            if (bDrop && this.onMeasureMaxHeight) {
                var height = this.onMeasureMaxHeight(list);
                if (typeof height === 'number' && height > 0) {
                    list.style.maxHeight = height.toFixed(0) + "px";
                }
            }
            bDropDownListDropped = bDrop;
            this.show(list, bDrop);
        };
        
        // Indiates that the droplist is shown when user clicks on the value.
        this.bDropOnValueClicked = true; 

        var label = null;
        if (typeof labelStr === 'string') {
            label = this.create("div", null, 'wigo_ws_DropDownLabel'); 
            label.innerText = labelStr;
            this.ctrl.appendChild(label)
        }

        var dropDownIcon = new DropDownIcon(this.ctrl, null, iconPath);
        this.ctrl.appendChild(dropDownIcon.img);

        var value = null;
        if (typeof valueStr === 'string') {
            value = this.create("div", null, 'wigo_ws_DropDownValue');
            SetValueAndText(value, valueStr, "");
            value.addEventListener('click', ValueClicked, false);
            this.ctrl.appendChild(value);
        }

        var list = this.create('div', null, 'wigo_ws_DropDownList wigo_ws_NoShow');
        this.ctrl.appendChild(list);

        parentEl.appendChild(this.ctrl);

        // Event listeners for detect scrolling of dropdownlist.
        var bDropDownListScrolling = false;
        list.addEventListener('touchmove', function(event){
            bDropDownListScrolling = true;
        }, false);

        list.addEventListener('touchend', function(event){
            bDropDownListScrolling = false;
        }, false);        

        // Helper to set data-value attribute and text for an element.
        // Args:
        //  el: Html Element. ref to droplist element or value div.
        //  sValue: string. Assigned to data-value attribute.
        //  sText: string. Assigned to innerHTML.
        function SetValueAndText(el, sValue, sText) {
            if (el && el instanceof Element) {
                el.setAttribute('data-value', sValue);
                SetText(el, sText);
            }
        }

        // Text to assign for an Element.
        function SetText(el, sText) {
            el.innerHTML = sText;
        }

        // Helper to return data-value attribute for an Element.
        // Arg:
        //  el: Html Element. ref to droplist element or value div.
        function GetValue(el) {
            var sValue = el.getAttribute('data-value');
            return sValue;
        }

        // Helper to return text for HTML Element.
        // Arg:
        //  el: HTML Element. value div or droplist element.
        function GetText(el) {
            var sText = el.innerHTML;
            return sText;
        }

        // Helper to find droplist item.
        // Returns ref to element in droplist that matches dataValue.
        // Return null if dataValue is not found.
        // Arg:
        //  dataValue: string for data-value attribute of element in the droplist.
        function FindListEl(dataValue) {
            var elFound = null;
            var sElValue;
            for (var i=0; list.children && i <  list.children.length; i++) {
                sElValue = GetValue(list.children[i]);
                if (sElValue === dataValue) {
                    elFound = list.children[i];
                    break;
                }
            }
            return elFound;
        }

        // Helper to find droplist item given text for an item.
        // Returns ref to Element in droplist that matches text.
        // Return null if text is not found.
        //  text: string for text of element in the droplist.
        function FindListElByText(text) {
            var elFound = null;
            var sElText;
            for (var i=0; list.children && i <  list.children.length; i++) {
                sElText = GetText(list.children[i]);
                if (sElText === text) {
                    elFound = list.children[i];
                    break;
                }
            }
            return elFound;
        }

        // Event handler for a click on dropDownIcon.
        var bDropDownListDropped = false;
        function DropDownIconClicked(event) {
            // Toggle showing the dropdown list.
            that.drop(!bDropDownListDropped)
            //Note: Do NOT call event.stopPropagation(); because body click handler
            //      needs to receive click event to ensure any other dropdown list 
            //      that may be open is closed.
        }

        // Event handler for a click on element in droplist.
        function DropDownListElClicked(event) {
            // Call onListElClicked property with index of list element.
            if (that.onListElClicked) {
                SetValueAndText(value, GetValue(this), GetText(this));
                that.onListElClicked(GetValue(this));
            }
            that.drop(false);
            event.stopPropagation();
        }

        // Event handler for a click on the Value div.
        function ValueClicked(event) {
            if (that.bDropOnValueClicked) {
                that.drop(true);
            }
        }

        dropDownIcon.img.addEventListener('click', DropDownIconClicked, false);

        // Note: Element.onfocusout and Element.onblur events do not occur for Chrome.

        // Event handler for a click that bubbles up to body.
        // Closes the dropdown list that may be shown by any other droplist 
        // except for the dropdown icon that was clicked.
        function OnOutsideDropDownClicked(event) {
            var bListWasDropped = bDropDownListDropped;
            var bMyDropDownIcon = dropDownIcon.img === event.srcElement ||
                                  value === event.srcElement;
            if (!bMyDropDownIcon) { 
                that.drop(false); // Ensure dropdown list of other dropdown is closed.
                // Do call back if dropdown list was closed.
                if (bListWasDropped && 'function' === typeof that.onNoSelectionClicked) {
                    that.onNoSelectionClicked();
                }
            }
        }
        document.body.addEventListener('click', OnOutsideDropDownClicked, false);
    }
    DropDownControl.prototype = controlBase;
    DropDownControl.prototype.constructor = DropDownControl;


    // Object for OnOffControl control that indicates state of on (1), Off (0), unknown (-1).
    // Constructor args:
    //  parentEl: Element (usually HTMLElement). Parent container for this control.
    //  idName: string, optional. Name of id for this control. Defaults to next id, 'idnnn'.
    //  labelStr: string, optional. Name shown for a label. If not a string, 
    //            no span for the label is created. null for no label created.
    //  nState: number. 0 for off, 1 for on, -1 for unknown.
    function OnOffControl(parentEl, idName, labelStr, nState) {
        var that = this; 
        // Html div created as container for this OnOff control.
        // NOte: Likely not accessed by owner of this object.        
        this.ctrl = this.create("div", idName, 'wigo_ws_OnOffControl');

        // Set to Event handler function called when user clicks On or Off.
        // Handler Signature:
        //  nSate: number. 0 for Off, 1 for On clicked. 
        //  Returns: not used
        // Remarks: 
        // Click bubbles up to containing parent regardless if this.onClick(nState) is called.
        // Set to null to remove a handler function that has been previously assigned.
        this.onClicked = function(nState) { };


        // Set to Event handler function called when user changes On or Off.
        // Handler Signature:
        //  nSate: number. 0 for Off, 1 for On clicked. 
        //  Returns: not used
        // Remarks: 
        // If the Off or Off ctrl is clicked and the state is not changed, this.onChange(nState)
        // is NOT called.
        // Click bubbles up to containing parent regardless if this.onChange(nState) is called.
        // Set to null to remove a handler function that has been previously assigned.
        this.onChanged = function(nState) { };

        // Returns number for state for OnOff control:
        //  1 for on.
        //  0 for off.
        // -1 for unknown.
        this.getState = function() {
            var sState = this.ctrl.getAttribute('data-value');
            var nState = parseInt(sState);
            return nState;
        };

        // Sets state value and display.
        // Arg:
        //  nState: integer for ctrl state:
        //  1 for on.
        //  0 for off.
        // -1 for unknown.
        this.setState = function(nState) {
            SetState(nState);
        }

        // Set the text for the Off ctrl.
        // Arg: 
        //  text: string. Text shown for the Off ctrl.
        this.setOffText = function(text) {
            offText = text;
            SetOffText();
        };

        // Sets text for the On ctrl.
        // Arg:
        //  text: string. Text shown for the On ctrl.
        this.setOnText = function(text) {
            onText = text;
            SetOnText();
        }

        var offText = "Off";
        var onText = "On";


        var label = null;
        if (typeof labelStr === 'string') {
            label = this.create("span", null, 'wigo_ws_OnOffLabel');  // null => auto generated id.
            label.innerText = labelStr;
            this.ctrl.appendChild(label)
        }
        var onCtrl = this.create("span", null, "wigo_ws_OnCtrl wigo_ws_Unknown");  
        SetOnText();
        this.ctrl.appendChild(onCtrl);
        onCtrl.addEventListener('click', function(event){
            var nCurState = that.getState();
            SetState(1);
            if (typeof that.onClicked === 'function') {
                that.onClicked(1);
            }
            if (nCurState !== 1 && typeof that.onChanged === 'function') {
                that.onChanged(1);
            }
        }, 
        false);
        
        var offCtrl = this.create("span", null, "wigo_ws_OffCtrl wigo_ws_Unknown");
        SetOffText();
        this.ctrl.appendChild(offCtrl);
        offCtrl.addEventListener('click', function(event){
            var nCurState = that.getState();
            SetState(0);
            if (typeof that.onClicked === 'function') {
                that.onClicked(0);
            }
            if (nCurState !== 0 && typeof that.onChanged === 'function') {
                that.onChanged(0);
            }
        }, 
        false);

        parentEl.appendChild(this.ctrl);

        // Set class of On and Off ctrls to indicate on, off, or unknown.
        // Arg:
        //  nState: number. 
        //          1, On state .
        //          2, off state.
        //         -1, unknown state.
        function SetState(nState) {
            that.ctrl.setAttribute('data-value', nState.toString());
            if (nState === 0) {
                // Hilite Off button, dim On button.
                offCtrl.classList.remove('wigo_ws_Unknown'); 
                offCtrl.classList.add("wigo_ws_Off");
                onCtrl.classList.remove("wigo_ws_On");
                onCtrl.classList.add("wigo_ws_Unknown");
            } else if (nState === 1) {
                // Hilite On button, dim Off button.  
                onCtrl.classList.remove("wigo_ws_Unknown");
                onCtrl.classList.add("wigo_ws_On");
                offCtrl.classList.remove("wigo_ws_Off");
                offCtrl.classList.add('wigo_ws_Unknown');
            } else {
                // dim On and Off button.
                onCtrl.classList.remove("wigo_ws_On");
                onCtrl.classList.add("wigo_ws_Unknown");
                offCtrl.classList.remove("wigo_ws_Off");
                offCtrl.classList.add('wigo_ws_Unknown');
            }
        }

        // Sets text for the onCtrl.
        function SetOnText() {
            onCtrl.innerText = onText;
        }

        // Sets text for the offCtrl.
        function SetOffText() {
            offCtrl.innerText = offText;
        }

        // Set constructed state for OnOff control.
        SetState(nState);
    }
    OnOffControl.prototype = controlBase;
    OnOffControl.prototype.constructor = OnOffControl;

    // Returns new OnOffControl object.
    // Text for On is set to Yes, corresponding to nState of 1.
    // Text for Off is set to No, corresonding to nState of 0.
    // Args: Same as for OnOffControl constructor.
    // Returns: OnOffControl object.
    // Remarks: This is a function and not an object.
    // Do NOT use new YesNoControl(...), just call YesNoControl(...).
    function NewYesNoControl(parentEl, idName, labelStr, nState) {
        var yesNoCtrl = new OnOffControl(parentEl, idName, labelStr, nState);
        yesNoCtrl.setOnText('Yes');
        yesNoCtrl.setOffText('No');
        return yesNoCtrl;
    }


    // Object for array of tabs.
    // Constructor Args:
    //  tabs: [html Element obj, ...]. Each array element is a tab, typicially a Div.
    function TabControl(tabs) {
        var that = this;
        // Selects tab i.
        // Arg:
        //  iTab: integer, which is index of the tabs array.
        // Remarks:
        //  If i is out of range for tabs, does nothing.
        //  Selected tab has wigo_ws_NoDim set as part of class name.
        //  Other tabs have wigo_ws.dim set as part of class name.
        //  if i is out of range for tabs array, nothing is done.
        this.select = function (iTab) {
            var bSelect;
            for (var i = 0; i < tabs.length; i++) {
                bSelect = i === iTab;
                this.dim(tabs[i], !bSelect);
            }
        };

        // Set to event handler function that is called when a tab is clicked.
        // Handler Signature:
        //  i, integer. Index in tabs for tab that that is clicked.
        //  tab: ref to tab html element that has been clicked.
        // Remarks: Set to null remove event handler that has previously been assigned.
        this.onTabClicked = function (i, tab) { };

        function OnTabClicked(event) {
            var iTab = -1;
            var tabClicked = null;
            for (var i = 0; i < tabs.length; i++) {
                if (this === tabs[i]) {
                    iTab = i;
                    tabClicked = this;
                    break;
                }
            }
            if (that.onTabClicked) {
                that.onTabClicked(iTab, tabClicked);
            }
        }

        // Attach click event handler for each tab.
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', OnTabClicked, false);
            this.dim(tabs[i], true); // dim each tab initially.
        }
    }
    TabControl.prototype = controlBase;
    TabControl.constructor = TabControl;

    // Object for showing a status message in a div.
    // Constructor args:
    //  parentEl: HTML Element, optional. Defaults to body if not given.
    //  A div is created for the status message with class name wigo_ws_StatusMsg.
    //  The div is inserted as first child element of parentEl.
    // Remarks: 
    // The status div overlays at the top of the page and scrolls within its specified 
    // height. 
    function StatusDiv(parentEl) {
        var that = this;
        // Clears and hides the status div.
        this.clear = function () {
            this.show(statusDiv, false);
            // Remove existing status items.
            while (statusDiv.children.length > 1) {
                statusDiv.removeChild(statusDiv.children[1]);
            }
        };

        // Sets status div to text (maybe HTML) given.
        // Args:
        //  text: string. Text or html for the status div.
        //  bError: boolean. true indicates error highlighting
        this.set = function (text, bError) {
            this.clear();
            this.add(text, bError);
        };

        // Adds text (maybe HTML) to status div.
        // Args:
        //  text: string. text to add.
        //  bError: boolean. true indicated error highlighting.
        this.add = function (text, bError) {
            var item = this.create('span', null, 'wigo_ws_status_item');
            item.innerHTML = text;
            statusDiv.appendChild(item);
            item.scrollIntoView(false);  // false => align to bottom of parent.
            this.hiliteError(item, bError);
            this.show(statusDiv, true);
        };

        // Adds text (maybe HTML) to status div.
        // Args:
        //  text: string. text to add.
        //  bError: boolean. true indicated error highlighting.
        // Note: appends div element to status, whereas this.add appends a span element.
        this.addDiv = function(text, bError) {  
            var item = this.create('div', null, 'wigo_ws_status_item');
            item.innerHTML = text;
            statusDiv.appendChild(item);
            item.scrollIntoView(false);  // false => align to bottom of parent.
            this.hiliteError(item, bError);
            this.show(statusDiv, true);
        };

        // Sets content of status div to a line.
        // Args:
        //  text: string. Line of text that replaces div content.
        //  bError: boolean. true indicated error highlighting.
        this.setLine = function (text, bError) {
            text += "<br/>";
            this.set(text, bError);
        }

        // Add a line to content of the status div.
        // Args:
        //  text: string. Line of text that replaces div content.
        //  bError: boolean. true indicated error highlighting.
        this.addLine = function (text, bError) {
            text += "<br/>";
            this.add(text, bError);
        }

        // Returns true if the status div is empty.
        this.isEmpty = function() {
            var bEmpty = statusDiv.children.length === 0;
            return bEmpty;
        };

        var statusDiv = this.create("div", null, "wigo_ws_StatusMsg wigo_ws_NoShow");  

        var statusCloseDiv = this.create("div", null, "wigo_ws_StatusClose");
        statusCloseDiv.innerText = "X";
        statusCloseDiv.addEventListener('click', OnStatusCloseClicked, false);
        statusDiv.appendChild(statusCloseDiv);
        
        // alert('Testing creating StatusDiv'); 
        // Attach statusDiv to its parent.
        if (parentEl instanceof Element) {
            if (parentEl.children.length > 0)
                parentEl.insertBefore(statusDiv, parentEl.children[0]);
            else 
                parentEl.appendChild(statusDiv);
        } else {
            if (document.body.children.length > 0)
                document.body.insertBefore(statusDiv, document.body.children[0]);
            else 
                document.body.appendChild(statusDiv);
        }


        function OnStatusCloseClicked(event) {
            that.clear();
        }
    }
    StatusDiv.prototype = controlBase;
    StatusDiv.constructor = StatusDiv;

    // Object to display a title bar.
    // Args:
    //  holderDiv: HTMLDivElemnt, rquired. Container for the title.
    //  backArrowPath: string, optional. Path to icon (image) for a back arrow.
    //      If not given, there is not back arrow icon.
    //      class for back arrow is wigo_ws_BackIcon.
    //  sHelp: string, optional. A Help symbol or phrase is shown on the title bar.
    //         Defaults to no help shown. class is wigo_ws_TitleBarHelp and the 
    //         element is a span with text given by sHelp. A click handler can be provided.
    function TitleBar(holderDiv, backArrowPath, sHelp) {
        var that = this;

        // Sets the title text.
        // Arg:
        //  sTitle: string. Text for the title.
        //  bShowBackArrow: boolean, optional. True to show the backarrow icon.
        //                  Defaults to true.
        this.setTitle = function(sTitle, bShowBackArrow) {
            titleEl.innerText = sTitle;
            if ('boolean' !== typeof bShowBackArrow) {
                bShowBackArrow = true;
            }
            
            if (imgBackArrow)
                TitleBar.prototype.show(imgBackArrow, bShowBackArrow)
        }

        // Scrolls this title bar into view.
        this.scrollIntoView = function() {
            holderDiv.scrollIntoView();
        };

        // Shows or hides the title bar.
        // Arg:
        //  bShow: boolean. true to show.
        // Note: Initially title bar is shown. You may not need to hide it.
        this.show = function(bShow) {
            TitleBar.prototype.show(holderDiv, bShow);
        };

        // Event handler called when back arrow icon in title bar is clicked.
        // Signature:
        //  Arg:
        //      event: Event object for the click.
        // Returns nothing.
        // Remarks: Set to null to disable event handler.
        this.onBackArrowClicked = function(event) {};
        
        // Event handler called when Help symbol in title bar is clicked.
        // Signature:
        //  Arg:
        //      event: Event object for the click.
        // Returns nothing.
        // Remarks: Set to null to disable event handler.
        this.onHelpClicked = function(event){};

        if (!(holderDiv instanceof HTMLDivElement))  {
            throw new Error("Container for TitleBar must be a div.");
        }

        var titleEl = this.create('span', null, 'wigo_ws_Title');
        holderDiv.appendChild(titleEl);

        var imgBackArrow = null;
        if ('string' === typeof backArrowPath) {
            imgBackArrow = this.create("img", null, 'wigo_ws_BackIcon'); 
            imgBackArrow.setAttribute("src", backArrowPath);
            holderDiv.appendChild(imgBackArrow);;
            imgBackArrow.addEventListener('click', function(event) {
                if ('function' === typeof that.onBackArrowClicked)
                    that.onBackArrowClicked(event);
            }, false);
            
        }

        var helpSpan = null;
        if ('string' === typeof sHelp && sHelp) {
            helpSpan = this.create("span", null, 'wigo_ws_TitleBarHelp');
            helpSpan.innerText = sHelp;
            holderDiv.appendChild(helpSpan);
            helpSpan.addEventListener('click', function() {
                if ('function' === typeof that.onHelpClicked)
                    that.onHelpClicked(event);
            }, false);

        }
    }
    TitleBar.prototype = controlBase;
    TitleBar.constructor = TitleBar;

    // Object displaying a title bar. This object is an alternative to TitleBar.
    // Args:
    //  holderDiv: HTMLDivElemnt, required. Container for the title bar.
    //  spanTitle: ref to HTMLElement, required.. Span for title text.
    //  spanHelp: ref to HTMLElement, optional. HTML element for invoking Help when clicked.
    // Remarks:
    // spanHelp is likely a HTML Span Element whose text is a ? with class="wigo_ws_TitleBarHelp"
    //      Could be any HTML Element for which a click event can be handled. May be null for no Help.
    // spanTitle is likely a span with class="wigo_ws_Title".
    function TitleBar2(holderDiv, spanTitle, spanHelp) {
        var that = this;
        
        // Sets the title text.
        // Arg:
        //  sTitle: string. Text for the title.
        this.setTitle = function(sTitle) {
            spanTitle.innerText = sTitle;
        }

        // Scrolls this title bar into view.
        this.scrollIntoView = function() {
            holderDiv.scrollIntoView();
        };

        // Shows or hides the title bar.
        // Arg:
        //  bShow: boolean. true to show.
        // Note: Initially title bar is shown. You may not need to hide it.
        this.show = function(bShow) {
            TitleBar.prototype.show(holderDiv, bShow);
        };

       
        // Event handler called when Help symbol in title bar is clicked.
        // Signature:
        //  Arg:
        //      event: Event object for the click.
        // Returns nothing.
        // Remarks: Set to null to disable event handler.
        this.onHelpClicked = function(event){};

        if (!(holderDiv instanceof HTMLDivElement))  {
            throw new Error("Container for TitleBar must be a div.");
        }

        if (!(spanTitle instanceof HTMLElement))  {
            throw new Error("Title must be a span or some kind of HTMLElement.");
        }

        if (spanHelp instanceof HTMLElement) {
            spanHelp.addEventListener('click', function(event) {
                if ('function' === typeof that.onHelpClicked)
                    that.onHelpClicked(event);
            }, false);
        }
    }
    TitleBar2.prototype = controlBase;
    TitleBar2.constructor = TitleBar2;

    // Object for displaying a scrollable list.
    // Note: Probably used as prototype for a derived scrollable list.
    function ScrollableListBase() {  
        // Creates a scrollable list.
        // Initializes with a headerDiv and an empty listDiv.
        // Args:
        //  holderDiv: div to contain the scrollable list control.
        //  nCells: number of child cells added to headerDiv. May be 0.
        // Returns: {headerDiv: HTMLElement, listDiv: HTMLElement}
        //  headerDiv: HTMLElement for the header div.
        //  listDiv: HTMLElement for the list div, which is empty initially. 
        this.createList = function(holderDiv, nCells) {
            if (!(holderDiv instanceof HTMLElement))
                throw new Error("Container for ScrollableListBase must be a div.");

            ctrl = {headerDiv: this.create("div", null, 'wigo_ws_list_header'), listDiv: this.create("div", null, 'wigo_ws_list')};
            if (typeof nCells === 'number') {
                var className;
                for (let i=0; i < nCells; i++) {
                    className = "wigo_ws_cell{0}".format(i);
                    ctrl.headerDiv.appendChild(this.create("div", null, className));
                }
            }
            holderDiv.appendChild(ctrl.headerDiv);
            holderDiv.appendChild(ctrl.listDiv);
            return ctrl;
        };
        var ctrl; // Set by this.createList(..)
        
        // Sets height of list. Needs to be set for scrolling to occur.
        // Args:
        //  nShrinkPels: number, optional. number of pels to reduce calculated height..
        //                    Defaults to 0.
        // Note: Calculates list height = height of body - nShrinkPels.
        this.setListHeight = function(nShrinkPels) {  ////20171223
            if (!ctrl)
                return; //// Quit if list has not been created.
            // Set height for scrolling ////20172223 added
            if (typeof(nShrinkPels) !== 'number')
                nShrinkPels = 0;
            var yBody = document.body.offsetHeight;
            ////20171224 finding yListTop does not work because listDiv is not visible.
            ////20171224 var yListTop = ctrl.listDiv.offsetTop;
            ////20171224 while (ctrl.listDiv.offsetParent) {
            ////20171224     yListTop += ctrl.listDiv.offParent.offsetTop;
            ////20171224 }

            var yHeader = ctrl.headerDiv.offsetHeight;
            ////20171224 var yScroll = yBody - yListTop - yHeader - nShrinkPels;
            var yScroll = yBody - yHeader - nShrinkPels;
            ctrl.listDiv.style.height = yScroll.toFixed(0) + 'px';
        };

        // Adds an item to the listDiv.
        // Args:
        // listDiv: ref to HTMLElement for listDiv.
        // nCells: number of child divs added to listDiv. May be 0.
        // Returns: HTMLElement. ref to element  that has been created and added to listDiv.
        this.addItem = function(listDiv, nCells) {
            if (!(listDiv instanceof HTMLElement))
                throw new Error("Container list item must be a div.");
            
            var item = this.create("div");
            if (typeof nCells === 'number') {
                var className;
                for (let i=0; i < nCells; i++) {
                    className = "wigo_ws_cell{0}".format(i);
                    item.appendChild(this.create('div', null, className));
                }
            }
            listDiv.appendChild(item);
            return item;
        };

        // Creates a ScrollComplete object for handling scroll events on listDiv.
        // Arg:
        //  listDiv: HTMLElement. the scrollable div.
        // Returns: {onScrollComplete: function}, a ScrollComplete object.
        //  onScrollComplete: callback function assigned by user, which is called when 
        //  scrolling has completed.
        this.newOnScrollComplete = function(listDiv) {
            return new ScrollComplete(listDiv);
        };

        // Object that detects when scrolling has completed.
        function ScrollComplete(listDiv) {
            // Copnstructor Arg:
            //  listDiv: HTMLElement: ref to div that is being scrolled.
            // 
            // User assigned callback that is called after scrolling for listDiv completes.
            // Arg:
            //  pxScrollTop: integer. scroll top in pixels for listDiv
            //  nScrollEventCount: integer. number of scroll events that occurred before scrolling completes.
            //                     scroll event occur continuously during scrolling,
            //                     but this.onScrollComplete(...) is only called after scrolling completes.
            //  Note: User can set to null if no callback is needed, otherwise user
            //  needs to implement the callback.
            this.onScrollComplete = function(pxScrollTop, nScrollEventCount) {};

            // Stops listening for scroll events on listDiv.
            this.stop = function() {
                listDiv.removeEventListener('scroll', OnScrollEvent, false);
            };

            ////20171226NotUsed // Returns number of scroll events that have occurred before scrolling completes.
            ////20171226NotUsed this.getEventCount = function() {  ////20171226 added function.
            ////20171226NotUsed     return nScrollEventCount;
            ////20171226NotUsed };
            ////20171226NotUsed 

            // ** Private members
            // Event handler for the scroll event on listDiv.
            // Remarks:
            // Successive scroll events can occur quickly.
            // If no subsequent scroll event occurs after a timerDelay (say 333 milliseconds),
            // scrolling is considered to have completed.
            function OnScrollEvent(event) {
                if (timerId) {
                    nScrollEventCount++;
                    window.clearTimeout(timerId);
                }
                timerId = window.setTimeout(function(){
                    timerId = null; // Reset timer id.
                    if (typeof (that.onScrollComplete) === 'function') {
                        that.onScrollComplete(event.target.scrollTop, nScrollEventCount);
                    }
                    nScrollEventCount = 0; 
                }, timerDelay);
            }


            // Constructor initialization.
            var that = this;
            var timerDelay = 200; // 333; // Timeout in milliseconds to detect that scrolling has stopped.
            var timerId = null;

            var nScrollEventCount = 0; // Number of scroll events that have occurred before scrolling stops. ////20171226 added.

            // Start listening for scroll events.
            listDiv.addEventListener('scroll', OnScrollEvent, false);
        }
    }
    ScrollableListBase.prototype = controlBase;
    ScrollableListBase.constructor = ScrollableListBase;

    return {
        DropDownControl: DropDownControl,
        TabControl: TabControl,
        StatusDiv: StatusDiv,
        OnOffControl: OnOffControl, 
        TitleBar: TitleBar,
        TitleBar2: TitleBar2,
        NewYesNoControl: NewYesNoControl,
        ScrollableListBase: ScrollableListBase, 
    }
}

// Object for customization details about a device.
// Ideally an app will not needed any device customization,
// but it may be necesssary if some features are not available
// in a device.
function Wigo_Ws_CordovaDeviceDetails() {

    // Returns object that enumerations the devices.
    this.DeviceEnum = function() {
        return {android: 0, iPhone: 1, unknown: -1};
    };

    // Sets type of device.
    // eDevice: enumeration value from a DeviceEnum object.
    this.setDevice = function(eDevice) {
        switch(eDevice) {
            case deviceEnum.android: device = eDevice; break;
            case deviceEnum.iPhone: device = eDevice; break;
            default:
                device = deviceEnum.unknown; break;
        }
    }

    // Returns true if device is android.
    this.isAndroid = function() {
        var bAndroid = device === deviceEnum.android;
        return bAndroid;
    };

    // Returns true if device is iPhone.
    this.isiPhone = function() {
        var biPhone = device === deviceEnum.iPhone; 
        return biPhone;
    }
    
    // Enumeration obj for identifying devices.
    var deviceEnum = this.DeviceEnum();

    // Kind of device: integer from deviceEnum obj.
    var device = deviceEnum.android;
}
