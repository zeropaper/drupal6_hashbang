(function($) {
  
  var C = typeof console != 'undefined' ? console : {
    info : function() {
    },
    log : function() {
    },
    warn : function() {
    },
    debug : function() {
    }
  }
  ,rbracket = /\[\]$/
  ,r20 = /%20/g
  ,ESCAPED_FRAGMENT = 'hbnojs'
  ;
  $(document).ready(function(){
    $content = $('#content');
    $main = $('#main');
    $b = $('body');
    ESCAPED_FRAGMENT = Drupal.settings.hashbang.ESCAPED_FRAGMENT;
  });
  
  
  $.hashbangParseURL = function(uri) {
    if (typeof uri == 'undefined') {
      uri = location.href;
    }
    else if (uri[0] == '/') {
      uri = location.host + uri;
    }
    var url = uri
        .match(/^([^:]*:\/\/)?([^:]*:[^@]*@)?([^\/:]*\.[^\/:]*)?(:[^\/]*)?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i);
    if (!url) {
      // //C.log('url is %o with uri %s', url, uri);
      return false;
    }
    //delete url.input;
    
    
    
    var url = {
      protocol : ((url[1]) ? url[1] : 'http://').split('://')[0],
      user : (url[2]) ? url[2].split(':')[0] : undefined,
      password : (url[2]) ? url[2].split(':')[1].split('@')[0] : undefined,
      host : (url[3]) ? url[3] : location.host,
      port : (url[4]) ? (isNaN(parseInt(url[4].split(':')[1]))) ? 80
          : parseInt(url[4].split(':')[1]) : 80,
      path : (url[5]) ? url[5] : '/',
      search : (url[6]) ? url[6].split('?')[1] : undefined,
      fragment : (url[7]) ? url[7].split('#')[1] : undefined
    };
    
    function params( a, traditional ) {
      var s = [],
        add = function( key, value ) {
          // If value is a function, invoke it and return its value
          value = $.isFunction( value ) ? value() : value;
          s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
        };
  
      // Set traditional to true for $ <= 1.3.2 behavior.
      if ( traditional === undefined ) {
        traditional = $.ajaxSettings.traditional;
      }
  
      // If an array was passed in, assume that it is an array of form elements.
      if ( $.isArray( a ) || ( a.jquery && !$.isPlainObject( a ) ) ) {
        // Serialize the form elements
        $.each( a, function() {
          add( this.name, this.value );
        } );
  
      } else {
        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        for ( var prefix in a ) {
          buildParams( prefix, a[ prefix ], traditional, add );
        }
      }
  
      // Return the resulting serialization
      return s.join( "&" ).replace( r20, "+" );
    }
    
    
    
    
    url.setQuery = function(key, value) {
      C.info('Setting query %s to %o', key, value);
      this.queryObj[key] = value;
      if (typeof value == 'undefined' || value == null) {
        C.info('Deleting %s', key);
        delete this.queryObj[key];
      }
      
      C.info(this.queryObj);
      this.query = params(this.queryObj);
      this.query = this.search;
      this.build();
      return this;
    };
    
    url.setHashbang = function() {
      C.info('Setting hashbang %s to %o', key, value);
      this.hashBang[key] = value;
      if (typeof value == 'undefined' || value == null) {
        C.info('Deleting %s', key);
        delete this.hashBang[key];
      }
      
      
      this.hash = params(this.hashBang);
      this.fragment = this.hash;
      this.build();
      return this;
    };
    
    url.build = function(){
      this.hostname = this.host;
      this.pathname = this.path;
      this.hash = this.fragment;
      this.query = this.search;
      this.href = this.protocol + '://'
          + ((this.user) ? this.user + ':' + this.password + '@' : '') + this.host
          + ((this.port != 80) ? ':' + this.port : '') + this.path
          + ((this.search) ? '?' + this.search : '')
          + ((this.fragment) ? '#' + this.fragment : '');
      this.samePage = (window.location.href.split('?')[0] == this.href.split('?')[0]);
      
      this.queryObj = this.query ? $.query.load('?'+ this.query).get()
          : {};
      
      var noQ = true;
      var exclude = new RegExp('/admin|devel/');
      if (!noQ && (this.path ? this.path : '').split(exclude).length < 2 && location.pathname != this.path) {
        this.queryObj.q = this.queryObj.q || (this.path ? this.path : '').substr(1);
      }
      
      var h = (this.hash ? this.hash : '').substr(1);
      //h = unescape(h);
      this.hashBang = this.hash && this.hash[0] == '!' ? $.query.load('#'+ unescape(h)).get() : {};
      this.hashBang = $.extend(this.hashBang, this.queryObj);
      
      this.hashBangFragment = $.hashbangParam(this.hashBang);
      this.hashBangHref = hbHref(this);
      return this;
    };
    /*

    function build() {
      url.hostname = url.host;
      url.pathname = url.path;
      url.hash = url.fragment;
      url.query = url.search;
      url.href = url.protocol + '://'
          + ((url.user) ? url.user + ':' + url.password + '@' : '') + url.host
          + ((url.port != 80) ? ':' + url.port : '') + url.path
          + ((url.search) ? '?' + url.search : '')
          + ((url.fragment) ? '#' + url.fragment : '');
          
      url.queryObj = url.query ? $.query.load('?'+ url.query).get()
          : {};
      
      var noQ = true;
      var exclude = new RegExp('/admin|devel/');
      if (!noQ && (url.path ? url.path : '').split(exclude).length < 2 && location.pathname != url.path) {
        url.queryObj.q = url.queryObj.q || (url.path ? url.path : '').substr(1);
      }
      
      var h = (url.hash ? url.hash : '').substr(1);
      //h = unescape(h);
      url.hashBang = url.hash && url.hash[0] == '!' ? $.query.load('#'+ unescape(h)).get() : {};
      url.hashBang = $.extend(url.hashBang, url.queryObj);
      
      url.hashBangFragment = $.hashbangParam(url.hashBang);
      url.hashBangHref = hbHref(url);
    }
    
*/
    url.build();
    return url;
  };
  
  function hbEnabled() {
    return !$('html').hasClass('no-hashchange') && !$('body').hasClass('no-hashbang');
  }
  
  
  function hbHref(url) {
    var hashBangFragment = $.hashbangParam(url.hashBang);
    var noQ = true;
    
    var s = url.search ? '?'+ url.search : '';
    if (!hbEnabled() && hashBangFragment) {
      var q = $.query.load('?'+ url.search).get();
      q = typeof q[ESCAPED_FRAGMENT] == 'string' ? $.query.load('?'+ q.hbnojs).get() : {};
      var h = $.query.load('#'+ hashBangFragment).get();
      var data = $.extend(q, h);
      delete data[ESCAPED_FRAGMENT];
      s = '?'+ESCAPED_FRAGMENT+'='+ $.hashbangParam(data).split('&').join(escape('&'));
    }
    else {
      hashBangFragment = hashBangFragment.split('&').join(escape('&'));
    }
    
    return url.protocol + '://'
        + ((url.user) ? url.user + ':' + url.password + '@' : '') + url.host
        + ((url.port != 80) ? ':' + url.port : '')
        + ((!url.hashBang.q || noQ) ? url.path : '/')
        + s
        + ((hashBangFragment && hbEnabled()) ? '#!'+ hashBangFragment : '');
  }
  
  
  
  
  
  
  
  function buildParams(prefix, obj, traditional, add) {
    if ($.isArray(obj) && obj.length) {
      // Serialize array item.
      $.each(obj, function(i, v) {
        if (traditional || rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, v);
          
        }
        else {
          // If array item is non-scalar (array or object), encode its
          // numeric index to resolve deserialization ambiguity issues.
          // Note that rack (as of 1.0.0) can't currently deserialize
          // nested arrays properly, and attempting to do so may cause
          // a server error. Possible fixes are to modify rack's
          // deserialization algorithm or to provide an option or flag
          // to force array serialization to be shallow.
          buildParams(prefix + "["
              + (typeof v === "object" || $.isArray(v) ? i : "") + "]", v,
              traditional, add);
        }
      });
      
    }
    else if (!traditional && obj != null && typeof obj === "object") {
      // If we see an array here, it is empty and should be treated as an empty
      // object
      if ($.isArray(obj) || $.isEmptyObject(obj)) {
        add(prefix, "");
        
        // Serialize object item.
      }
      else {
        for ( var name in obj) {
          buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
        }
      }
      
    }
    else {
      // Serialize scalar item.
      add(prefix, obj);
    }
  }
  
  /**
   * Tests if an object is realy empty
   */
  $.isEmptyObject = $.isEmptyObject || function(obj) {
    for ( var name in obj) {
      return false;
    }
    return true;
  };
  
  
  $.hashbangParam = function(a, traditional) {
    var s = [], add = function(key, value) {
      // If value is a function, invoke it and return its value
      value = $.isFunction(value) ? value() : value;
      s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
    };
    
    // Set traditional to true for $ <= 1.3.2 behavior.
    if (traditional === undefined) {
      traditional = $.ajaxSettings.traditional;
    }
    
    // If an array was passed in, assume that it is an array of form elements.
    if ($.isArray(a) || (a.jquery && !$.isPlainObject(a))) {
      // Serialize the form elements
      $.each(a, function() {
        add(this.name, this.value);
      });
      
    }
    else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for ( var prefix in a) {
        buildParams(prefix, a[prefix], traditional, add);
      }
    }
    
    // Return the resulting serialization
    return s.join("&").replace(r20, "+");
  };
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if (typeof Drupal.hashbang == 'undefined') {
    Drupal.hashbang = {};
    
    Drupal.hashbang = (function(hb) {
      var Ds = Drupal.settings
        ,DCA = Drupal.CTools.AJAX
      ;

      $(window).load(function(){
        $(window).trigger('hashchange');
      });      
      
      var methods = {};
      
      methods.hashBang = function() {
        hb.state.hashBang = hb.state.hashBang || {};
        if (arguments && arguments.length == 1) {
          //C.log('Setting new hashBang', arguments[0]);
          if (arguments[0].basePath) {
            C.warn('arguments: %o', arguments);
          }
          
          

          
          hb.state.hashBang = arguments[0];
          
          var url = $.hashbangParseURL();
          
          url.hashBang = $.extend(url.hashBang, hb.state.hashBang);
          
          var h = hbHref(url);
          
          var redirection = hbEnabled();
          if (redirection) {
            redirection = h;
          }
          
          else {
            C.info('May need to redirect to: ', hbHref(url));
            hb('attachBehaviors', document, url.hashBang, Drupal.settings);
          }
          
          
          
          if (redirection) {
            location.href = redirection;
          }
          
        }
        return hb.state.hashBang;
      };
      
      methods.data = function() {
        // C.warn('Deprecate call on data');
        if (arguments[0]) {
          //C.log('Updating window data storage');
          $(window).data('hashBang', arguments[0]);
        }
        var o = $(window).data('hashBang');
        o = o || {};
        return o;
      };
      
      methods.location = function() {
        return $.hashbangParseURL().hashBang;
      };
      
      
      
      
      
      
      
      
      /**
       * Utility method to manipulate URL / href / link elements
       * This method should be accessible as a jQuery plugin.
       * @returns self
       */
      methods.aHashbang = $.fn.hashBang = function() {
        var args = $.makeArray(arguments)
        ,self = this
        ,$this = false
        ,ESCAPED_FRAGMENT = ESCAPED_FRAGMENT || Drupal.settings.hashbang.ESCAPED_FRAGMENT
        ;
        
        if (self === window) {
          // //C.log('Not jQuery plugin behavior');
        }
        else {
          $this = $(self);
          $this.attr('data-url', $this.attr('href'));
          if (hbEnabled()) {
            $.each(self, function(){
              var $l = $(this);
              var url = $l.attr('href')
              .split('&'+ ESCAPED_FRAGMENT +'=').join('#!')
              .split('?'+ ESCAPED_FRAGMENT +'=').join('#!');
              $l.attr('href', url);
            });
          }
        }
        
        
        if (!args.length) {
          return self;
        }
        
        var action = args.shift();
        if (typeof action == 'string') {
          
          // if there's nothing else than a string, we parse it and return the hashBang part
          if (!args.length) {
            return $.hashbangParseURL(action).hashBang;
          }
          
          // if there's more arguments...
          switch (action) {
            case 'set':
              switch (typeof args[0]) {
                case 'object':
                  // extending the hashBang of the link with the object passed
                  break;
                case 'string':
                  // setting the hashBang property (args[0]) to the value args[1]
                  break;
              }
              
              // rewrite the link URL with the new hashBang object
              
              break;
          }
        }
        
        if ($this) {
          
        }
        return self;
      };
//      // makes methods.aHashBang() a jQuery Plugin
//      $.fn.hashBang = methods.aHashbang;
      
      
      
      
      
      
      
      
      
      /**
       * Checks if the hashBang has changed between two versions
       * @param newHB
       * @returns {Boolean}
       */
      methods.hasChange = function(oldHB, newHB) {
        //C.log("hb('hasChange', old %o, new %o)", oldHB, newHB);
        oldHB = oldHB && typeof oldHB == 'object' ? oldHB : hb('data');
        newHB = newHB && typeof newHB == 'object' ? newHB : hb('location');
        //C.log("      old %o, new %o)", oldHB, newHB);
        
        // obviously...
        if (newHB.length != oldHB.length) {
          //C.log('      returns true');
          return true;
        }
        
        // to be 100% sure, we need to test the keys of
        // both newHB and oldHB
        for (var k in newHB) {
          if (methods.propHasChange(k, oldHB, newHB)) {
            //C.log('      returns true (%s)', k);
            return true;
          }
        }
        
        for (var k in oldHB) {
          if (methods.propHasChange(k, oldHB, newHB)) {
            //C.log('      returns true (%s)', k);
            return true;
          }
        }
        //C.log('      returns false');
        return false;
      };
      
      
      
      
      /**
       * Checks if a property of the hashBang has changed between two versions
       * @param propName
       * @param oldHB
       * @param newHB
       * @returns {Boolean}
       */
      methods.propHasChange = function(propName, oldHB, newHB) {
        //C.log("propHasChange(name %o, old %o, new %o)", propName, oldHB, newHB);
        oldHB = oldHB && typeof oldHB == 'object' ? oldHB : hb('data');
        newHB = newHB && typeof newHB == 'object' ? newHB : hb('location');
        //C.log("    returns: ", oldHB[propName] != newHB[propName]);
        return oldHB[propName] != newHB[propName];
      };
      
      
      /**
       * Calls all hashbang behaviors
       * @param context
       * @param params
       * @param force
       */
      methods.attachBehaviors = function(context, params, force) {
        // does not make sens to run the scripts if nothing has changed
        // but... we may force...
        var changed = hb('hasChange');
        if (!changed && !force) {
          return;
        }

        context = context || document;
        params = params || hb();
        jQuery.each(hb.behaviors, function() {
          this(context, params, Ds);
        });
      };
      
      
      
      
      
      /**
       * Utility for AJAX call reponse handling
       * @param data
       * @param url
       */
      methods.respond = function(data, url) {
        for (i in data) {
          if (data[i]['command'] && DCA.commands[data[i]['command']]) {
            DCA.commands[data[i]['command']](data[i]);
          }
        }
      };
      
      
      
      
      
      
      
      
      
      hb = function() {
        var args = $.makeArray(arguments);
        var method = args.shift();
        switch (typeof method) {
            
          case 'string':
            //C.log('Calling %s', method, args);
            args = args.length ? args : [];
            
            // Method calling logic
            if (methods[method]) {
              returned = methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            else {
              C.warn('Method ' + method + ' does not exist');
              returned = false;
            }
            break;
            
          // acts as a shortcut for hb('hashBang', Object method);
          case 'object':
            methods.hashBang(method);
            returned = methods.hashBang();
            break;
            
          // acts as a shortcut for hb('hashBang');
          case 'undefined':
            returned = hb('hashBang');
            break;
        }

        //C.log('method: %o, returned: %o', method, returned);
        
        return returned;
      };
      
      hb.enabled = hbEnabled;
      hb.state = {};
      hb.variables = {};
      hb.state.hashBang = $.hashbangParseURL().hashBang;
      hb.states = Ds.hashbang && Ds.hashbang.states ? Ds.hashbang.states : {};
      hb.behaviors = {
        
//        pageContent: function(context, params, settings){
//          if (hb('propHasChange', 'q', hb('data'), params)) {
//            //C.log('Should load new content for q=%s, data: %s, location: %s', params.q, hb('data').q, hb('location').q);
//          }
//        }
        
      };
      
      return hb;
    })(Drupal.hashbang);
  }
  
  
  
  
  
  
  function hashchanged(e, context) {
    if (!Drupal.hashbang('hasChange')) {
      if (typeof $b == 'undefined') {
        $b = $('body');
      }
      //C.log('hashchange: nothing changed?????');
      if (typeof $b != 'undefined' && $b.hasClass('hashbang-initialized')) {
        return;
      }
    }
    
    var newHB = Drupal.hashbang('location');
    var oldHB = Drupal.hashbang('data');
    Drupal.hashbang('attachBehaviors', context, newHB, Drupal.settings);
    Drupal.hashbang('data', newHB);
    $b.addClass('hashbang-initialized');
  }
  
  
  
  Drupal.behaviors.hashbangListen = function(context) {
    //if ($('html.hashbang-processed').length) {
    if ($('html.hashbang-processed').length || !hbEnabled()) {
      // //C.log('Hashbang processed');
      return;
    }
    $('html').addClass('hashbang-processed');
    
    
    
    
    
    var hb = Drupal.hashbang;
    var newHB = {};
    try {
      C.info(typeof Drupal.hashbang);
      newHB = Drupal.hashbang();
    } catch (e) {}
    
    
    
    
    
    $(window)
      .unbind('hashchange')
      .bind('hashchange', hashchanged);

  };
  
  Drupal.behaviors.hashbangLinks = function(context) {
    var hb = Drupal.hashbang
    ,ESCAPED_FRAGMENT = ESCAPED_FRAGMENT || Drupal.settings.hashbang.ESCAPED_FRAGMENT
    ;
    var $links = $('a[href*='+ ESCAPED_FRAGMENT +'], .hashbang', context)
      .filter(':not(.hashbang-link-processed)')
      .filter(':not([href*=devel])')
      .filter(':not([href*=admin])')
    ;
    
    try {
      $links.hashBang();
    } catch (e) {}
    
    $links = $links
      .addClass('hashbang-link-processed')
      .each(function(){
        $(this)
          .data('hb', hb('aHashbang', $(this).attr('href')))
          .click(function(){
            var targetPath = $(this).attr('href').split('#')[0].split('?')[0];
            C.info('target path: %o, pathname: %o, same? %b', targetPath, window.location.pathname, targetPath == window.location.pathname);
            
            var vars = $(this).data('hb');
            
            
            if (!hbEnabled() && window.location.pathname == targetPath) {
              var q = vars[ESCAPED_FRAGMENT];
              var params = q ? $.query.load('?'+ q).get() : false;
              
              C.info(vars, q, params);
              if (!q && typeof vars == 'object') {
                params = vars;
              }
              
              if (params) {
                
                C.info('Staying on ', targetPath, params);
                window.location.hash = '';
                Drupal.hashbang('attachBehaviors', this, params, Drupal.settings);
                
                
                hb('data', params);
                /*
                */
                hashchanged({}, this);
                
              }
              return false;
            }
            
            else if (!targetPath || !targetPath == '/' || window.location.pathname != targetPath) {
              C.info('Redirecting to ', targetPath, vars);
              return true;
            }
            
            hb(vars);
            return false;
          });
      })
      //.css('background-color', 'red')
      ;
    //C.log('hashbang links: %o', $links);
  };
  
})(jQuery);