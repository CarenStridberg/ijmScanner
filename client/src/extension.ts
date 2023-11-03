import * as vscode from 'vscode';
import * as path from 'path';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

import { hoverText } from './hoverText';
import { completionText } from './completionText';
import { Console } from 'console';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	// infomation commands
	const ijmScannerAbout = vscode.commands.registerCommand('ijmScanner.about', () => {
		vscode.window.showInformationMessage('Syntax highlighting for imageJ macro lang.\n\nCreated by Lin & Autumn.');
	});
	const ijmScannerLicense = vscode.commands.registerCommand("ijmScanner.license", () => {
		vscode.window.showInformationMessage('Content is under the GPL License. All rights reserved.');
	});
	const ijmScannerFunction = vscode.commands.registerCommand("ijmScanner.function", () => {
		vscode.window.showInformationMessage('IjmScanner provides syntax highlighting and hovering text for ImageJ macro.');
	});
	context.subscriptions.push(ijmScannerAbout);
	context.subscriptions.push(ijmScannerLicense);
	context.subscriptions.push(ijmScannerFunction);

	// method completion
	const ijmScannerCompletionProvider = vscode.languages.registerCompletionItemProvider(
		'fiji',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const linePrefix = document.lineAt(position).text.slice(0, position.character);
				const keysForCompletion = Object.keys(completionText);
				for (let i = 0; i < keysForCompletion.length; i++) {
					const key = keysForCompletion[i];
					if (linePrefix.endsWith(key + '.') && position.character >= 2) {
						// to exclude things like "sString" or "sthIJ"
						let postionBefore = new vscode.Position(position.line, position.character - 2);
						if (key == document.getText(document.getWordRangeAtPosition(postionBefore))) {
							const methodList = completionText[key];
							return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
						}
					};
				}
				return undefined;
			}
		},
		'.' // triggered whenever a '.' is being typed
	);
	context.subscriptions.push(ijmScannerCompletionProvider);

	// hovering info
	const ijmScannerHoverProvider = vscode.languages.registerHoverProvider(
		'fiji',
		{
			provideHover(document: vscode.TextDocument, position: vscode.Position) {
				const keyWord = document.getText(document.getWordRangeAtPosition(position));
				if (/ijmScanner/i.test(keyWord)) {
					return new vscode.Hover(hoverText.ijmScanner);
				};

				// the Object.keys() static method returns an array of a given object's own enumerable string-keyed property names
				// we use it to prevent accidental access to properties, like macroToolIcon
				if (Object.keys(hoverText).includes(keyWord)) {
					return new vscode.Hover(hoverText[keyWord]);
				};

				const line = document.lineAt(position).text;
				// things like C059T3e16? in macro. only the first one in a line will have the hovering text!
				const matchMacroToolIcon = /macro (["']).*? - (.*?)\1/.exec(line);
				if (matchMacroToolIcon) {
					const startPosition = line.indexOf(matchMacroToolIcon[2]);
					const endPosition = startPosition + matchMacroToolIcon[2].length;
					if (position.character >= startPosition && position.character < endPosition) {
						return {
							contents: [hoverText.macroToolIcon],
							range: new vscode.Range(new vscode.Position(position.line, startPosition), new vscode.Position(position.line, endPosition))
						};
					}
				};
				// match "Action Tool" in macro declaration
				const matchMacroActionTool = /macro (["']).*?(Action Tool).*?\1/.exec(line);
				if (matchMacroActionTool) {
					const startPosition = line.indexOf(matchMacroActionTool[2]);
					const endPosition = startPosition + matchMacroActionTool[2].length;
					if (position.character >= startPosition && position.character < endPosition) {
						return {
							contents: [hoverText.macroActionTool],
							range: new vscode.Range(new vscode.Position(position.line, startPosition), new vscode.Position(position.line, endPosition))
						};
					}
				};
				return undefined;
			}
		}
	);
	context.subscriptions.push(ijmScannerHoverProvider);

	const ijmScannerColorProvider = vscode.languages.registerColorProvider(
		'fiji',
		{
			provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }, token: vscode.CancellationToken) {
				let R = (Math.ceil(color.red * 15 - 0.5)).toString(16);
				let G = (Math.ceil(color.green * 15 - 0.5)).toString(16);
				let B = (Math.ceil(color.blue * 15 - 0.5)).toString(16);

				return [new vscode.ColorPresentation(R + G + B)];
			},
			provideDocumentColors(document: vscode.TextDocument, token: vscode.CancellationToken) {
				let documentText = document.getText();
				let matches = documentText.matchAll(/macro (["']).*? - C(\w{3}).*?\1/g);
				let positionList = [];
				for (let match of matches) {
					if (match) {
						let startPosition = match.index + match[0].indexOf(match[2]);
						let endPosition = startPosition + match[2].length;
						let range = new vscode.Range(document.positionAt(startPosition), document.positionAt(endPosition));

						let R = parseInt("0x" + match[2][0].repeat(2));
						let G = parseInt("0x" + match[2][1].repeat(2));
						let B = parseInt("0x" + match[2][2].repeat(2));
						let color = new vscode.Color(R / 255, G / 255, B / 255, 1);

						positionList.push(new vscode.ColorInformation(range, color));
					}
				}
				return positionList;
			}
		}
	);
	context.subscriptions.push(ijmScannerColorProvider);

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