const justFriends = `
Just Friends
C
| CM7 | CM7 | Cm7 | F7 | GM7 | GM7 | Bbm7 | Eb7 || Abm7 | D7 | Bm7 | Em7 | A7 | A7 | Am7 | D7 Db7 ||
`;
function parse(fileBuffer) {
    let lines = fileBuffer.trim().split(/\n+/);
    const title = lines[0];
    const key = lines[1];
    const bars = lines[2]
        .split(/\|+/)
        .map((str) => str.trim())
        .filter((str) => !!str)
        .map((str) => ({ chords: str.split(/\s+/), barType: "|" }));
    const song = {
        title,
        key,
        bars,
    };
    return song;
}
function bootstrap() {
    const song = parse(justFriends);
    document.querySelector(".title-container .title").textContent = song.title;
    document.querySelector(".title-container .key").textContent = song.key;
    song.bars.map((bar) => {
        const chords = bar.chords.map((c) => `<div class="chord">${c}</div>`);
        const html = `<div class="bar">
      <div class="chords">
        ${chords.join("")}
      </div>
      <div class="staff"></div>
    </div>`;
        document.querySelector(".song").insertAdjacentHTML("beforeend", html);
    });
    document
        .querySelector("#transpose-up")
        .addEventListener("click", transposeSong.bind(null, 1));
    document
        .querySelector("#transpose-down")
        .addEventListener("click", transposeSong.bind(null, -1));
}
const keysToDegrees = new Map([
    ["A", 0],
    ["A#", 1],
    ["Bb", 1],
    ["B", 2],
    ["B#", 3],
    ["Cb", 2],
    ["C", 3],
    ["C#", 4],
    ["Db", 4],
    ["D", 5],
    ["D#", 6],
    ["Eb", 6],
    ["E", 7],
    ["E#", 8],
    ["F", 8],
    ["F#", 9],
    ["Gb", 9],
    ["G", 10],
    ["G#", 11],
    ["Ab", 11],
]);
const degreesToKeys = [
    "A",
    "Bb",
    "B",
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab", // 11
];
function transpose(key, halfSteps) {
    const currentDegree = keysToDegrees.get(key);
    let newDegree = (currentDegree + halfSteps) % degreesToKeys.length;
    if (newDegree < 0) {
        newDegree = degreesToKeys.length + newDegree;
    }
    return degreesToKeys[newDegree];
}
function transposeSong(halfSteps) {
    const songKey = document.querySelector(".title-container .key");
    songKey.textContent = transpose(songKey.textContent.trim(), halfSteps);
    Array(...document.querySelectorAll(".bar")).forEach((e) => {
        Array(...e.querySelectorAll(".chord")).forEach((e2) => {
            const current = e2.textContent.trim();
            if (!!current) {
                const matches = current.match(/([A-G](?:b|#)?)(.*)/);
                if (matches && matches[1]) {
                    const root = matches[1];
                    const kind = matches[2];
                    const newRoot = transpose(root, halfSteps);
                    e2.textContent = `${newRoot}${kind}`;
                }
            }
        });
    });
}
