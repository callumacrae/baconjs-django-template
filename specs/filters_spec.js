$.describe('filter tests', function() {
	var data = {
		s: 'ab<b>lol'
	};

	$.it('should use escape properly', function(done) {
		var p = bacon.template.parse;
		bacon.template.parse('{{ s|escape }}', data, function(res) {
			$.expect(res).toEqual('ab&lt;b&gt;lol');
			done();
		});
	});

	$.it('should use safe properly', function(done) {
		bacon.template.parse('{{ s|safe }}', data, function(res) {
			$.expect(res).toEqual('ab<b>lol');
			done();
		});
	});

	$.it('should use addslashes properly', function(done) {
		bacon.template.parse('{{ s|safe|addslashes }}', {s:'h"i"\''}, function(res) {
			$.expect(res).toEqual('h\\"i\\"\\\'');
			done();
		});
	});
});
