export type OscAnalyzer = AnalyserNode & {
	width: number;
	height: number;
	lineColor: string;
	lineThickness: number;
};

function WavyJones(context: AudioContext, element: string): OscAnalyzer {
	const analyser = <OscAnalyzer>context.createAnalyser();
	const elem = document.getElementById(element);

	analyser.width = elem ? elem.offsetWidth : 0;
	analyser.height = elem ? elem.offsetHeight : 0;
	analyser.lineColor = 'yellow';
	analyser.lineThickness = 5;

	const svgNamespace = 'http://www.w3.org/2000/svg';
	const paper = document.createElementNS(svgNamespace, 'svg');
	paper.setAttribute('width', analyser.width.toString());
	paper.setAttribute('height', analyser.height.toString());
	paper.setAttributeNS(
		'http://www.w3.org/2000/xmlns/',
		'xmlns:xlink',
		'http://www.w3.org/1999/xlink'
	);
	elem?.appendChild(paper);

	const oscLine = document.createElementNS(svgNamespace, 'path');
	oscLine.setAttribute('stroke', analyser.lineColor);
	oscLine.setAttribute('stroke-width', analyser.lineThickness.toString());
	oscLine.setAttribute('fill', 'none');
	paper.appendChild(oscLine);

	const noDataPoints = 10,
		freqData = new Uint8Array(analyser.frequencyBinCount);

	const drawLine = function () {
		analyser.getByteTimeDomainData(freqData);

		const graphPoints = [];
		let graphStr = '';

		graphPoints.push('M0, ' + analyser.height / 2);

		for (let i = 0; i < freqData.length; i++) {
			if (i % noDataPoints) {
				const point = (freqData[i] / 128) * (analyser.height / 2);
				graphPoints.push('L' + i + ', ' + point);
			}
		}

		for (let i = 0; i < graphPoints.length; i++) {
			graphStr += graphPoints[i];
		}

		oscLine.setAttribute('stroke', analyser.lineColor);
		oscLine.setAttribute('stroke-width', analyser.lineThickness.toString());

		oscLine.setAttribute('d', graphStr);

		setTimeout(drawLine, 100);
	};

	drawLine();

	return analyser;
}

export default WavyJones;
