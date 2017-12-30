var util = require("util"),
    fs   = require("fs"),
    _    = require("underscore");


// Load emojis
var emojis = require("../../../emoji.json");

// Exclude undesired emojis from categories
var excludes = [":asterisk_symbol:", ":pound_symbol:", ":digit_zero:", ":digit_one:", 
                ":digit_two:", ":digit_three:", ":digit_four:", ":digit_five", 
                ":digit_six", ":digit_seven:", ":digit_eight:", ":digit_nine:",
                ":blond_haired_person:", ":merperson:", ":female_sign:", ":male_sign:",
                ":medical_symbol:"]

var regex =  '(' + _(emojis).map(e => e.shortname).reduce((regex, shortname) => regex + '|' + shortname) + ')'

// Build categories
var categories = Object.entries(_(emojis).reduce((categories, emoji) => {

    if(excludes.includes(emoji.shortname)) {
        return categories
    }

    // check if it's a tone modifier and ignore
    if(emoji.shortname.endsWith("_tone1:") || emoji.shortname.endsWith("_tone2:") || emoji.shortname.endsWith("_tone3:")
    || emoji.shortname.endsWith("_tone4:") || emoji.shortname.endsWith("_tone5:")) {
        return categories
    }

    if(emoji.shortname.startsWith(":person_")) {
        const hasGenderModifiers = _(emojis).find((e) => e.shortname == ":woman_" + emoji.shortname.substr(8)) != null
        if(hasGenderModifiers) {
            return categories
        }
    }

    if(emoji.shortname.startsWith(":people_")) {
        const hasGenderModifiers = _(emojis).find((e) => e.shortname == ":women_"+ emoji.shortname.substr(8)) != null
        if(hasGenderModifiers) {
            return categories
        }
    }

    if(emoji.shortname.endsWith("_person:")) {
        const hasGenderModifiers = _(emojis).find((e) => e.shortname == emoji.shortname.slice(0, -8) + '_woman:') != null
        if(hasGenderModifiers) {
            return categories
        }
    }

    if(_(emojis).find((e) => e.shortname == ":woman_" + emoji.shortname.substr(1)) != null) {
        return categories
    }

    // check if there's tone modifiers and mark as supporting tones
    const supportsTones = _(emojis).find((e) => e.shortname == emoji.shortname.slice(0, -1) + '_tone1:') != null

    if(categories[emoji.category] == null) {
        categories[emoji.category] = [];
    }

    categories[emoji.category].push({name: emoji.name, shortname: emoji.shortname, supportsTones: supportsTones, alternates: emoji.shortname_alternates, keywords: emoji.keywords})

    return categories
}, {})).map(([category, emoji]) => {
    return emoji.reduce((total, emoji) => {
        return total + '\n            Emoji("' + emoji.name + '", "' + emoji.shortname + '", ' + emoji.supportsTones + ', [' + emoji.alternates.map(s => '"' + s + '"').join(', ') + '], [' + emoji.keywords.map(s => '"' + s + '"').join(', ') + ']),'
    }, '\n\n    public static let ' + category + ': [Emoji] = [') + ']'
})

var mapping = _(emojis).map(function(data) {
    // Get chars
    var chars = data.code_points.output.split("-").map(function (code) {
        // Handle invalid unicode char for C99
        // http://c0x.coding-guidelines.com/6.4.3.html
        if (code < 160) {
            return String.fromCharCode(parseInt(code, 16));
        }

        return "\\u{" + Array(8 - code.length + 1).join("0") + code + "}";
    }).join('');

    const shortname = '"' + data.shortname + '": "' + chars + '",'
    const alternates = data.shortname_alternates.map(function(alternate) {
        return '\n        "' + alternate + '": "' + chars + '",'
    }).join('')

    return shortname + alternates
}).join("\n        ");

// Generate Objective-C class from template
var input  = fs.readFileSync("./Emojione.swift");
var output = _(input.toString()).template()({ regex: regex, mapping: mapping, categories: categories });

// Write Objective-C class to file
var output_path = "../src/Emojione.swift";
fs.writeFileSync(output_path, output);

console.log("Generated " + output_path);