/*
<javascriptresource>
<name>Search And Replace Layer Names</name>
<category>Utils</category>
</javascriptresource>
*/

var doc;
var matchingLayers = [];
var layerIDs = [];

var matches = false;
var contains = true;
var begingsWith = false;
var endsWith = false;

var replace = true;
var replaceWhole = false;
var addPrefix = false;
var addSuffix = false;
var selectMatching = false;
var ignoreCase = false;
var useRegEx = false;

var searchInputField = "";
var layerTypeDropdown;
var blendModeDropdown;

var checkOpacity = false;
var checkFillOpacity = false;
var minOpacity = 0;
var maxOpacity = 100;
var minFillOpacity = 0;
var maxFillOpacity = 100;

String.prototype.endsWith = function (str) {
    return this.substring(this.length - str.length, this.length) === str;
};
String.prototype.startsWith = function (str) {
    return this.substring(0, str.length) === str;
};

var layerBlendModes = {
    "Normal": BlendMode.NORMAL,
    "Dissolve": BlendMode.DISSOLVE,
    "Darken": BlendMode.DARKEN,
    "Multiply": BlendMode.MULTIPLY,
    "Color Burn": BlendMode.COLORBURN,
    "Linear Burn": BlendMode.LINEARBURN,
    "Darker Color": BlendMode.DARKERCOLOR,
    "Lighten": BlendMode.LIGHTEN,
    "Screen": BlendMode.SCREEN,
    "Color Dodge": BlendMode.COLORDODGE,
    "Linear Dodge (Add)": BlendMode.LINEARDODGE,
    "Lighter Color": BlendMode.LIGHTERCOLOR,
    "Overlay": BlendMode.OVERLAY,
    "Soft Light": BlendMode.SOFTLIGHT,
    "Hard Light": BlendMode.HARDLIGHT,
    "Vivid Light": BlendMode.VIVIDLIGHT,
    "Linear Light": BlendMode.LINEARLIGHT,
    "Pin Light": BlendMode.PINLIGHT,
    "Hard Mix": BlendMode.HARDMIX,
    "Difference": BlendMode.DIFFERENCE,
    "Exclusion": BlendMode.EXCLUSION,
    "Subtract": BlendMode.SUBTRACT,
    "Divide": BlendMode.DIVIDE,
    "Hue": BlendMode.HUE,
    "Saturation": BlendMode.SATURATION,
    "Color": BlendMode.COLORBLEND,
    "Luminosity": BlendMode.LUMINOSITY
};

var layerTypes = {
    "Normal": LayerKind.NORMAL,
    "Text": LayerKind.TEXT,
    "Group/Frame": "LayerSet",
    "SmartObject": LayerKind.SMARTOBJECT,
    "Solid Fill": LayerKind.SOLIDFILL,
    "Gradient Fill": LayerKind.GRADIENTFILL,
    "Pattern": LayerKind.PATTERNFILL,
    "Brightness/Contrast": LayerKind.BRIGHTNESSCONTRAST,
    "Levels": LayerKind.LEVELS,
    "Curves": LayerKind.CURVES,
    "Exposure": LayerKind.EXPOSURE,
    "Vibrance": LayerKind.VIBRANCE,
    "Hue/Saturation": LayerKind.HUESATURATION,
    "Color Balance": LayerKind.COLORBALANCE,
    "Black & White": LayerKind.BLACKANDWHITE,
    "Photo Filter": LayerKind.PHOTOFILTER,
    "Channel Mixer": LayerKind.CHANNELMIXER,
    "Color Lookup": LayerKind.COLORLOOKUP,
    "Invert": LayerKind.INVERSION,
    "Posterize": LayerKind.POSTERIZE,
    "Threshold": LayerKind.THRESHOLD,
    "Gradient Map": LayerKind.GRADIENTMAP,
    "Selective Color": LayerKind.SELECTIVECOLOR
};

