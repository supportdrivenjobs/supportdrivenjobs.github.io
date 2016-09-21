require([
  'js/jquery.js',
  'js/handlebars.js',
  'js/lunr.js',
  'text!post.handlebars',
  'text!posts.json'
], function (_, handlebars, lunr, postTemplate, data) {
  var jobs = JSON.parse(data);
  var template = handlebars.compile(postTemplate);

  var renderJobList = function (data) {
    $("#job-list")
      .empty()
      .append(template( {jobs: data}));
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