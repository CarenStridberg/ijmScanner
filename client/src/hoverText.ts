export const hoverText = {
	// meta info
	ijmScanner: 'Syntax highlighting for imageJ macro lang.\n\nCreated by Lin & Autumn.\n\nContent is under the GPL License. All rights reserved.',

	// classes
	Array: '**Array Function**\n\nThese functions operate on arrays. They are available in ImageJ 1.42j or later.',
	Dialog: '**Dialog Functions**\n\nThese functions operate on dialogs.',
	Ext: '**Ext Functions**\n\nThese are functions that have been added to the macro language by plugins using the MacroExtension interface. The Image5D_Extensions plugin, for example, adds functions that work with Image5D. The Serial Macro Extensions plugin adds functions, such as Ext.open("COM8",9600,"") and Ext.write("a"), that talk to serial devices.',
	File: '**File Functions**\n\nThese functions allow you to get information about a file, read or write a text file, create a directory, or to delete, rename or move a file or directory.',
	Fit: '**Fit Functions**\n\nThese functions do curve fitting. Requires 1.41k.',
	IJ: '**IJ Functions**\n\nThese functions provide access to miscellaneous methods in ImageJ\'s IJ class. Requires 1.43l.',
	List: '**List Functions**\n\nThese functions work with a list of key/value pairs. Requires 1.41f.',
	Overlay: '**Overlay Functions**\n\nUse these functions to create and manage non-destructive graphic overlays. Requires v1.44e.',
	Plot: '**Plot Functions**\n\nThese functions create "plot" windows. Plots can be created, data series added, and properties can be set for each series.',
	Stack: '**Stack Functions**\n\nThese functions allow you to get and set the position (channel, slice and frame) of a hyperstack (a 4D or 5D	stack).',
	String: '**String Functions**\n\nThese functions do string buffering and copy strings to and from the system clipboard.',

	// keywords
	macro: 'A macro is a simple program that automates a series of ImageJ commands.',
	macroToolIcon: 'Tool macro icons are defined using a simple and compact instruction set consisting of a one letter commands	followed by two or more lower case hex digits.\n\n* **Crgb:** set color;\n\n* **Bxy:** set base location (default is (0,0));\n\n* **Rxywh:** draw rectangle;\n\n* **Fxywh:** draw filled rectangle;\n\n* **Oxywh**: draw oval;\n\n* **oxywh**: draw filled oval;\n\n* **Lxyxy**: draw line;\n\n* **Dxy**: draw dot (1.32g or later);\n\n* **Pxyxy...xy0**: draw polyline;\n\n* **Txyssc**: draw character;',
	macroActionTool: 'Tool macros with names ending in "Action Tool" perform an action when you click on their icon in the toolbar.',
	function: 'A function is a callable block of code that can be passed values and can return a value.',
	var: 'Global variables should be declared before the macros that use them using the \'var\' statement.\n\nThe \'var\' statement should not be used inside macro or function code blocks. Using \'var\' in a macro or function may cause it to fail.',
};

Object.defineProperty(hoverText, "macroToolIcon", { enumerable: false });
Object.defineProperty(hoverText, "macroActionTool", { enumerable: false });