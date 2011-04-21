




(function($){

  var C = console || {info:function(){}, log:function(){}};

  $.hashbangParseURL = function(uri){
    function parseQueryString(string, name) {
      string = string || '';
      var queryString = {};
      string.replace(
          new RegExp("([^?=&]+)(=([^&]*))?", "g"),
          function($0, $1, $2, $3) { queryString[$1] = $3; }
      );
      if (!name) {
        return queryString;
      }
      return queryString[name];
    }
    if (typeof uri == 'undefined') {
      uri = location.href;
    }
    else if (uri[0] == '/'){
      uri = location.host + uri;
    }
    var url = uri.match(/^([^:]*:\/\/)?([^:]*:[^@]*@)?([^\/:]*\.[^\/:]*)?(:[^\/]*)?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i);
    delete url.input;
    var url = {
      protocol:   ((url[1]) ? url[1] : 'http://').split('://')[0],
      user:       (url[2]) ? url[2].split(':')[0] : undefined,
      password:   (url[2]) ? url[2].split(':')[1].split('@')[0] : undefined,
      host:       (url[3]) ? url[3] : location.host,
      port:       (url[4]) ? (
                                isNaN(parseInt(url[4].split(':')[1]))) ? 80 : parseInt(url[4].split(':')[1]
                              ) : 80,
      path:       (url[5]) ? url[5] : '/',
      search:     (url[6]) ? url[6].split('?')[1] : undefined,
      fragment:   (url[7]) ? url[7].split('#')[1] : undefined
    };
    
    url.hostname = url.host;
    url.pathname = url.path;
    url.hash = url.fragment;
    url.query = url.search;
    url.href = ''
        + url.protocol + '://'
        + ((url.user)?url.user+':'+url.password+'@':'')
        + url.host
        + ((url.port != 80)?':'+url.port:'')
        + url.path
        + ((url.search)?'?'+url.search:'')
        + ((url.fragment)?'#'+url.fragment:'');
    
    url.queryObj = parseQueryString(url.query);
    
    url.hashBang = url.queryObj['_escaped_fragment_'] ? parseQueryString(url.queryObj['_escaped_fragment_']) : (
      url.hash && url.hash.substr(0, 1) == '!' ? parseQueryString(url.hash.substr(1)) : undefined
    );
    url.hashBang = url.hashBang || {};
    
    return url;
  };
  
  
  
  
  
  Drupal.hashbang = Drupal.hashbang || {};
  Drupal.hashbang.behaviors = Drupal.hashbang.behaviors || {};
  Drupal.hashbang.attachBehaviors = function(context, params) {
    context = context || document;
    params = params || $.hashbangParseURL().hashBang;
    jQuery.each(Drupal.hashbang.behaviors, function() {
      this(context, params, Drupal.settings);
    });
  };
  
  
  $(window).bind( 'hashchange', function(e) {
    var hb = $.hashbangParseURL();
    Drupal.hashbang.attachBehaviors();
  });
  
  
  Drupal.behaviors.hashbangProcess = function(context) {
    $('a[href*=_escaped_fragment_]', context).each(function(){
      var $a = $(this);
      var url = ''+ $a.attr('href');
      url = url.split('?_escaped_fragment_=').join('#!');
      $a.attr('href', url);
    });
  };
  
  $(function(){
    $(window).trigger('hashchange');
  });
  
})(jQuery);