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
				const keyWords = Object.keys(completionText);
				for (let i = 0; i < keyWords.length; i++) {
					let keyWord = keyWords[i];
					if (linePrefix.endsWith(keyWord + '.')) {
						let methodList = completionText[keyWord];
						return methodList.map(method => new vscode.CompletionItem(method, vscode.CompletionItemKind.Method));
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
				if (keyWord in hoverText) {
					return new vscode.Hover(hoverText[keyWord]);
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