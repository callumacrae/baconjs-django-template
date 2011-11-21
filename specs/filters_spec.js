$.describe('filter tests', function() {
	var data = {
		a: 'hello',
		ar: ['a', 'b', 'c'],
		s: 'ab<b>lol'
	};

	$.it('should use escape properly', function(done) {
		var p = bacon.template.parse;
		bacon.template.parse('{{ s|escape }}', data, function(res) {
			$.expect(res).toEqual('ab&lt;b&gt;lol');
			done();
		});
	}, true);

	$.it('should use safe properly', function(done) {
		bacon.template.parse('{{ s|safe }}', data, function(res) {
			$.expect(res).toEqual('ab<b>lol');
			done();
		});
	}, true);

	$.it('should use addslashes properly', function(done) {
		bacon.template.parse('{{ s|safe|addslashes }}', {s:'h"i"\''}, function(res) {
			$.expect(res).toEqual('h\\"i\\"\\\'');
			done();
		});
	}, true);

	$.it('should capfirst correctly', function(done) {
		bacon.template.parse('{{ a|capfirst }}', data, function(res) {
			$.expect(res).toEqual('Hello');
			done();
		});
	}, true);

	$.it('should use .first correctly', function(done) {
		bacon.template.parse('{{ ar|first }}', data, function(res) {
			$.expect(res).toEqual('a');
			done();
		});
	}, true);

	$.it('should use .default_if_none', function(done) {
		bacon.template.parse('{{ a|default_if_none:"test" }}', {a: ''}, function(res) {
			$.expect(res).toEqual('test');
			done();
		});
	}, true);

	$.it('should use dictsort correctly', function(done) {
		bacon.template.parse('{{ a|dictsort:"b" }}', {a:[{b:'b'}, {b:'d'}, {b:'a'}]}, function(res) {
			$.expect(res).toEqual('[{"b":"a"},{"b":"b"},{"b":"d"}]');
			done();
		});
	}, true);

	$.it('should use dictsortreversed correctly', function(done) {
		bacon.template.parse('{{ a|dictsortreversed:"b" }}', {a:[{b:'b'}, {b:'d'}, {b:'a'}]}, function(res) {
			$.expect(res).toEqual('[{"b":"d"},{"b":"b"},{"b":"a"}]');
			done();
		});
	}, true);

	$.it('should use divisibleby correctly', function(done) {
		bacon.template.parse('{{ a|divisibleby:3 }}', {a:6}, function(res) {
			$.expect(res).toEqual('true');
			bacon.template.parse('{{ a|divisibleby:4 }}', {a:6}, function(res) {
				$.expect(res).toEqual('false');
				done();
			});
		});
	}, true);

	$.it('should use fix_ampersands correctly', function(done) {
		bacon.template.parse('{{ a|safe|fix_ampersands }}', {a:"1 & 2"}, function(res) {
			$.expect(res).toEqual('1 &amp; 2');
			bacon.template.parse('{{ a|safe|fix_ampersands }}', {a:"1 &amp; 2"}, function(res) {
				$.expect(res).toEqual('1 &amp; 2');
				done();
			});
		});
	}, true);

	$.it('should use float_format correctly', function(done) {
		bacon.template.parse('{{ a|float_format }} {{ b|float_format }} {{ a|float_format:2 }} {{ a|float_format:-2 }}', {a: 3.10, b:2.0}, function(res) {
			$.expect(res).toEqual('3.1 2.0 3.1 3.10');
			done();
		});
	}, true);
});
