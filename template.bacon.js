bacon.template = {};

bacon.template.autoEscape = true;
bacon.template.stringIfInvalid = '';

/**
 * Parses a Django template using the provided data.
 *
 * @param string template The template, or the location to the template.
 * @param object data The data to pass to the parser.
 * @param function callback The function to pass the data to.
 */
bacon.template.parse = function(template, data, callback) {
	template = bacon.template._lexer(template);
	template = bacon.template._parser(template);

	for (var endString = '', i = 0; i < template.length; i++) {
		endString += template[i].parse(data);
	}

	if (typeof callback === 'function') {
		callback(endString, data);
	}
};

var TEXT = 0, VARIABLE = 1, TAG = 2;
bacon.template._lexer = function(template) {
	var end = [];
	template = template.split(/(\{\# [^(\#\})]+ \#\}|\{\{ [a-zA-Z0-9_\.\|]+ \}\}|\{% [^\{\}]+ %\})/g);
	for (var i = 0; i < template.length; i++) {
		if (template[i].indexOf('{%') === 0) {
			end.push([TAG, template[i].slice(3, -3)]);
		} else if (template[i].indexOf('{{') === 0) {
			end.push([VARIABLE, template[i].slice(3, -3)]);
		} else if (template[i].indexOf('{#') !== 0) {
			end.push([TEXT, template[i]]);
		}
	}
	return end;
};
bacon.template._parser = function(template, nested) {

	var parseItem = function(item, i) {
		switch (item[0]) {
			case TEXT:
				return new BaconTextNode(item[1]);

			case VARIABLE:
				item = item[1].split('|');
				return new BaconVarNode(item[0], item.slice(1));

			case TAG:
				var name = (item[1].indexOf(' ') < 0) ? item[1] : item[1].split(' ')[0];
				var code = (item[1].indexOf(' ') < 0) ? null : item[1].split(' ').slice(1).join(' ');

				if (name.indexOf('end') === 0) {
					return false;
				}

				var contents = bacon.template._parser(template.slice(i + 1), true);
				template.splice(i + 1, contents[1] + 1);
				contents = contents[0];

				return new BaconTagNode(name, code, contents);
		}
	};

	var end = [], i, item;
	for (i = 0; i < template.length; i++) {
		item = parseItem(template[i], i);
		if (item === false) {
			break;
		}
		end.push(item);
	}
	if (typeof nested === 'undefined' || !nested) {
		return end;
	} else {
		return [end, i];
	}
}

function BaconTextNode(text) {
	this.text = text;
}
BaconTextNode.prototype.parse = function() {
	return this.text;
}

function BaconVarNode(name, filters) {
	this.name = name;
	this.filters = filters;
}
BaconVarNode.prototype.parse = function(data) {
	return bacon.template._getVariable(this.name, this.filters, data);
};

function BaconTagNode(name, code, contents) {
	this.name = name;
	this.code = code;
	this.contents = contents;
}
BaconTagNode.prototype.parse = function(data) {
	if (typeof bacon.template.tags[this.name] === 'function') {
		return bacon.template.tags[this.name].call(null, this.code, this.contents, data);
	}
	return '';
};

bacon.template._getVariable = function(name, filters, data) {
	if (name.indexOf('.') < 0) {
		var output = (typeof data[name] === 'undefined') ? bacon.template.stringIfInvalid : data[name];
	} else {
		var splitName = name.split('.');
		var output = data[splitName[0]];
		for (var i = 1; i < splitName.length; i++) {
			if (typeof output !== 'object' || typeof output[splitName[i]] === 'undefined') {
				output = bacon.template.stringIfInvalid;
				break;
			}
			output = output[splitName[i]];
		}
		delete i;
	}

	if (typeof output === 'function') {
		output = output.call(null, data);
	}

	for (var e = false, i = 0; i < filters.length; i++) {
		if (typeof bacon.template.filters[filters[i]] === 'function') {
			output = bacon.template.filters[filters[i]].call(null, output);

			if (filters[i] === 'escape' || filters[i] === 'safe') {
				e = true;
			}
		}
	}

	if (bacon.template.autoEscape === true && !e) {
		output = bacon.template.filters.escape(output);
	}
	return output;
};

bacon.template._isTrue = function(code, data) {
	if (code.indexOf(' or ') !== -1) {
		code = code.split(' or ');
		for (var e = false, i = 0; i < code.length; i++) {
			if (bacon.template._isTrue(code[i], data)) {
				e = true;
			}
		}
		return e;
	}

	if (code.indexOf(' and ') !== -1) {
		code = code.split(' and ');
		for (var e = true, i = 0; i < code.length; i++) {
			if (!bacon.template._isTrue(code[i], data)) {
				e = false;
			}
		}
		return e;
	}

	var not = (code.indexOf('not ') === 0), res;

	if (not) {
		code = code.slice(4);
	}

	if (code.indexOf(' ') < 0 && code.indexOf('|') < 0) {
		res = bacon.template._getVariable(code, false, data);
	} else if (code.indexOf(' ') < 0) {
		code = code.split('|');
		res = bacon.template._getVariable(code[0], code.slice('1'), data);
	} else {
		code = code.split(' ');
		code[0] = bacon.template._getVariable(code[0], code.slice('1'), data);
		switch (code[1]) {
			case '==':
				res = code[0] == code[2];
				break;

			case '!==':
				res = code[0] != code[2];
				break;

			case '<':
				res = code[0] < code[2];
				break;

			case '>':
				res = code[0] > code[2];
				break;

			case '<=':
				res = code[0] <= code[2];
				break;

			case '>=':
				res = code[0] >= code[2];
				break;

			default:
				var error = new TypeError('Invalid operator');
				error.type = 'invalid_operator';
				throw error;
		}
	}

	return (not) ? !res : res;
}

bacon.template.filters = {};
bacon.template.filters.escape = function(input) {
	if (typeof input !== 'string') {
		return input;
	}
	return input.replace(/&/g, '&amp;')
		.replace(/\</g, '&lt;')
		.replace(/\>/g, '&gt;')
		.replace(/'/g, '&#39;')
		.replace(/"/g, '&quot;');
};

bacon.template.filters.safe = function(input) {
	return input;
}


bacon.template.tags = {};
bacon.template.tags.if = function(code, contents, data) {
	if (bacon.template._isTrue(code, data)) {
		for (var endString = '', i = 0; i < contents.length; i++) {
			endString += contents[i].parse(data);
		}
		return endString;
	}
	return '';
};

bacon.template.tags.for = function(code, contents, data) {
	code = code.split(' ');
	code[2] = code[2].split('|');
	code[2] = bacon.template._getVariable(code[2][0], code[2].slice(1), data);

	for (var endString = '', i = 0, j; i < code[2].length; i++) {
		data[code[0]] = code[2][i];
		for (j = 0; j < contents.length; j++) {
			endString += contents[j].parse(data);
		}
	}
	return endString;
};

bacon.template.tags.comment = function(code, contents, data) {
	return '';
};
