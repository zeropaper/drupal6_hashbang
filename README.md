Hashbang concept library for Drupal 6
============================

Aims and goals
----------------------
The main goal of this module is to provide tools for developers who want to make use of the hashbang as described on
http://code.google.com/web/ajaxcrawling/index.html

Warning
---------
The module is already used in some of my websites, but the lack of time to document it might be confusing/frustrating if you try to install it right now.  
This module will probably never be a "out of the box" solution but a kind of framework instead.
Now that you are warned...

Install
---------
Put the module folder in your preferred modules directory (sites/all/modules, profiles/yourprofile/modules, ...)
Enable it.

Usage
----------
You may declare hashbang behaviors (similar to the Drupal.behaviors system) like:

    /**
     * @param DOM element
     *  Just like by Drupal.behaviors
     * @param object
     *  An object representation of what follows #! in a hashbang URL
     * @param object
     *  The Drupal.settings object
     */
    Drupal.hashbang.behaviors.myHashbangBehavior = function(context, params, settings) {
      // do something
    };

@todo some usage examples (perhaps even a small module) 