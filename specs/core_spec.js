$.describe('Core tests', function() {
	$.it('should return correctly', function(done) {
		bacon.template.parse('', {}, function(res) {
			$.expect(res).toEqual('');
			done();
		});
	}, true);

	$.it('should parse text correctly', function(done) {
		bacon.template.parse('hello', {}, function(res) {
			$.expect(res).toEqual('hello');
			done();
		});
	}, true);

	$.it('should parse variables correctly', function(done) {
		bacon.template.parse('{{ test }}', {test: 'hello'}, function(res) {
			$.expect(res).toEqual('hello');
			done();
		});
	}, true);

	$.it('should parse tags correctly', function(done) {
		bacon.template.parse('{% comment %}This is a test. hello world.{% endcomment %}', {}, function(res) {
			$.expect(res).toEqual('');
			done();
		});
	}, true);

	$.it('should parse comments correctly', function(done) {
		bacon.template.parse('tes{# this is a comment #}t', {}, function(res) {
			$.expect(res).toEqual('test');
			done();
		});
	}, true);

	$.it('should parse combinations correctly', function(done) {
		bacon.template.parse('{% comment %}This is a test{% endcomment %}test', {}, function(res) {
			$.expect(res).toEqual('test');
			done();
		});
	}, true);

	$.it('should use ._isTrue correctly', function() {
		var data = {
			t: true,
			f: false,
			one: 1,
			five: 5
		}
		var isT = bacon.template._isTrue;
		$.expect(isT('t', data)).toEqual(true);
		$.expect(isT('not t', data)).toEqual(false);
		$.expect(isT('f', data)).toEqual(false);
		$.expect(isT('not f', data)).toEqual(true);
		$.expect(isT('t and t', data)).toEqual(true);
		$.expect(isT('t and f', data)).toEqual(false);
		$.expect(isT('f and f', data)).toEqual(false);
		$.expect(isT('t or t', data)).toEqual(true);
		$.expect(isT('t or f', data)).toEqual(true);
		$.expect(isT('f or f', data)).toEqual(false);
		$.expect(isT('t and f or t', data)).toEqual(true);
		$.expect(isT('t and t or f', data)).toEqual(true);
		$.expect(isT('f and t or f', data)).toEqual(false);
		$.expect(isT('one < 2', data)).toEqual(true);
		$.expect(isT('one < 2 and t', data)).toEqual(true);
		$.expect(isT('one < 2 and f', data)).toEqual(false);
		$.expect(isT('five < 2', data)).toEqual(false);
		$.expect(isT('one > 2', data)).toEqual(false);
		$.expect(isT('one == 2', data)).toEqual(false);
		$.expect(isT('one == 1', data)).toEqual(true);
		$.expect(isT('one !== 2', data)).toEqual(true);
		$.expect(isT('one !== 1', data)).toEqual(false);
	});

	$.it('should get variables correctly', function() {
		var data = {
			t: true,
			f: false,
			o: {
				t: true,
				s: 'hi'
			},
			s: 'h"l'
		};
		var g = bacon.template._getVariable;

		$.expect(g('t', false, data)).toEqual(true);
		$.expect(g('f', false, data)).toEqual(false);
		$.expect(g('o.s', false, data)).toEqual('hi');
		$.expect(g('blalba', false, data)).toEqual('');
		$.expect(g('s', false, data)).toEqual('h&quot;l');
		$.expect(g('s', ['escape'], data)).toEqual('h&quot;l');
		$.expect(g('s', ['safe'], data)).toEqual('h"l');
		$.expect(g('"hi"', {})).toEqual('hi');
		$.expect(g('5', {})).toEqual(5);
	});

	$.it('should use filters with params correctly', function() {
		var g = bacon.template._getVariable;
		$.expect(g('', ['default_if_none:"test"'], {})).toEqual('test');
		$.expect(g('', ['default_if_none:a'], {a:'b'})).toEqual('b');
	});
});