var adjustmentLayers = [
    LayerKind.BRIGHTNESSCONTRAST, LayerKind.LEVELS, LayerKind.CURVES,
    LayerKind.EXPOSURE, LayerKind.VIBRANCE, LayerKind.HUESATURATION,
    LayerKind.COLORBALANCE, LayerKind.BLACKANDWHITE, LayerKind.PHOTOFILTER,
    LayerKind.CHANNELMIXER, LayerKind.COLORLOOKUP, LayerKind.INVERSION, LayerKind.POSTERIZE,
    LayerKind.THRESHOLD, LayerKind.GRADIENTMAP, LayerKind.SELECTIVECOLOR
];

var shapeAndFillLayers = {
    "Solid Fill": LayerKind.SOLIDFILL,
    "Gradient Fill": LayerKind.GRADIENTFILL,
    "Pattern": LayerKind.PATTERNFILL
};

if (app.documents.length <= 0) {
    alert("No active document");
} else {
    doc = app.activeDocument;
    doc.suspendHistory("Search And Replace Names", "main();");
}

function main() {
    showUI();
}

function showUI() {

    var w = new Window("dialog", "Search And Replace Layer Names", undefined, {closeButton: true});
    w.alignChildren = "fill";

    var searchResults = "";
    var inputGrp = w.add("group");
    inputGrp.add("statictext", undefined, "Search for:");
    searchInputField = inputGrp.add("edittext", undefined, searchResults);
    searchInputField.characters = 30;


    var panelGrp = w.add("panel", undefined, undefined);
    panelGrp.orientation = "row";
    var containsToggle = panelGrp.add("radiobutton", undefined, "contains");
    var matchesToggle = panelGrp.add("radiobutton", undefined, "matches");
    var begingsWithToggle = panelGrp.add("radiobutton", undefined, "begins with");
    var endsWithToggle = panelGrp.add("radiobutton", undefined, "ends with");
    containsToggle.value = true;

    var replaceGrp = w.add("group");
    replaceGrp.add("statictext", undefined, "New name:");
    var replaceWithField = replaceGrp.add("edittext", undefined, "");
    replaceWithField.characters = 30;

    var toggleGrp = w.add("panel", undefined, undefined);
    toggleGrp.orientation = "row";
    toggleGrp.alignChildren = "fill";

    var replaceToggle = toggleGrp.add("radiobutton", undefined, "replace");
    var replaceWholeToggle = toggleGrp.add("radiobutton", undefined, "replace whole");
    var addPrefixToggle = toggleGrp.add("radiobutton", undefined, "add prefix");
    var addSuffixToggle = toggleGrp.add("radiobutton", undefined, "add suffix");
    replaceToggle.value = true;

    var buttonGrp = w.add('group {alignment: "center"}');
    var updateLayerNamesBtn = buttonGrp.add('button', undefined, 'Update Layer Names');
    updateLayerNamesBtn.preferredSize = {width: 160,height: 40};
    updateLayerNamesBtn.onClick = function () {
        layerIDs = [];
        matches = matchesToggle.value;
        contains = containsToggle.value;
        begingsWith = begingsWithToggle.value;
        endsWith = endsWithToggle.value;

        replace = replaceToggle.value;
        replaceWhole = replaceWholeToggle.value;
        addPrefix = addPrefixToggle.value;
        addSuffix = addSuffixToggle.value;
        checkOpacity = opacityCheckBox.value;
        checkFillOpacity = fillOpacityCheckBox.value;
        selectMatching = selectMatchingCheckBox.value;
        ignoreCase = ignoreCaseCheckBox.value;
        useRegEx = useRegExCheckBox.value;
        matchingLayers = [];
        traverseLayers(doc.layers)
        var isInvalid = false;
        for (var i = 0; i < matchingLayers.length; i++) {
            var tempVis = matchingLayers[i].visible;
            if (!matchingLayers[i].isBackgroundLayer) {
                if (searchInputField.text == "" && replaceToggle.value) {
                    isInvalid = true;
                    if (selectMatching) {
                        doc.activeLayer = matchingLayers[i];
                        layerIDs.push(getLayerID());
                    }
                } else {
                    var indice = 0;
                    var text = replaceWithField.text;
                    if (text.match("%NN")) {
                        if (searchInputField.text == "") {
                            indice = matchingLayers.length - i - 1;
                        } else {
                            indice = matchingLayers.length - i;
                        }
                        if (indice < 10) {
                            indice = "0" + indice.toString();
                        }
                        text = text.replace(/%NN/g, indice);
                    }
                    indice = 0;
                    if (text.match("%nn")) {
                        indice = i + 1;
                        if (indice < 10) {
                            indice = "0" + indice.toString();
                        }
                        text = text.replace(/%nn/g, indice);
                    }
                    updateNames(matchingLayers[i], matchingLayers[i].name, text)
                    if (selectMatching) {
                        doc.activeLayer = matchingLayers[i];
                        layerIDs.push(getLayerID());
                    }
                }
            }
            matchingLayers[i].visible = tempVis;
        }
        if (isInvalid) {
            alert("Replace option not available with empty search.\nTry 'replace whole', 'add prefix' or 'add suffix' options instead.");
        }
        if (layerIDs.length !== 0 && selectMatching) {
            deselectAllLayers();
            selectLayersByID(layerIDs);
        }
    }

    var advancedSettingsGrp = w.add("panel", undefined, "Advanced Settings:");
    advancedSettingsGrp.orientation = "column";
    advancedSettingsGrp.alignChildren = "left";

    var blendModeGrp = advancedSettingsGrp.add("group", undefined, undefined);
    blendModeGrp.orientation = "row";
    blendModeGrp.alignChildren = "fill";
    blendModeGrp.add("statictext", undefined, "Blend Mode:");
    blendModeDropdown = blendModeGrp.add("dropdownlist", undefined, ["Any                                            ",
        "-", "Normal", "Dissolve", "-", "Darken", "Multiply", "Color Burn", "Linear Burn", "Darker Color", "-", "Lighten",
        "Screen", "Color Dodge", "Linear Dodge (Add)", "Lighter Color", "-", "Overlay", "Soft Light", "Hard Light",
        "Vivid Light", "Linear Light", "Pin Light", "Hard Mix", "-", "Difference", "Exclusion", "Subtract", "Divide", "-",
        "Hue", "Saturation", "Color", "Luminosity"
    ]);
    blendModeDropdown.selection = 0;

    var layerTypeGrp = advancedSettingsGrp.add("group", undefined, undefined);
    layerTypeGrp.orientation = "row";
    layerTypeGrp.alignChildren = "fill";
    layerTypeGrp.add("statictext", undefined, "Layer Type:");
    layerTypeDropdown = layerTypeGrp.add("dropdownlist", undefined, ["Any", "-", "Normal", "Text", "Group/Frame",
        "SmartObject", "-", "Solid", "Gradient", "Pattern", "-", "Any Non-Fill Adjustement Layer", "-",
        "Brightness/Contrast", "Levels", "Curves", "Exposure", "-", "Vibrance", "Hue/Saturation", "Color Balance",
        "Black & White", "Photo Filter", "Channel Mixer", "Color Lookup", "-", "Invert", "Posterize", "Threshold",
        "Gradient Map", "Selective Color"
    ]);
    layerTypeDropdown.selection = 0;

    var checkboxGrp = advancedSettingsGrp.add("group", undefined, undefined);
    checkboxGrp.orientation = "row";
    checkboxGrp.alignChildren = "left";
    var opacityCheckBox = checkboxGrp.add("checkbox", undefined, "Limit by Opacity");
    var fillOpacityCheckBox = checkboxGrp.add("checkbox", undefined, "Limit by Fill");

    var opacityGrp = advancedSettingsGrp.add("group", undefined, undefined);
    opacityGrp.orientation = "row";
    opacityGrp.alignChildren = "left";
    opacityGrp.add("statictext", undefined, "Opacity:");
    var minOpacityField = opacityGrp.add('edittext {text: 0, characters: 3, justify: "left", active: true}');
    minOpacityField.onChange = function () {
        minOpacity = parseInt(minOpacityField.text);
        if (isNaN(minOpacity) || minOpacity < 0) {
            minOpacityField.text = 0;
            minOpacity = 0;
        } else if (isNaN(minOpacity) || minOpacity >= 100) {
            minOpacityField.text = 100;
            minOpacity = 100;
        }
    }
    minOpacityField.characters = 4;
    opacityGrp.add("statictext", undefined, ":");
    var maxOpacityField = opacityGrp.add('edittext {text: 100, characters: 3, justify: "left", active: true}');
    maxOpacityField.onChange = function () {
        maxOpacity = parseInt(maxOpacityField.text);
        if (isNaN(maxOpacity) || maxOpacity < 0) {
            maxOpacityField.text = 0;
            maxOpacity = 0;
        } else if (isNaN(maxOpacity) || maxOpacity >= 100) {
            maxOpacityField.text = 100;
            maxOpacity = 100;
        }
    }
    maxOpacityField.characters = 4;

    var fillGrp = advancedSettingsGrp.add("group", undefined, undefined);
    fillGrp.orientation = "row";
    fillGrp.align = "fill";
    fillGrp.add("statictext", undefined, "Fill:         ");
    var minFillOpacityField = fillGrp.add('edittext {text: 0, characters: 3, justify: "left", active: true}');
    minFillOpacityField.onChange = function () {
        minFillOpacity = parseInt(minFillOpacityField.text);
        if (isNaN(minFillOpacity) || minFillOpacity < 0) {
            minFillOpacityField.text = 0;
            minFillOpacity = 0;
        } else if (isNaN(minFillOpacity) || minFillOpacity >= 100) {
            minFillOpacityField.text = 100;
            minFillOpacity = 100;
        }
    }
    minFillOpacityField.characters = 4;
    fillGrp.add("statictext", undefined, ":");
    var maxFillOpacityField = fillGrp.add('edittext {text: 100, characters: 3, justify: "left", active: true}');
    maxFillOpacityField.onChange = function () {
        maxFillOpacity = parseInt(maxFillOpacityField.text);
        if (isNaN(maxFillOpacity) || maxFillOpacity < 0) {
            maxFillOpacityField.text = 0;
            maxFillOpacity = 0;
        } else if (isNaN(maxFillOpacity) || maxFillOpacity >= 100) {
            maxFillOpacityField.text = 100;
            maxFillOpacity = 100;
        }
    }
    maxFillOpacityField.characters = 4;

    var regGrp = advancedSettingsGrp.add("group", undefined, undefined);
    regGrp.orientation = "row";
    regGrp.align = "fill";
    var selectMatchingCheckBox = regGrp.add("checkbox", undefined, "Select Matching Layers");
    var ignoreCaseCheckBox = regGrp.add("checkbox", undefined, "Ignore case");
    var useRegExCheckBox = regGrp.add("checkbox", undefined, "Use RegEx");
    searchInputField.active = true;

    var showWin = w.show();
}

