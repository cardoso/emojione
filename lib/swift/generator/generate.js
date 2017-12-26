var util = require("util"),
    fs   = require("fs"),
    _    = require("underscore");


// Load emojis
var emojis = require("../../../emoji.json");

// Generate Objective-C mapping
var categories = Object.entries(_(emojis).reduce((categories, emoji) => {

    // check if it's a tone modifier and ignore
    if(emoji.shortname.endsWith("_tone1:") || emoji.shortname.endsWith("_tone2:") || emoji.shortname.endsWith("_tone3:")
    || emoji.shortname.endsWith("_tone4:") || emoji.shortname.endsWith("_tone5:")) {
        return categories
    }

    // check if there's tone modifiers and mark as supporting tones
    const supportsTones = _(emojis).find((e) => e.shortname == emoji.shortname.slice(0, -1) + '_tone1:') != null

    if(categories[emoji.category] == null) {
        categories[emoji.category] = [];
    }

    categories[emoji.category].push({shortname: emoji.shortname, supportsTones: supportsTones})

    return categories
}, {})).map(([category, emoji]) => {
    return emoji.reduce((total, emoji) => {
        return total + '\n            (shortname: "' + emoji.shortname + '", supportsTones: ' + emoji.supportsTones + '),'
    }, '\n        "' + category + '": [') + ']'
})

var mapping = _(emojis).map(function(data, unicode) {
    // Get chars
    var chars = _(unicode.split("-")).map(function (code) {
        // Handle invalid unicode char for C99
        // http://c0x.coding-guidelines.com/6.4.3.html
        if (code < 160) {
            return String.fromCharCode(parseInt(code, 16));
        }

        return "\\u{" + Array(8 - code.length + 1).join("0") + code + "}";
    }).join('');

    const shortname = '"' + data.shortname.slice(1, -1) + '": "' + chars + '",'
    const alternates = data.shortname_alternates.map(function(alternate) {
        return '\n        "' + alternate.slice(1, -1) + '": "' + chars + '",'
    }).join('')

    return shortname + alternates
}).join("\n        ");

// Generate Objective-C class from template
var input  = fs.readFileSync("./Emojione.swift");
var output = _(input.toString()).template()({ mapping: mapping, categories: categories });

// Write Objective-C class to file
var output_path = "../src/Emojione.swift";
fs.writeFileSync(output_path, output);

console.log("Generated " + output_path);