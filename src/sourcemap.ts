import { SourceMapGenerator, RawSourceMap } from "source-map";
const splitRE = /\r?\n/g;
const emptyRE = /^(?:\/\/)?\s*$/;

export function generateSourceMap(
	filename: string,
	source: string,
	generated: string
): RawSourceMap {
	const map = new SourceMapGenerator({
		file: filename.replace(/\\/g, "/"),
		sourceRoot: "",
	});
	map.setSourceContent(filename, source);

	const contentLineMap = new Map<string, number>();
	let countSR = 0,
		countGE = 0,
		prevGE = "";
	const generatedArr = generated.split(splitRE);

	for (let i = 0, len = generatedArr.length; i < len; i++) {
		if (!emptyRE.test(generatedArr[i])) prevGE = generatedArr[i];
		else break;
	}
	source.split(splitRE).map((line, index) => {
		if (!emptyRE.test(line)) {
			if (!contentLineMap.has(line)) {
				countSR = 0;
				contentLineMap.set(line, index + 1);
			} else {
				contentLineMap.set(line + countSR++, index + 1);
			}
		}
	});

	generatedArr.forEach((line, index) => {
		if (!emptyRE.test(line)) {
			let originalLine = index + 1;
			if (prevGE === line) {
				originalLine = contentLineMap.get(line + countGE++) || originalLine;
			} else {
				countGE = 0;
				originalLine = contentLineMap.get(line) || originalLine;
			}

			prevGE = line;
			const generatedLine = index + 1;
			for (let i = 0; i < line.length; i++) {
				if (!/\s/.test(line[i])) {
					map.addMapping({
						source: filename,
						original: {
							line: originalLine,
							column: i,
						},
						generated: {
							line: generatedLine,
							column: i,
						},
					});
				}
			}
		}
	});

	return JSON.parse(map.toString());
}
