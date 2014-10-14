/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referring to this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'reneco-font\'">' + entity + '</span>' + html;
	}
	var icons = {
		'reneco.layers': '&#xe648;',
		'reneco.rings': '&#xe645;',
		'reneco.markers': '&#xe646;',
		'reneco.male': '&#xe647;',
		'reneco.user': '&#xe605;',
		'reneco.users': '&#xe600;',
		'reneco.distance': '&#xe601;',
		'reneco.protocol': '&#xe602;',
		'reneco.time': '&#xe603;',
		'reneco.bird': '&#xe604;',
		'reneco.settings': '&#xe606;',
		'reneco.reneco_icons-66': '&#xe607;',
		'reneco.validated': '&#xe608;',
		'reneco.syncing': '&#xe609;',
		'reneco.leftarrow': '&#xe60a;',
		'reneco.rightarrow': '&#xe60b;',
		'reneco.add': '&#xe60c;',
		'reneco.close': '&#xe60d;',
		'reneco.search': '&#xe60e;',
		'reneco.favorite': '&#xe60f;',
		'reneco.timeoutline': '&#xe610;',
		'reneco.time3': '&#xe611;',
		'reneco.pin': '&#xe612;',
		'reneco.rewind': '&#xe613;',
		'reneco.play': '&#xe614;',
		'reneco.forward': '&#xe615;',
		'reneco.emitters': '&#xe616;',
		'reneco.protocol2': '&#xe617;',
		'reneco.edit': '&#xe618;',
		'reneco.sheet': '&#xe619;',
		'reneco.sheet2': '&#xe61a;',
		'reneco.pin2': '&#xe61b;',
		'reneco.female': '&#xe61c;',
		'reneco.id': '&#xe61d;',
		'reneco.search2': '&#xe61e;',
		'reneco.individual': '&#xe61f;',
		'reneco.graphs': '&#xe620;',
		'reneco.menu': '&#xe621;',
		'reneco.elevage': '&#xe622;',
		'reneco.free': '&#xe623;',
		'reneco.observation': '&#xe624;',
		'reneco.selectarea': '&#xe625;',
		'reneco.drag': '&#xe626;',
		'reneco.calendar': '&#xe627;',
		'reneco.satellite': '&#xe628;',
		'reneco.report': '&#xe629;',
		'reneco.fit': '&#xe62a;',
		'reneco.bird2': '&#xe62b;',
		'reneco.child': '&#xe62c;',
		'reneco.adult': '&#xe62d;',
		'reneco.trash': '&#xe62e;',
		'reneco.sensors': '&#xe62f;',
		'reneco.individuals': '&#xe630;',
		'reneco.entrykey': '&#xe632;',
		'reneco.entry': '&#xe631;',
		'reneco.export': '&#xe633;',
		'reneco.import': '&#xe634;',
		'reneco.mydata': '&#xe635;',
		'reneco.sensorimport': '&#xe636;',
		'reneco.importfromsensor': '&#xe637;',
		'reneco.exportfromsensor': '&#xe638;',
		'reneco.map': '&#xe639;',
		'reneco.collectionbig': '&#xe63a;',
		'reneco.relevebig': '&#xe63b;',
		'reneco.trackbig': '&#xe63c;',
		'reneco.securitybig': '&#xe63d;',
		'reneco.thesaurusbig': '&#xe63e;',
		'reneco.homebig': '&#xe63f;',
		'reneco.homesmall': '&#xe640;',
		'reneco.relevesmall': '&#xe641;',
		'reneco.tracksmall': '&#xe642;',
		'reneco.thesaurussmall': '&#xe643;',
		'reneco.securitysmall': '&#xe644;',
		'reneco.site': '&#xe649;',
		'reneco.comment': '&#xe64a;',
		'reneco.write': '&#xe64b;',
		'reneco.fieldactivity': '&#xe64c;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/reneco.[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