function traverseLayers(layers) {

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].typename === "LayerSet") {
            traverseLayers(layers[i].layers);
            returnMatchingLayers(matchingLayers, layers[i], searchInputField.text);
        } else {
            returnMatchingLayers(matchingLayers, layers[i], searchInputField.text);
        }
    }
}

function returnMatchingLayers(array, layer, search) {

    var layerName = layer.name;
    if (ignoreCase) {
        search = search.toLowerCase();
        layerName = layerName.toLowerCase();
    }
    if (matchAdvancedOptions(layer)) {
        if (matches) {
            if (layerName === search || search === "") {
                array.push(layer);
            }
        } else if (contains) {
            if (useRegEx) {
                var regExSearch = new RegExp(search, 'g')
                if (layerName.match(regExSearch)) {
                    array.push(layer);
                }
            } else if (layerName.match(search)) {
                array.push(layer);
            }
        }

        if (begingsWith) {
            if (layerName.startsWith(search)) {
                array.push(layer);
            }
        } else if (endsWith) {
            if (layerName.endsWith(search)) {
                array.push(layer);
            }
        }
    }
}

function matchAdvancedOptions(layer) {

    if (checkOpacity) {
        if (matchOpacity(layer.opacity, minOpacity, maxOpacity)) {
            return false;
        }
    }
    if (checkFillOpacity) {
        if (matchOpacity(layer.fillOpacity, minFillOpacity, maxFillOpacity)) {
            return false;
        }
    }
    if (layer.blendMode !== layerBlendModes[blendModeDropdown.selection.text]) {
        if (blendModeDropdown.selection.text !== "Any                                            ") {
            return false;
        }
    }
    if (layer.kind !== layerTypes[layerTypeDropdown.selection.text]) {
        if (layerTypeDropdown.selection.text !== "Any") {
            if (layerTypeDropdown.selection.text === "Any Non-Fill Adjustement Layer") {
                for (var i = 0; i < adjustmentLayers.length; i++) {
                    if (layer.kind == adjustmentLayers[i]) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        }
    }
    return true;
}

function matchOpacity(opacity, min, max) {

    if ((Math.round(opacity) >= min) && (Math.round(opacity) <= max)) {
        return false;
    } else {
        return true;
    }
}

function updateNames(layer, layerName, newLayerName) {

    var layerName = layer.name;

    if (replace) {
        var str = layerName;
        var array = [];
        var flag = "g";
        var regExString;
        if (ignoreCase) {
            flag = "ig";
            regExString = new RegExp(searchInputField.text, flag);
            str = str.replace(regExString, searchInputField.text.toLowerCase());
            array = str.split(searchInputField.text.toLowerCase());
        } else {
            array = str.split(searchInputField.text);
        }
        var replacestr = newLayerName;
        var newstr = "";
        if (useRegEx) {
            flag = "g";
            if (ignoreCase) {
                flag = "ig";
            }
            regExString = new RegExp(searchInputField.text, flag);
            newstr = str.replace(regExString, newLayerName);
        } else {
            for (var i = 0; i < array.length; i++) {
                if (array.length - 1 !== i) {
                    newstr = newstr.concat(array[i], replacestr);
                } else {
                    newstr = newstr.concat(array[i])
                }
            }
        }
        layer.name = newstr;

    } else if (replaceWhole) {
        layer.name = newLayerName;
    }

    if (addPrefix) {
        layer.name = newLayerName.concat(layerName);
    } else if (addSuffix) {
        layer.name = layerName.concat(newLayerName);
    }
}

function deselectAllLayers() {
    var idselectNoLayers = stringIDToTypeID("selectNoLayers");
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref.putEnumerated(idLyr, idOrdn, idTrgt);
    desc.putReference(idnull, ref);
    executeAction(idselectNoLayers, desc, DialogModes.NO);
}

function getLayerID() {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    return executeActionGet(ref).getInteger(stringIDToTypeID("layerID"));
};

function selectLayersByID(array) {
    var idslct = charIDToTypeID("slct");
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    ref.putIdentifier(idLyr, array[0]);
    desc.putReference(idnull, ref);
    var idselectionModifier = stringIDToTypeID("selectionModifier");
    var idselectionModifierType = stringIDToTypeID("selectionModifierType");
    var idaddToSelection = stringIDToTypeID("addToSelection");
    desc.putEnumerated(idselectionModifier, idselectionModifierType, idaddToSelection);
    var idMkVs = charIDToTypeID("MkVs");
    desc.putBoolean(idMkVs, false);
    var idLyrI = charIDToTypeID("LyrI");
    var list = new ActionList();
    for (var i = 0; i < array.length; i++) {
        selectLayerByID(array[i]);
        var layerID = getLayerID();
        list.putInteger(layerID);
    }
    desc.putList(idLyrI, list);
    executeAction(idslct, desc, DialogModes.NO);
}

function selectLayerByID(layerID) {
    var idslct = charIDToTypeID("slct");
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    ref.putIdentifier(idLyr, layerID);
    desc.putReference(idnull, ref);
    var idselectionModifier = stringIDToTypeID("selectionModifier");
    var idselectionModifierType = stringIDToTypeID("selectionModifierType");
    var idaddToSelection = stringIDToTypeID("addToSelection");
    desc.putEnumerated(idselectionModifier, idselectionModifierType, idaddToSelection);
    var idMkVs = charIDToTypeID("MkVs");
    desc.putBoolean(idMkVs, false);
    executeAction(idslct, desc, DialogModes.NO)
}