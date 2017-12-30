//
//  Emojione.swift
//
//  Created by Rafael Kellermann Streit (@rafaelks) on 10/10/16.
//  Copyright (c) 2016.
//

import Foundation

public struct Emoji: Codable {
    public let name: String
    public let shortname: String
    public let supportsTones: Bool
    public let alternates: [String]
    public let keywords: [String]

    public init(_ name: String, _ shortname: String, _ supportsTones: Bool, _ alternates: [String], _ keywords: [String]) {
        self.name = name
        self.shortname = shortname
        self.supportsTones = supportsTones
        self.alternates = alternates
        self.keywords = keywords
    }
}

// swiftlint:disable type_body_length
// swiftlint:disable file_length
public extension Emoji {
    public static let shortnameRegex = try? NSRegularExpression(pattern: "<%= regex %>", options: [])

    public static let shortnameToUnicodeDictionary = [
        <%= mapping %>
    ]

    <%= categories %>
    
    static func transform(_ string: String) -> String {
        let oldString = string as NSString
        var transformedString = string as NSString

        let matches = shortnameRegex?.matches(in: transformedString as String, options: [], range: NSRange(location: 0, length: transformedString.length)) ?? []

        for result in matches {
            guard result.numberOfRanges == 2 else { continue }

            let shortname = oldString.substring(with: result.range(at: 0))
            if let emoji = shortnameToUnicodeDictionary[shortname] {
                transformedString = transformedString.replacingOccurrences(of: shortname, with: emoji) as NSString
            }
        }

        return transformedString as String
    }
}
