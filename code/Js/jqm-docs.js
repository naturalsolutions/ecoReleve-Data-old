  var _gaq = _gaq || [];
  $(document).ready(function(e) {
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + 
                  '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
    }); 

  $('[data-role=page]').live('pageshow', function (event, ui) {
    try {
      _gaq.push(['_setAccount', 'UA-827525-9']);
      console.log($.mobile.activePage.attr("data-url"));
      if ($.mobile.activePage.attr("data-url")) {
        _gaq.push(['_trackPageview', $.mobile.activePage.attr("data-url")]);
      } else {
        _gaq.push(['_trackPageview']);
      }
    } catch(err) {}
  });



//Réduction de la page de navigation après utilisation
$(function(){
	$('body').delegate('.content-secondary .ui-collapsible-content', 'click',  function(){
		$(this).trigger("collapse");
	});
});

// affiche la version de jQM
$(document).bind( 'pageinit', function() {
	var version = $.mobile.version || "dev",
		words = version.split( "-" ),
		ver = words[0],
		str = (words[1] || "Final"),
		html = ver;

	if( str.indexOf( "rc" ) == -1 ){
		str = str.charAt( 0 ).toUpperCase() + str.slice( 1 );
	} else {
		str = str.toUpperCase().replace(".", "");
	}

	if ( $.mobile.version && str ) {
		html += " <b>" + str + "</b>";
	}

	$( "p.jqm-version" ).html( html );
});

// Désactiver AJAX pour la navigation des fichiers locaux
if ( location.protocol.substr(0,4)  === 'file' ||
     location.protocol.substr(0,11) === '*-extension' ||
     location.protocol.substr(0,6)  === 'widget' ) {

  // Commencez avec des liens avec seulement un slash final et qui ne sont pas des liens externes
  var fixLinks = function() {
    $( "a[href$='/'], a[href='.'], a[href='..']" ).not( "[rel='external']" ).each( function() {
      this.href = $( this ).attr( "href" ).replace( /\/$/, "" ) + "/index.html";
    });
  };

  // corriger les liens de la page initiale
  $(fixLinks);

  // corriger les liens pour les chargements ultérieures de page AJAX
  $(document).bind( 'pagecreate', fixLinks );

  // Vérifie pour voir si AJAX peut être utilisé. Cela fait une requête rapide ajax et bloque la page jusqu'à ce soit fait
  $.ajax({
    url: '.',
    async: false,
    isLocal: true
  }).error(function() {
    // Ajax ne fonctionne pas donc on le désactive
    $( document ).bind( "mobileinit", function() {
      $.mobile.ajaxEnabled = false;

      var message = $( '<div>' , {
        'class': "ui-footer ui-bar-e",
        style: "overflow: auto; padding:10px 15px;",
        'data-ajax-warning': true
      });

      message
        .append( "<h3>Remarque : Il est possible que la navigation ne fonctionne pas si la documentation est visualisée localement</h3>" )
        .append( "<p>La navigation axée AJAX qui est utilisée dans la documentation de jQuery Mobile peut avoir besoin d'être visualisée sur un serveur web pour fonctionner dans certains navigateurs. Si vous voyez un message d'erreur lorsque vous cliquez sur un lien, essayez un autre navigateur ou <a href='https://github.com/jquery/jquery-mobile/wiki/Downloadable-Docs-Help'>consultez l'aide</a>.</p>" );

      $( document ).bind( "pagecreate", function( event ) {
        $( event.target ).append( message );
      });
    });
  });
} else {
  $( document ).bind( "mobileinit", function() {

    var entete = $( '<div>' , {
          'class': "ui-bar ui-bar-a"
         });

    entete
      .append( "<h1>JQuery Mobile, documentation en français   </h1>" )
      .append( "<a href='http://www.jquery-fr.com' class='ui-btn-right' data-mini='true'>Documentation française jQuery</a>" )
      .append( "<a href='http://www.jquery-fr.com/forum' class='ui-btn-right' data-mini='true'>Forum français dédié à jQuery</a>" );

    var infoadd = $( '<p>' , {
          'class': "info-add"
         });

    infoadd
      .append( "<a href='https://github.com/forresst/jquery-mobile-fr_FR'>(Projet de la documentation en français)</a>" );

    // Entête pour le site mobile.jquery-fr.com
    $( 'div.type-home' ).live( 'pagebeforecreate',function(event){
      $( "div.type-home" ).prepend( entete );
      $( "div.footer-docs" ).append( infoadd );
    });

    $( 'div.type-interior' ).live( 'pagebeforecreate',function(event){
      $( "div.type-interior" ).prepend( entete );
      $( "div.footer-docs" ).append( infoadd );
    });

    $( 'div.type-index' ).live( 'pagebeforecreate',function(event){
       $( "div.type-index" ).prepend( entete );
       $( "div.footer-docs" ).append( infoadd );
    });
  });
}
