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
				const keysForCompletion = Object.keys(completionText);
				for (let i = 0; i < keysForCompletion.length; i++) {
					const key = keysForCompletion[i];
					if (linePrefix.endsWith(key + '.')) {
						if (position.character < 2) {
							return undefined;
						}
						// to exclude things like sString or sthIJ
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
				
				// things like C059T3e16? in macro
				const line = document.lineAt(position).text;
				const match = /macro (["']).*? - (.*?)\1/.exec(line);
				if (match) {
					const startPosition = line.indexOf(match[2]);
					const endPosition = startPosition + match[2].length;
					if (position.character >= startPosition && position.character < endPosition) {
						return {
							contents: [hoverText.macroToolIcon],
							range: new vscode.Range(new vscode.Position(position.line, startPosition), new vscode.Position(position.line, endPosition))
						};
					}
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