import * as vscode from 'vscode';
import * as path from 'path';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

import { hoverText } from './hoverText';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	// infomation commands
	const ijmScannerAbout = vscode.commands.registerCommand('ijmScanner.about', () => {
		vscode.window.showInformationMessage('Syntax highlighting for imageJ macro lang.\n\nCreated by Lin & Autumn.');
	});
	const ijmScannerLicense = vscode.commands.registerCommand("ijmScanner.license", () => {
		vscode.window.showInformationMessage('Content is under the GPL License. All rights reserved.');
	});
	context.subscriptions.push(ijmScannerAbout);
	context.subscriptions.push(ijmScannerLicense);

	// method completion
	const ijmScannerCompletionProvider = vscode.languages.registerCompletionItemProvider(
		'fiji',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const linePrefix = document.lineAt(position).text.slice(0, position.character);
				if (linePrefix.endsWith('Array.')) {
					const methodList = ['copy', 'fill', 'getStatistics', 'invert', 'sort', 'trim', 'concat', 'slice', 'print', 'reverse', 'rankPositions'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('Dialog.')) {
					const methodList = ['create', 'addMessage', 'addString', 'addNumber', 'addCheckbox', 'addChoice', 'addSlider', 'show', 'getString',
						'getNumber', 'getCheckbox', 'getChoice'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('File.')) {
					const methodList = ['append', 'close', 'dateLastModified', 'delete', 'directory', 'exists', 'getName', 'getParent', 'isDirectory',
						'lastModified', 'length', 'makeDirectory', 'name', 'nameWithoutExtension', 'open', 'openAsString', 'openAsRawString', 'openAsRawString',
						'openUrlAsString', 'openDialog', 'rename', 'saveString', 'separator'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('Fit.')) {
					const methodList = ['doFit', 'rSquared', 'p', 'nParams', 'f', 'nEquations', 'getEquation', 'plot', 'logResults', 'showDialog'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('IJ.')) {
					const methodList = ['deleteRows', 'getToolName', 'freeMemory', 'currentMemory', 'maxMemory', 'pad', 'redirectErrorMessages', 'renameResults'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('List.')) {
					const methodList = ['set', 'get', 'getValue', 'size', 'clear', 'setList', 'getList', 'setMeasurements', 'setCommands'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('Overlay.')) {
					const methodList = ['moveTo', 'lineTo', 'drawLine', 'add', 'setPosition', 'drawRect', 'drawEllipse', 'drawString', 'show', 'hide',
						'remove', 'size', 'removeSelection', 'copy', 'paste'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('Plot.')) {
					const methodList = ['create', 'setLimits', 'setLineWidth', 'setColor', 'add', 'addText', 'setJustification', 'drawLine', 'show', 'update',
						'getValues', 'setFrameSize'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('Stack.')) {
					const methodList = ['isHyperstack', 'getDimensions', 'setDimensions', 'setChannel', 'setSlice', 'setFrame', 'getPosition', 'setPosition',
						'getFrameRate', 'setFrameRate', 'getFrameInterval', 'setFrameInterval', 'getUnits', 'setTUnit', 'setZUnit', 'setDisplayMode', 'getDisplayMode',
						'setActiveChannels', 'getActiveChannels', 'swap', 'getStatistics'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				if (linePrefix.endsWith('String.')) {
					const methodList = ['resetBuffer', 'append', 'buffer', 'copy', 'copyResults', 'paste'];
					return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
				};
				return undefined;
			}
		},
		'.' // triggered whenever a '.' is being typed
	);
	context.subscriptions.push(ijmScannerCompletionProvider);

	// hover info
	const ijmScannerHoverProvider = vscode.languages.registerHoverProvider(
		'fiji',
		{
			provideHover(document: vscode.TextDocument, position: vscode.Position) {
				const word = document.getText(document.getWordRangeAtPosition(position));
				if (/ijmScanner/i.test(word)) {
					return new vscode.Hover(`Syntax highlighting for imageJ macro lang.\n\nCreated by Lin & Autumn.\n\nContent is under the GPL License. All rights reserved.`);
				};
				if (word == 'Array') {
					return new vscode.Hover(hoverText.Array);
				};
				return undefined;
			}
		}
	);
	context.subscriptions.push(ijmScannerHoverProvider);

	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		}
	};
	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'fiji' }],
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};
	client = new LanguageClient(
		'ijmScannerLanguageServer',
		'ijm Scanner Language Server',
		serverOptions,
		clientOptions
	);
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}