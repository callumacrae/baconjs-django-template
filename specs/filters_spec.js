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
});
