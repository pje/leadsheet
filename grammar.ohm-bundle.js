import { makeRecipe } from "ohm-js";
const result = {};
result.Chord = makeRecipe([
  "grammar",
  {
    source:
      'Chord {\n  ChordExp = root flavor\n\n  root = noteLetter accidental?\n\n  flavor = quality? extent? alteration*\n\n  noteLetter =\n    | caseInsensitive<"A">\n    | "B"\n    | caseInsensitive<"C">\n    | caseInsensitive<"D">\n    | caseInsensitive<"E">\n    | caseInsensitive<"F">\n    | caseInsensitive<"G">\n\n  accidental =\n    | "##" | "𝄪" | "♯♯"\n    | "bb" | "𝄫" | "♭♭"\n    | "#"  | "♯"\n    | "b"  | "♭"\n    | "♮"\n\n  alteration_symbol =\n    | "Δ"\n    | "+"\n    | "⁺"\n    | "o"\n    | "°"\n    | "-"\n    | "⁻"\n    | caseInsensitive<"ø">\n\n  extent =\n    | thirteen\n    | eleven\n    | nine\n    | seven\n    | six_and_nine\n    | six\n    | five\n    | four\n    | two\n\n  thirteen = | "13" | "¹³"\n  eleven = | "11" | "¹¹"\n  nine = | "9" | "⁹"\n  seven = | "7" | "⁷"\n  six_and_nine = | six "/"? nine\n  six = | "6" | "⁶"\n  five = | "5" | "⁵"\n  four = | "4" | "⁴"\n  two = | "2" | "²"\n\n  quality =\n    | sus\n    | minor_major\n    | augmented\n    | diminished\n    | dominant\n    | half_diminished\n    | major\n    | minor\n\n  sus =\n    | caseInsensitive<"sus">\n\n  minor_major =\n    | minor_major_with_parens\n    | caseInsensitive<"minmaj">\n    | "mM"\n    | "mΔ"\n    | "-Δ"\n    | "m/M"\n\n  minor_major_with_parens =\n    | minor "(" major extent ")"\n\n  augmented =\n    | caseInsensitive<"augmented">\n    | caseInsensitive<"aug">\n    | "+"\n    | "⁺"\n\n  diminished =\n    | caseInsensitive<"diminished">\n    | caseInsensitive<"dim">\n    | "o"\n    | "°"\n\n  dominant =\n    | caseInsensitive<"dominant">\n    | caseInsensitive<"dom">\n\n  half_diminished =\n    | caseInsensitive<"ø">\n\n  major =\n    | caseInsensitive<"major">\n    | caseInsensitive<"maj">\n    | "M"\n    | "Δ"\n\n  minor =\n    | caseInsensitive<"minor">\n    | caseInsensitive<"min">\n    | "-"\n    | "⁻"\n    | "m"\n\n  alteration =\n    | alteration_in_parens\n    | alteration_no_parens\n\n  alteration_no_parens =\n    | accidental extent                          // e.g. #11, b13\n    | alteration_symbol extent                   // e.g. Δ9,  ⁺7\n    | alteration_add_no_omit extent              // e.g. "no 5", no5, "add 5", "omit 5"\n    | "/" root                                   // e.g. C/G\n    | caseInsensitive<"alt"> extent?             // e.g. alt, alt7\n    | caseInsensitive<"sus"> ("2"|"4")?          // e.g. sus, sus2, sus4\n    | spaceNoNL? extent                          // e.g. `C7`, `C 9`\n\n  alteration_in_parens = "(" spaceNoNL? alteration_no_parens spaceNoNL? ")"\n\n  alteration_add_no_omit =\n    spaceNoNL* (caseInsensitive<"add"> | caseInsensitive<"no"> | caseInsensitive<"omit">) spaceNoNL*\n\n  newline = "\\r"? "\\n"\n  spaceNoNL = ~newline "\\x00".."\\x20"\n}',
  },
  "Chord",
  null,
  "ChordExp",
  {
    ChordExp: [
      "define",
      { sourceInterval: [10, 32] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [21, 32] },
        ["app", { sourceInterval: [21, 25] }, "root", []],
        ["app", { sourceInterval: [26, 32] }, "flavor", []],
      ],
    ],
    root: [
      "define",
      { sourceInterval: [36, 65] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [43, 65] },
        ["app", { sourceInterval: [43, 53] }, "noteLetter", []],
        [
          "opt",
          { sourceInterval: [54, 65] },
          ["app", { sourceInterval: [54, 64] }, "accidental", []],
        ],
      ],
    ],
    flavor: [
      "define",
      { sourceInterval: [69, 106] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [78, 106] },
        [
          "opt",
          { sourceInterval: [78, 86] },
          ["app", { sourceInterval: [78, 85] }, "quality", []],
        ],
        [
          "opt",
          { sourceInterval: [87, 94] },
          ["app", { sourceInterval: [87, 93] }, "extent", []],
        ],
        [
          "star",
          { sourceInterval: [95, 106] },
          ["app", { sourceInterval: [95, 105] }, "alteration", []],
        ],
      ],
    ],
    noteLetter: [
      "define",
      { sourceInterval: [110, 294] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [127, 294] },
        [
          "app",
          { sourceInterval: [129, 149] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [145, 148] }, "A"]],
        ],
        ["terminal", { sourceInterval: [156, 159] }, "B"],
        [
          "app",
          { sourceInterval: [166, 186] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [182, 185] }, "C"]],
        ],
        [
          "app",
          { sourceInterval: [193, 213] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [209, 212] }, "D"]],
        ],
        [
          "app",
          { sourceInterval: [220, 240] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [236, 239] }, "E"]],
        ],
        [
          "app",
          { sourceInterval: [247, 267] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [263, 266] }, "F"]],
        ],
        [
          "app",
          { sourceInterval: [274, 294] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [290, 293] }, "G"]],
        ],
      ],
    ],
    accidental: [
      "define",
      { sourceInterval: [298, 404] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [315, 404] },
        ["terminal", { sourceInterval: [317, 321] }, "##"],
        ["terminal", { sourceInterval: [324, 328] }, "𝄪"],
        ["terminal", { sourceInterval: [331, 335] }, "♯♯"],
        ["terminal", { sourceInterval: [342, 346] }, "bb"],
        ["terminal", { sourceInterval: [349, 353] }, "𝄫"],
        ["terminal", { sourceInterval: [356, 360] }, "♭♭"],
        ["terminal", { sourceInterval: [367, 370] }, "#"],
        ["terminal", { sourceInterval: [374, 377] }, "♯"],
        ["terminal", { sourceInterval: [384, 387] }, "b"],
        ["terminal", { sourceInterval: [391, 394] }, "♭"],
        ["terminal", { sourceInterval: [401, 404] }, "♮"],
      ],
    ],
    alteration_symbol: [
      "define",
      { sourceInterval: [408, 524] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [432, 524] },
        ["terminal", { sourceInterval: [434, 437] }, "Δ"],
        ["terminal", { sourceInterval: [444, 447] }, "+"],
        ["terminal", { sourceInterval: [454, 457] }, "⁺"],
        ["terminal", { sourceInterval: [464, 467] }, "o"],
        ["terminal", { sourceInterval: [474, 477] }, "°"],
        ["terminal", { sourceInterval: [484, 487] }, "-"],
        ["terminal", { sourceInterval: [494, 497] }, "⁻"],
        [
          "app",
          { sourceInterval: [504, 524] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [520, 523] }, "ø"]],
        ],
      ],
    ],
    extent: [
      "define",
      { sourceInterval: [528, 648] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [541, 648] },
        ["app", { sourceInterval: [543, 551] }, "thirteen", []],
        ["app", { sourceInterval: [558, 564] }, "eleven", []],
        ["app", { sourceInterval: [571, 575] }, "nine", []],
        ["app", { sourceInterval: [582, 587] }, "seven", []],
        ["app", { sourceInterval: [594, 606] }, "six_and_nine", []],
        ["app", { sourceInterval: [613, 616] }, "six", []],
        ["app", { sourceInterval: [623, 627] }, "five", []],
        ["app", { sourceInterval: [634, 638] }, "four", []],
        ["app", { sourceInterval: [645, 648] }, "two", []],
      ],
    ],
    thirteen: [
      "define",
      { sourceInterval: [652, 676] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [663, 676] },
        ["terminal", { sourceInterval: [665, 669] }, "13"],
        ["terminal", { sourceInterval: [672, 676] }, "¹³"],
      ],
    ],
    eleven: [
      "define",
      { sourceInterval: [679, 701] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [688, 701] },
        ["terminal", { sourceInterval: [690, 694] }, "11"],
        ["terminal", { sourceInterval: [697, 701] }, "¹¹"],
      ],
    ],
    nine: [
      "define",
      { sourceInterval: [704, 722] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [711, 722] },
        ["terminal", { sourceInterval: [713, 716] }, "9"],
        ["terminal", { sourceInterval: [719, 722] }, "⁹"],
      ],
    ],
    seven: [
      "define",
      { sourceInterval: [725, 744] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [733, 744] },
        ["terminal", { sourceInterval: [735, 738] }, "7"],
        ["terminal", { sourceInterval: [741, 744] }, "⁷"],
      ],
    ],
    six_and_nine: [
      "define",
      { sourceInterval: [747, 777] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [762, 777] },
        ["app", { sourceInterval: [764, 767] }, "six", []],
        [
          "opt",
          { sourceInterval: [768, 772] },
          ["terminal", { sourceInterval: [768, 771] }, "/"],
        ],
        ["app", { sourceInterval: [773, 777] }, "nine", []],
      ],
    ],
    six: [
      "define",
      { sourceInterval: [780, 797] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [786, 797] },
        ["terminal", { sourceInterval: [788, 791] }, "6"],
        ["terminal", { sourceInterval: [794, 797] }, "⁶"],
      ],
    ],
    five: [
      "define",
      { sourceInterval: [800, 818] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [807, 818] },
        ["terminal", { sourceInterval: [809, 812] }, "5"],
        ["terminal", { sourceInterval: [815, 818] }, "⁵"],
      ],
    ],
    four: [
      "define",
      { sourceInterval: [821, 839] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [828, 839] },
        ["terminal", { sourceInterval: [830, 833] }, "4"],
        ["terminal", { sourceInterval: [836, 839] }, "⁴"],
      ],
    ],
    two: [
      "define",
      { sourceInterval: [842, 859] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [848, 859] },
        ["terminal", { sourceInterval: [850, 853] }, "2"],
        ["terminal", { sourceInterval: [856, 859] }, "²"],
      ],
    ],
    quality: [
      "define",
      { sourceInterval: [863, 994] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [877, 994] },
        ["app", { sourceInterval: [879, 882] }, "sus", []],
        ["app", { sourceInterval: [889, 900] }, "minor_major", []],
        ["app", { sourceInterval: [907, 916] }, "augmented", []],
        ["app", { sourceInterval: [923, 933] }, "diminished", []],
        ["app", { sourceInterval: [940, 948] }, "dominant", []],
        ["app", { sourceInterval: [955, 970] }, "half_diminished", []],
        ["app", { sourceInterval: [977, 982] }, "major", []],
        ["app", { sourceInterval: [989, 994] }, "minor", []],
      ],
    ],
    sus: [
      "define",
      { sourceInterval: [998, 1032] },
      null,
      [],
      [
        "app",
        { sourceInterval: [1008, 1032] },
        "caseInsensitive",
        [["terminal", { sourceInterval: [1026, 1031] }, "sus"]],
      ],
    ],
    minor_major: [
      "define",
      { sourceInterval: [1036, 1156] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1054, 1156] },
        [
          "app",
          { sourceInterval: [1056, 1079] },
          "minor_major_with_parens",
          [],
        ],
        [
          "app",
          { sourceInterval: [1086, 1111] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1102, 1110] }, "minmaj"]],
        ],
        ["terminal", { sourceInterval: [1118, 1122] }, "mM"],
        ["terminal", { sourceInterval: [1129, 1133] }, "mΔ"],
        ["terminal", { sourceInterval: [1140, 1144] }, "-Δ"],
        ["terminal", { sourceInterval: [1151, 1156] }, "m/M"],
      ],
    ],
    minor_major_with_parens: [
      "define",
      { sourceInterval: [1160, 1218] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [1190, 1218] },
        ["app", { sourceInterval: [1192, 1197] }, "minor", []],
        ["terminal", { sourceInterval: [1198, 1201] }, "("],
        ["app", { sourceInterval: [1202, 1207] }, "major", []],
        ["app", { sourceInterval: [1208, 1214] }, "extent", []],
        ["terminal", { sourceInterval: [1215, 1218] }, ")"],
      ],
    ],
    augmented: [
      "define",
      { sourceInterval: [1222, 1317] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1238, 1317] },
        [
          "app",
          { sourceInterval: [1240, 1268] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1256, 1267] }, "augmented"]],
        ],
        [
          "app",
          { sourceInterval: [1275, 1297] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1291, 1296] }, "aug"]],
        ],
        ["terminal", { sourceInterval: [1304, 1307] }, "+"],
        ["terminal", { sourceInterval: [1314, 1317] }, "⁺"],
      ],
    ],
    diminished: [
      "define",
      { sourceInterval: [1321, 1418] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1338, 1418] },
        [
          "app",
          { sourceInterval: [1340, 1369] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1356, 1368] }, "diminished"]],
        ],
        [
          "app",
          { sourceInterval: [1376, 1398] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1392, 1397] }, "dim"]],
        ],
        ["terminal", { sourceInterval: [1405, 1408] }, "o"],
        ["terminal", { sourceInterval: [1415, 1418] }, "°"],
      ],
    ],
    dominant: [
      "define",
      { sourceInterval: [1422, 1495] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1437, 1495] },
        [
          "app",
          { sourceInterval: [1439, 1466] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1455, 1465] }, "dominant"]],
        ],
        [
          "app",
          { sourceInterval: [1473, 1495] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1489, 1494] }, "dom"]],
        ],
      ],
    ],
    half_diminished: [
      "define",
      { sourceInterval: [1499, 1543] },
      null,
      [],
      [
        "app",
        { sourceInterval: [1521, 1543] },
        "caseInsensitive",
        [["terminal", { sourceInterval: [1539, 1542] }, "ø"]],
      ],
    ],
    major: [
      "define",
      { sourceInterval: [1547, 1634] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1559, 1634] },
        [
          "app",
          { sourceInterval: [1561, 1585] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1577, 1584] }, "major"]],
        ],
        [
          "app",
          { sourceInterval: [1592, 1614] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1608, 1613] }, "maj"]],
        ],
        ["terminal", { sourceInterval: [1621, 1624] }, "M"],
        ["terminal", { sourceInterval: [1631, 1634] }, "Δ"],
      ],
    ],
    minor: [
      "define",
      { sourceInterval: [1638, 1735] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1650, 1735] },
        [
          "app",
          { sourceInterval: [1652, 1676] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1668, 1675] }, "minor"]],
        ],
        [
          "app",
          { sourceInterval: [1683, 1705] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [1699, 1704] }, "min"]],
        ],
        ["terminal", { sourceInterval: [1712, 1715] }, "-"],
        ["terminal", { sourceInterval: [1722, 1725] }, "⁻"],
        ["terminal", { sourceInterval: [1732, 1735] }, "m"],
      ],
    ],
    alteration: [
      "define",
      { sourceInterval: [1739, 1805] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1756, 1805] },
        ["app", { sourceInterval: [1758, 1778] }, "alteration_in_parens", []],
        ["app", { sourceInterval: [1785, 1805] }, "alteration_no_parens", []],
      ],
    ],
    alteration_no_parens: [
      "define",
      { sourceInterval: [1809, 2275] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1836, 2275] },
        [
          "seq",
          { sourceInterval: [1838, 1855] },
          ["app", { sourceInterval: [1838, 1848] }, "accidental", []],
          ["app", { sourceInterval: [1849, 1855] }, "extent", []],
        ],
        [
          "seq",
          { sourceInterval: [1904, 1928] },
          ["app", { sourceInterval: [1904, 1921] }, "alteration_symbol", []],
          ["app", { sourceInterval: [1922, 1928] }, "extent", []],
        ],
        [
          "seq",
          { sourceInterval: [1969, 1998] },
          [
            "app",
            { sourceInterval: [1969, 1991] },
            "alteration_add_no_omit",
            [],
          ],
          ["app", { sourceInterval: [1992, 1998] }, "extent", []],
        ],
        [
          "seq",
          { sourceInterval: [2057, 2065] },
          ["terminal", { sourceInterval: [2057, 2060] }, "/"],
          ["app", { sourceInterval: [2061, 2065] }, "root", []],
        ],
        [
          "seq",
          { sourceInterval: [2118, 2148] },
          [
            "app",
            { sourceInterval: [2118, 2140] },
            "caseInsensitive",
            [["terminal", { sourceInterval: [2134, 2139] }, "alt"]],
          ],
          [
            "opt",
            { sourceInterval: [2141, 2148] },
            ["app", { sourceInterval: [2141, 2147] }, "extent", []],
          ],
        ],
        [
          "seq",
          { sourceInterval: [2185, 2218] },
          [
            "app",
            { sourceInterval: [2185, 2207] },
            "caseInsensitive",
            [["terminal", { sourceInterval: [2201, 2206] }, "sus"]],
          ],
          [
            "opt",
            { sourceInterval: [2208, 2218] },
            [
              "alt",
              { sourceInterval: [2209, 2216] },
              ["terminal", { sourceInterval: [2209, 2212] }, "2"],
              ["terminal", { sourceInterval: [2213, 2216] }, "4"],
            ],
          ],
        ],
        [
          "seq",
          { sourceInterval: [2258, 2275] },
          [
            "opt",
            { sourceInterval: [2258, 2268] },
            ["app", { sourceInterval: [2258, 2267] }, "spaceNoNL", []],
          ],
          ["app", { sourceInterval: [2269, 2275] }, "extent", []],
        ],
      ],
    ],
    alteration_in_parens: [
      "define",
      { sourceInterval: [2324, 2397] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [2347, 2397] },
        ["terminal", { sourceInterval: [2347, 2350] }, "("],
        [
          "opt",
          { sourceInterval: [2351, 2361] },
          ["app", { sourceInterval: [2351, 2360] }, "spaceNoNL", []],
        ],
        ["app", { sourceInterval: [2362, 2382] }, "alteration_no_parens", []],
        [
          "opt",
          { sourceInterval: [2383, 2393] },
          ["app", { sourceInterval: [2383, 2392] }, "spaceNoNL", []],
        ],
        ["terminal", { sourceInterval: [2394, 2397] }, ")"],
      ],
    ],
    alteration_add_no_omit: [
      "define",
      { sourceInterval: [2401, 2526] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [2430, 2526] },
        [
          "star",
          { sourceInterval: [2430, 2440] },
          ["app", { sourceInterval: [2430, 2439] }, "spaceNoNL", []],
        ],
        [
          "alt",
          { sourceInterval: [2442, 2514] },
          [
            "app",
            { sourceInterval: [2442, 2464] },
            "caseInsensitive",
            [["terminal", { sourceInterval: [2458, 2463] }, "add"]],
          ],
          [
            "app",
            { sourceInterval: [2467, 2488] },
            "caseInsensitive",
            [["terminal", { sourceInterval: [2483, 2487] }, "no"]],
          ],
          [
            "app",
            { sourceInterval: [2491, 2514] },
            "caseInsensitive",
            [["terminal", { sourceInterval: [2507, 2513] }, "omit"]],
          ],
        ],
        [
          "star",
          { sourceInterval: [2516, 2526] },
          ["app", { sourceInterval: [2516, 2525] }, "spaceNoNL", []],
        ],
      ],
    ],
    newline: [
      "define",
      { sourceInterval: [2530, 2550] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [2540, 2550] },
        [
          "opt",
          { sourceInterval: [2540, 2545] },
          ["terminal", { sourceInterval: [2540, 2544] }, "\r"],
        ],
        ["terminal", { sourceInterval: [2546, 2550] }, "\n"],
      ],
    ],
    spaceNoNL: [
      "define",
      { sourceInterval: [2553, 2588] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [2565, 2588] },
        [
          "not",
          { sourceInterval: [2565, 2573] },
          ["app", { sourceInterval: [2566, 2573] }, "newline", []],
        ],
        ["range", { sourceInterval: [2574, 2588] }, "\u0000", " "],
      ],
    ],
  },
]);
result.Song = makeRecipe([
  "grammar",
  {
    source:
      'Song <: Chord {\n  Song = metadata* Bars\n\n  Bars = Barline (Chord+ Barline+)+\n\n  lineComment = "//"(~newline any)+newline\n  space += lineComment // this overrides ohmjs\'s built-in definition of spaces to include our comments. This seems to be the easiest way to get ohmjs to handle comments (e.g. https://github.com/ohmjs/ohm/blob/39ccead882a/examples/simple-lisp/src/simple-lisp.mjs#L35)\n\n  metadata =\n    | metaTitle\n    | metaArtist\n    | metaYear\n    | metaKey\n    | metaSig\n\n  metaTitle  = caseInsensitive<"title:">  spaceNoNL* metaTitleValue  newline\n  metaArtist = caseInsensitive<"artist:"> spaceNoNL* metaArtistValue newline\n  metaYear   = caseInsensitive<"year:">   spaceNoNL* metaYearValue   newline\n  metaSig    = caseInsensitive<"sig:">    spaceNoNL* metaSigValue    newline\n  metaKey    = caseInsensitive<"key:">    spaceNoNL* metaKeyValue    newline\n\n  metaTitleValue  = (~newline any)+\n  metaArtistValue = (~newline any)+\n  metaYearValue   = (~newline any)+\n  metaSigValue    = (~newline any)+\n  metaKeyValue    = (~newline any)+\n\n  Barline =\n    | BarlineWithRepeats\n    | DoubleBarline\n    | SingleBarline\n\n  BarlineWithRepeats =\n    | BarRepeatSignifierClose (DoubleBarline | SingleBarline)\n    | (DoubleBarline | SingleBarline) BarRepeatSignifierOpen\n\n  BarRepeatSignifierOpen = (digit caseInsensitive<"x">?)? ":"\n  BarRepeatSignifierClose = ":" (digit caseInsensitive<"x">?)?\n\n  DoubleBarline = "||"\n  SingleBarline = "|"\n\n  RepeatPreviousChord =\n    | "-"\n    | "%"\n    | "/"\n    | "𝄎"\n\n  Chord = ChordExp | RepeatPreviousChord\n}',
  },
  "Song",
  result.Chord,
  "ChordExp",
  {
    Song: [
      "define",
      { sourceInterval: [18, 39] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [25, 39] },
        [
          "star",
          { sourceInterval: [25, 34] },
          ["app", { sourceInterval: [25, 33] }, "metadata", []],
        ],
        ["app", { sourceInterval: [35, 39] }, "Bars", []],
      ],
    ],
    Bars: [
      "define",
      { sourceInterval: [43, 76] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [50, 76] },
        ["app", { sourceInterval: [50, 57] }, "Barline", []],
        [
          "plus",
          { sourceInterval: [58, 76] },
          [
            "seq",
            { sourceInterval: [59, 74] },
            [
              "plus",
              { sourceInterval: [59, 65] },
              ["app", { sourceInterval: [59, 64] }, "Chord", []],
            ],
            [
              "plus",
              { sourceInterval: [66, 74] },
              ["app", { sourceInterval: [66, 73] }, "Barline", []],
            ],
          ],
        ],
      ],
    ],
    lineComment: [
      "define",
      { sourceInterval: [80, 120] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [94, 120] },
        ["terminal", { sourceInterval: [94, 98] }, "//"],
        [
          "plus",
          { sourceInterval: [98, 113] },
          [
            "seq",
            { sourceInterval: [99, 111] },
            [
              "not",
              { sourceInterval: [99, 107] },
              ["app", { sourceInterval: [100, 107] }, "newline", []],
            ],
            ["app", { sourceInterval: [108, 111] }, "any", []],
          ],
        ],
        ["app", { sourceInterval: [113, 120] }, "newline", []],
      ],
    ],
    space: [
      "extend",
      { sourceInterval: [123, 143] },
      null,
      [],
      ["app", { sourceInterval: [132, 143] }, "lineComment", []],
    ],
    metadata: [
      "define",
      { sourceInterval: [391, 477] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [406, 477] },
        ["app", { sourceInterval: [408, 417] }, "metaTitle", []],
        ["app", { sourceInterval: [424, 434] }, "metaArtist", []],
        ["app", { sourceInterval: [441, 449] }, "metaYear", []],
        ["app", { sourceInterval: [456, 463] }, "metaKey", []],
        ["app", { sourceInterval: [470, 477] }, "metaSig", []],
      ],
    ],
    metaTitle: [
      "define",
      { sourceInterval: [481, 555] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [494, 555] },
        [
          "app",
          { sourceInterval: [494, 519] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [510, 518] }, "title:"]],
        ],
        [
          "star",
          { sourceInterval: [521, 531] },
          ["app", { sourceInterval: [521, 530] }, "spaceNoNL", []],
        ],
        ["app", { sourceInterval: [532, 546] }, "metaTitleValue", []],
        ["app", { sourceInterval: [548, 555] }, "newline", []],
      ],
    ],
    metaArtist: [
      "define",
      { sourceInterval: [558, 632] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [571, 632] },
        [
          "app",
          { sourceInterval: [571, 597] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [587, 596] }, "artist:"]],
        ],
        [
          "star",
          { sourceInterval: [598, 608] },
          ["app", { sourceInterval: [598, 607] }, "spaceNoNL", []],
        ],
        ["app", { sourceInterval: [609, 624] }, "metaArtistValue", []],
        ["app", { sourceInterval: [625, 632] }, "newline", []],
      ],
    ],
    metaYear: [
      "define",
      { sourceInterval: [635, 709] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [648, 709] },
        [
          "app",
          { sourceInterval: [648, 672] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [664, 671] }, "year:"]],
        ],
        [
          "star",
          { sourceInterval: [675, 685] },
          ["app", { sourceInterval: [675, 684] }, "spaceNoNL", []],
        ],
        ["app", { sourceInterval: [686, 699] }, "metaYearValue", []],
        ["app", { sourceInterval: [702, 709] }, "newline", []],
      ],
    ],
    metaSig: [
      "define",
      { sourceInterval: [712, 786] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [725, 786] },
        [
          "app",
          { sourceInterval: [725, 748] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [741, 747] }, "sig:"]],
        ],
        [
          "star",
          { sourceInterval: [752, 762] },
          ["app", { sourceInterval: [752, 761] }, "spaceNoNL", []],
        ],
        ["app", { sourceInterval: [763, 775] }, "metaSigValue", []],
        ["app", { sourceInterval: [779, 786] }, "newline", []],
      ],
    ],
    metaKey: [
      "define",
      { sourceInterval: [789, 863] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [802, 863] },
        [
          "app",
          { sourceInterval: [802, 825] },
          "caseInsensitive",
          [["terminal", { sourceInterval: [818, 824] }, "key:"]],
        ],
        [
          "star",
          { sourceInterval: [829, 839] },
          ["app", { sourceInterval: [829, 838] }, "spaceNoNL", []],
        ],
        ["app", { sourceInterval: [840, 852] }, "metaKeyValue", []],
        ["app", { sourceInterval: [856, 863] }, "newline", []],
      ],
    ],
    metaTitleValue: [
      "define",
      { sourceInterval: [867, 900] },
      null,
      [],
      [
        "plus",
        { sourceInterval: [885, 900] },
        [
          "seq",
          { sourceInterval: [886, 898] },
          [
            "not",
            { sourceInterval: [886, 894] },
            ["app", { sourceInterval: [887, 894] }, "newline", []],
          ],
          ["app", { sourceInterval: [895, 898] }, "any", []],
        ],
      ],
    ],
    metaArtistValue: [
      "define",
      { sourceInterval: [903, 936] },
      null,
      [],
      [
        "plus",
        { sourceInterval: [921, 936] },
        [
          "seq",
          { sourceInterval: [922, 934] },
          [
            "not",
            { sourceInterval: [922, 930] },
            ["app", { sourceInterval: [923, 930] }, "newline", []],
          ],
          ["app", { sourceInterval: [931, 934] }, "any", []],
        ],
      ],
    ],
    metaYearValue: [
      "define",
      { sourceInterval: [939, 972] },
      null,
      [],
      [
        "plus",
        { sourceInterval: [957, 972] },
        [
          "seq",
          { sourceInterval: [958, 970] },
          [
            "not",
            { sourceInterval: [958, 966] },
            ["app", { sourceInterval: [959, 966] }, "newline", []],
          ],
          ["app", { sourceInterval: [967, 970] }, "any", []],
        ],
      ],
    ],
    metaSigValue: [
      "define",
      { sourceInterval: [975, 1008] },
      null,
      [],
      [
        "plus",
        { sourceInterval: [993, 1008] },
        [
          "seq",
          { sourceInterval: [994, 1006] },
          [
            "not",
            { sourceInterval: [994, 1002] },
            ["app", { sourceInterval: [995, 1002] }, "newline", []],
          ],
          ["app", { sourceInterval: [1003, 1006] }, "any", []],
        ],
      ],
    ],
    metaKeyValue: [
      "define",
      { sourceInterval: [1011, 1044] },
      null,
      [],
      [
        "plus",
        { sourceInterval: [1029, 1044] },
        [
          "seq",
          { sourceInterval: [1030, 1042] },
          [
            "not",
            { sourceInterval: [1030, 1038] },
            ["app", { sourceInterval: [1031, 1038] }, "newline", []],
          ],
          ["app", { sourceInterval: [1039, 1042] }, "any", []],
        ],
      ],
    ],
    Barline: [
      "define",
      { sourceInterval: [1048, 1122] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1062, 1122] },
        ["app", { sourceInterval: [1064, 1082] }, "BarlineWithRepeats", []],
        ["app", { sourceInterval: [1089, 1102] }, "DoubleBarline", []],
        ["app", { sourceInterval: [1109, 1122] }, "SingleBarline", []],
      ],
    ],
    BarlineWithRepeats: [
      "define",
      { sourceInterval: [1126, 1269] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1151, 1269] },
        [
          "seq",
          { sourceInterval: [1153, 1208] },
          [
            "app",
            { sourceInterval: [1153, 1176] },
            "BarRepeatSignifierClose",
            [],
          ],
          [
            "alt",
            { sourceInterval: [1178, 1207] },
            ["app", { sourceInterval: [1178, 1191] }, "DoubleBarline", []],
            ["app", { sourceInterval: [1194, 1207] }, "SingleBarline", []],
          ],
        ],
        [
          "seq",
          { sourceInterval: [1215, 1269] },
          [
            "alt",
            { sourceInterval: [1216, 1245] },
            ["app", { sourceInterval: [1216, 1229] }, "DoubleBarline", []],
            ["app", { sourceInterval: [1232, 1245] }, "SingleBarline", []],
          ],
          [
            "app",
            { sourceInterval: [1247, 1269] },
            "BarRepeatSignifierOpen",
            [],
          ],
        ],
      ],
    ],
    BarRepeatSignifierOpen: [
      "define",
      { sourceInterval: [1273, 1332] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [1298, 1332] },
        [
          "opt",
          { sourceInterval: [1298, 1328] },
          [
            "seq",
            { sourceInterval: [1299, 1326] },
            ["app", { sourceInterval: [1299, 1304] }, "digit", []],
            [
              "opt",
              { sourceInterval: [1305, 1326] },
              [
                "app",
                { sourceInterval: [1305, 1325] },
                "caseInsensitive",
                [["terminal", { sourceInterval: [1321, 1324] }, "x"]],
              ],
            ],
          ],
        ],
        ["terminal", { sourceInterval: [1329, 1332] }, ":"],
      ],
    ],
    BarRepeatSignifierClose: [
      "define",
      { sourceInterval: [1335, 1395] },
      null,
      [],
      [
        "seq",
        { sourceInterval: [1361, 1395] },
        ["terminal", { sourceInterval: [1361, 1364] }, ":"],
        [
          "opt",
          { sourceInterval: [1365, 1395] },
          [
            "seq",
            { sourceInterval: [1366, 1393] },
            ["app", { sourceInterval: [1366, 1371] }, "digit", []],
            [
              "opt",
              { sourceInterval: [1372, 1393] },
              [
                "app",
                { sourceInterval: [1372, 1392] },
                "caseInsensitive",
                [["terminal", { sourceInterval: [1388, 1391] }, "x"]],
              ],
            ],
          ],
        ],
      ],
    ],
    DoubleBarline: [
      "define",
      { sourceInterval: [1399, 1419] },
      null,
      [],
      ["terminal", { sourceInterval: [1415, 1419] }, "||"],
    ],
    SingleBarline: [
      "define",
      { sourceInterval: [1422, 1441] },
      null,
      [],
      ["terminal", { sourceInterval: [1438, 1441] }, "|"],
    ],
    RepeatPreviousChord: [
      "define",
      { sourceInterval: [1445, 1507] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1471, 1507] },
        ["terminal", { sourceInterval: [1473, 1476] }, "-"],
        ["terminal", { sourceInterval: [1483, 1486] }, "%"],
        ["terminal", { sourceInterval: [1493, 1496] }, "/"],
        ["terminal", { sourceInterval: [1503, 1507] }, "𝄎"],
      ],
    ],
    Chord: [
      "define",
      { sourceInterval: [1511, 1549] },
      null,
      [],
      [
        "alt",
        { sourceInterval: [1519, 1549] },
        ["app", { sourceInterval: [1519, 1527] }, "ChordExp", []],
        ["app", { sourceInterval: [1530, 1549] }, "RepeatPreviousChord", []],
      ],
    ],
  },
]);
export default result;
