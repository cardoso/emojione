//
//  Emojione.swift
//
//  Created by Rafael Kellermann Streit (@rafaelks) on 10/10/16.
//  Copyright (c) 2016.
//

import Foundation

struct Emoji {
    let name: String
    let shortname: String
    let supportsTones: Bool
    let alternates: [String]
    let keywords: [String]

    init(_ name: String, _ shortname: String, _ supportsTones: Bool, _ alternates: [String], _ keywords: [String]) {
        self.name = name
        self.shortname = shortname
        self.supportsTones = supportsTones
        self.alternates = alternates
        self.keywords = keywords
    }
}

// swiftlint:disable type_body_length
// swiftlint:disable file_length
struct Emojione {
    static let values = [
        <%= mapping %>
    ]

    <%= categories %>
    
    static func transform(string: String) -> String {
        let oldString = string as NSString
        var transformedString = string as NSString

        let regex = try? NSRegularExpression(pattern: ":([-+\\w]+):", options: [])
        let matches = regex?.matches(in: transformedString as String, options: [], range: NSRange(location: 0, length: transformedString.length)) ?? []

        for result in matches {
            guard result.numberOfRanges == 2 else { continue }

            let shortname = oldString.substring(with: result.range(at: 1))
            if let emoji = values[shortname] {
                transformedString = transformedString.replacingOccurrences(of: ":\(shortname):", with: emoji) as NSString
            }
        }

        return transformedString as String
    }
}
