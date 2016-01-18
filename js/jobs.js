require([
  'js/jquery.js',
  'js/mustache.js',
  'js/lunr.js',
  'text!post.mustache',
  'text!posts.json'
], function (_, mustache, lunr, postTemplate, data) {
  var jobs = JSON.parse(data);

  var renderJobList = function (data) {
    $("#job-list")
      .empty()
      .append(mustache.to_html(postTemplate, {jobs: data}))
  };

  var idx = lunr(function () {
    this.ref('id');

    this.field('title', {boost: 10});
    this.field('location', {boost: 10});
    this.field('body');
  });

  jobs.forEach(function (question) {
    idx.add(question)
  });

  var debounce = function (fn) {
    var timeout;
    return function () {
      var args = Array.prototype.slice.call(arguments),
        ctx = this;

      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(ctx, args)
      }, 100)
    }
  };

  $('input').bind('keyup', debounce(function () {
    var query = $(this).val();

    if (query === "") {
      renderJobList(jobs);
      return;
    }

    if (query < 2) return;

    var results = idx.search(query).map(function (result) {
      return jobs.filter(function (q) {
        return q.id === parseInt(result.ref, 10)
      })[0]
    });

    renderJobList(results);
  }));


});