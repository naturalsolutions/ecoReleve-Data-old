ecoRelevé
=========

A free and open source biodiversity data management software.
-------

![ecoReleve](http://ecoreleve.googlecode.com/files/ecoreleve%20logo%20small.jpg)

A biodiversity data team have different actors:

Field Worker: that actually run the data collection and data entries
Data administrator: that maanage the database and decide upon thesaurus and  taxonomy 
Scientist: Formalize ecological questions and data gathering processes

The module in ecoReleve are built around these roles with a diffrent module for each use cases:


* ecoRelevé Mobile : designed for field data entry and field workers
* ecoRelevé Explorer : designed for data exploration and scientist
* ecoRelevé Concepts : designedfor data admin
* ecoReleve Core: the backend database management system

* [.pod](http://search.cpan.org/dist/perl/pod/perlpod.pod) -- `Pod::Simple::HTML`
  comes with Perl >= 5.10. Lower versions should install Pod::Simple from CPAN.



Contributing
------------

Want to contribute? Great! 


1. Fork it.
2. Create a branch (`git checkout -b my_markup`)
3. Commit your changes (`git commit -am "Added Snarkdown"`)
4. Push to the branch (`git push origin my_markup`)
5. Open a [Pull Request][1]
6. Enjoy a refreshing Diet Coke and wait
7. Send us an email contact at natural-solutions.eu


Installation
-----------

    gem install github-markup


Usage
-----

    require 'github/markup'
    GitHub::Markup.render('README.markdown', "* One\n* Two")

Or, more realistically:

    require 'github/markup'
    GitHub::Markup.render(file, File.read(file))


Testing
-------

To run the tests:

    $ rake

To add tests see the `Commands` section earlier in this
README.







