var ecoReleveData = (function(app) {
    "use strict";

    /*app.views.ContextualNavigation = app.views.BaseView.extend({
        template: 'contextual-nav',

        events: {
            'click a[data-key]': 'click'
        },

        serialize: function () {
            return {
                actions: _.chain(this.actions),
                roles: app.instances.currentUser.getRoles()
            };
        },

        click: function (e) {
            // TODO: Crappy code, refactoring would be much appreciated...
            var action, parts,
                key = $(e.target).data('key');
            if (key.indexOf('.') >= 0) {
                parts = key.split('.');
                if (parts.length === 3) {
                    action = this.actions[parts[0]].actions[parts[1]].actions[key];
                } else {
                    action = this.actions[parts[0]].actions[key];
                }
            } else {
                action = this.actions[key];
            }
            if (action.isButton()) {
                e.preventDefault();
                action.handler();
            }
        },

        setActions: function (actions) {
            this.actions = actions || {};
            this.render();
        }
    });
	*/
    app.views.BreadCrumbs = app.views.BaseView.extend({
        template: 'breadcrumbs',

        initialize: function () {
            this.context = '';
            //this.appName = document.title;
			var body_width = $(window).width(); 
            // stats displayed only for screens with width > 640
            if (body_width > 640 ){
            this.appName = "ecoReleve-data";
            } else {
                this.appName = "home";
            }


            this.listenTo(this.model, 'route', this.update);
            app.views.BaseView.prototype.initialize.apply(this, arguments);
        },

        serialize: function () {
            return {
                context: this.context,
                appName: this.appName
            };
        },

        update: function (name, args) {
            switch (name) {
            case 'home':
                this.context = '';  // home
                break;
            case 'entryStation':
				this.context = 'station';
                break;
			case 'export':
				this.context = 'export';
                break;
            case 'import':
                this.context = 'import';
                break;
			case 'allData':
				this.context = 'all data';
				break;
			case 'objects':
				this.context = 'objects';
				break;
			case 'argos':
				this.context = 'argos';
				break;
			case 'birds':
				this.context = 'individuals';
				break;
			case 'importLoad':
				this.context = '<a class="headerLink" href="#import">import</a> > load data';
				break;
			case 'importMap':
				this.context = '<a class="headerLink" href="#import">import</a> > map';
				break;
			case 'importMetadata':
				this.context = '<a class="headerLink" href="#import">import</a> > finish';
				break;

			case '':	
			 this.context = 'home';
                break;
            case 'stationType':
            this.context = '<a class="headerLink" href="#stationType">input</a> > station';
                break;
            case 'newStation':
            this.context = '<a class="headerLink" href="#stationType">input</a> > <span class="maskForSmall">new</span> station';
                break;
            case 'protoChoice':
            this.context = '<a class="headerLink" href="#stationType">input</a> > protocol <span class="maskForSmall">list</span>';
                break;
            case 'importedStation' : 
            this.context = '<a class="headerLink" href="#stationType">input</a> ><span class="maskForSmall">imported</span> station';
                break;
            case 'dataEntry':
            this.context = '<a class="headerLink" href="#stationType">input</a> ><a class="headerLink" href="#proto-choice">protocol</a><span class="maskForSmall"> > data entry</span>';
                break;
            case 'exportFilter':
				this.context = '<a class="headerLink" href="#export">export</a> > <span id="filterViewName">select data view<span>';
                break;
            case 'exportMap':
            	this.context = '<a class="headerLink" href="#export">export</a> > select a geographic extent';
                break;
            case 'exportFields':
            	this.context = '<a class="headerLink" href="#export">export</a> > select columns to display (<span id="filterViewName"></span>)';
                break;
            case 'exportResult' :
            	this.context = '<a class="headerLink" href="#export">export</a> > result';
                break;
            case 'myData':
                this.context = 'my data';
                break;


			/*default:
			this.context = 'home';
                break;*/
            }
            this.render();
        }
    });
    app.views.Navigation = app.views.BaseView.extend({
        template: 'navigation',
        events: {
            'click a': 'clickFollowLink'
        },
        initialize: function () {
            this.listenTo(this.model, 'route', this.update);
            app.views.BaseView.prototype.initialize.apply(this, arguments);
        },
        serialize: function () {
            // Placeholder, will be refined later on
            /*
			return {
                isAdmin: app.instances.currentUser.get('isAdmin')
            };
			*/
        },
        afterRender: function () {
            $('#nav-switch').on('click', this, function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.data.show();
            });
        },
        hide: function () {
            this.$el.hide();
            this.$el.off('click', this.clickCancelNav);
            $('body').removeClass('modal-open');
            $(".allDataFilterPanel").css("z-index",5000); 
            $("header.navbar.navbar-static-top").css("position","fixed");
        },
        show: function () {
            $('body').addClass('modal-open');
            this.$el.slideDown(800);
            this.$el.on('click', this, this.clickCancelNav);
			$("header.navbar.navbar-static-top").css("position","static");
            $(".allDataFilterPanel").css("z-index",0); 
        },
        clickFollowLink: function (e) {
            e.stopPropagation();
            this.hide();
        },
        clickCancelNav: function (e) {
            e.stopPropagation();
            e.preventDefault();
            // /!\ event handler bound using jQuery's .on() method, "this" refers to the event target
            e.data.hide();
			$("header .navbar-static-top").css("position","fixed");
        },
        update: function (name, args) {
        // to update
		/*
		this.$el.find('.active').removeClass('active');
            switch (name) {
            case 'listSamples':
            case 'viewSample':
            case 'newSample':
            case 'editSample':
            case 'newSubject':
            case 'editSubject':
                this.$el.find('[data-model="sample"]').addClass('active');
                break;
            case 'listSampleTypes':
            case 'viewSampleType':
            case 'editSampleType':
                this.$el.find('[data-model="sampletype"]').addClass('active');
                break;
            case 'listSubjectTypes':
            case 'viewSubjectType':
            case 'editSubjectType':
                this.$el.find('[data-model="subjecttype"]').addClass('active');
                break;
            case 'listEventTypes':
            case 'viewEventType':
            case 'editEventType':
                this.$el.find('[data-model="eventtype"]').addClass('active');
                break;
            }
        */
		}
    });


    return app;
})(ecoReleveData);