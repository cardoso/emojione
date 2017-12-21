var util = require("util"),
    fs   = require("fs"),
    _    = require("underscore");


// Load emojis
var emojis = require("../../../emoji.json");

// Generate Objective-C mapping
var categories = Object.entries(_(emojis).reduce((categories, emoji) => {
    if(categories[emoji.category] == null) {
        categories[emoji.category] = [];
    }

    categories[emoji.category].push(emoji.shortname)

    return categories
}, {})).map(([category, shortnames]) => {
    return shortnames.reduce((total, shortname) => {
        return total + '\n            "' + shortname + '",'
    }, '\n        "' + category + '": [') + ']'
}) /*Object.entries(_(emojis).map(emoji => emoji.category).reduce(function(total, current) {
    if(total[current.category] == null) {
        total[current.category] = [];
    }

    total[current.category].push(current.shortname)

    return total
})).map(function(category) {
    return category.reduce(function(total, current) {
        return total + '"' + current + '"' + ','
    }, '\n        ["' + category[0] + '":') + "]"
}).join(',')*/

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