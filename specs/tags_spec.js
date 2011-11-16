$.describe('Tag tests', function() {
	$.it('should use comments correctly', function(done) {
		bacon.template.parse('hello {% comment %} comment!{% endcomment %}world!', {}, function(res) {
			$.expect(res).toEqual('hello world!');
			done();
		});
	}, true);

	$.it('should use if tags correctly', function(done) {
		var html = '{% if t %}a{% endif %}{% if not t %}b{% endif %}{% if f %}c{% endif %}{% if not f %}d{% endif %}';
		bacon.template.parse(html, {t:true, f:false}, function(res) {
			$.expect(res).toEqual('ad');
			done();
		});
	}, true);

	$.it('should use for tags correctly', function(done) {
		var html = '{% for i in a %}:{{ i.t }}{% endfor %}';
		bacon.template.parse(html, {a:[{t:'a'},{t:'b'},{t:'c'},{t:'d'}]}, function(res) {
			$.expect(res).toEqual(':a:b:c:d');
			done();
		});
	}, true);
});
